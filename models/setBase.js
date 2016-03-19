var mongodb = require("./db");

function SetBase(name, title, motto){
	this.name = name;
	this.motto = motto || '';
	this.title = title || '';
}

module.exports = SetBase;

SetBase.prototype.save = function(callback) {
	var base = {
			name  : this.name,
			title : this.title,
			motto : this.motto,
		}
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('base', function(err, collection) {
			if(err) {
				mongodb.close();
				return calllback(err);
			} 
			collection.insert(base, {
				safe:true
			},function(err) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				 callback(null);
			});
		});
	});
}
SetBase.prototype.get = function(callback) {
	var name = this.name;
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('base', function(err, collection) {
			if(err) {
				collection.close();
				return callback(err);
			}

			collection.findOne({'name':name}, function(err, doc){
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null, doc);
			});
		});

	});
}
SetBase.prototype.update = function (callback){
	var name = this.name,
		title = this.title,
		motto = this.motto;
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('base', function(err, collection){
			if(err) {
				return callback(err);
			}
			collection.update(
				{'name': name},
				{$set: {'title':title, 'motto': motto}},
				function(err){
					if(err) {
						return callback(err);
					}
					callback(null);
				});
		});
	});
}