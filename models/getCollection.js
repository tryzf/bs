var mongodb = require('mongodb');

var db_server = new mongodb.Server('127.0.0.1', 27017);
var db = mongodb.Db('blog', db_server);
var _instance = null;
var collection_map = {};


db.on('close', function(){
	_instance = null;
	collection_map = {};
});

function get_opened_grid(mode, file_id, file_name, options, callback){
	file_id = (file_id || new mongodb.ObjectID()).toString();
	if (!_instance){
		db.open(function(err, db){
			if(err){
				throw err;
			}else{
				_instance = db;
				get_opened_grid(mode, file_id, file_name, options, callback);
			}
		});
	}else{
		var _file = new mongodb.GridStore(_instance, file_id, file_name, mode, options);
	
		_file.open(function(err, _file){
			if(err)throw err;

			callback(_file, file_id);
		});
	}
}

function get_collection(name, callback){
	var collection = collection_map[name];
	if (collection){
		callback(null, collection);
		return;
	}

	if (_instance == null){
		db.open(function(err, db){
			if(err){
				callback(err);
				return;
			}
			_instance = db;
			get_collection(name, callback);
		});
	}else{
		_instance.collection(name, function(err, collection){
				if(err){
				callback(err);
				return;
			}
			collection_map[name] = collection;
			get_collection(name, callback);
		});
	}
}



module.exports = {'get_collection': get_collection};