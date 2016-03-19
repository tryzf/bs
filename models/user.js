var mongodb = require("./db");
var crypto = require('crypto');
var db = require('./getCollection');



function User(user) {
	this.name = user.name || null;
	this.password = user.password || null;
	this.email = user.email || null;
};

module.exports = User;

User.prototype.save = function(callback) {
	var md5 = crypto.createHash('md5');
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "http://www.gravatar.com/avatar/" + email_MD5 + '?s=48';
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		head: head
	};

	mongodb.open(function (err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			collection.insert(user, {
				safe: true
			},function (err, user) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				
				callback(null, user[0]);  //成功！
			});
		});
	});

}

User.get = function(name, callback) {
	mongodb.open(function (err, db) {
		if(err) {
			return callback(err);
		}

		db.collection("users", function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'name': name}, function(err, user){
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null, user);
			});
		});
	});
}
User.update = function(name, new_password, callback) {
	mongodb.open(function(err, db){
		if(err) {
			return callback(err);
		}
		db.collection("users", function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.update({'name': name}, {$set: { 'password':new_password}}, function(err){
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
}