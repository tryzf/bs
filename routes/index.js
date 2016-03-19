
/*
 * GET home page.
 */
 var crypto = require("crypto");
 User = require("../models/user.js");
 Post = require("../models/post.js");
 SetBase = require("../models/setBase.js");
 Comment = require('../models/comment.js');
var formidable = require('formidable');
var fs = require('fs');
var async = require('async');

 module.exports = function(app) {
 	app.get('/', function (req, res) {
 		var page = req.query.p ? parseInt(req.query.p) : 1;

 		Post.getTen(null, page, function(err, posts, total) {
 			if(err) {
 				posts = [];
 			}
	 		res.render('index', { 
	 			title: '主页',
	 			user: req.session.user,
	 			posts: posts,
	 			page: page,
	 			hot_list: this.Post.hot_list,
	 			isFirstPage: (page -1 ) == 0,
	 			isLastPage: ((page -1 ) * 3 + posts.length ) == total
	 		});
 		});
 	});
 	app.get('/hot_blog', function(req, res){
 		Post.get_hot_blog(function(err, doc){
 			if(err) {
 				res.json({'error': '获取错误！'});
 				return;
 			}
 			res.json({'result': doc});
 		});
 	});
 	app.get('reg', checkNotLogin);
 	app.get('/reg', function (req, res) {
 		res.render('reg', {
 		 	title: '注册',
 		 	user: req.session.user
 		});
 	});
 	app.get('/login', checkNotLogin);
 	app.get('/login', function(req, res) {
 		res.render('login', { title: '登录'});
 	});

	app.get('/post', checkLogin);
 	app.get('/post', function(req, res) {
 		res.render('post', { 
 			title: '发表文章',
 			user: req.session.user 
 		});
 	});


 	app.post('/post', checkLogin);
 	//文章发布
 	app.post('/post', function(req, res) {
 		var currentUser = req.session.user,
 			tags_text = req.body.tags || '闲谈',
	 		tags_array = tags_text.split(';') || tags_text.split('；'),
	 		tags = [],
	 		post = req.body.post,
	 		title = req.body.title;
	 	
	 	if(!(post && title)) {
	 		res.json({'error': '标题或内容不能为空！'});
	 		return;
	 	}
 		for( i in tags_array){
	 		tags.push(tags_array[i]);
	 	}
 		var	post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
 		post.save(function(err) {
 			if(err) {
 				throw err;
 				return res.redirect('/');

 			}
 			res.jsonp({'success':'发布成功！'});
 		});

 	});


 	//注销用户
 	app.get('/logout', function(req, res) {
 		req.session.user = null;
 		res.redirect('/');
 	});

 	//文件上传
 	app.get('/upload', checkLogin);
 	app.get('/upload', function(req, res) {
 		res.render('admin/upload', {
 			'title': '文件上传'
 		});
 	});
 	app.post('/upload',function(req, res, next){
 		var form = new formidable.IncomingForm();
 		    form.encoding = 'utf-8'; 
	    	form.uploadDir = 'uploads/';
	    	form.keepExtensions = false;
	    	form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

	    form.parse(req, function(err, fields, files) {
		    var extName = '';
		    if(files.file1['type'] != 'image/png') {
		    	res.jsonp({'error': '目前只支持png格式'});
		    }else {
		    	extName = 'png';
		    }
	    
		    var numbers = String(Math.random());
	    	var avatarName = numbers.split('.')[1] + '.' + extName;
        	var newPath = form.uploadDir + avatarName;
        	
        	fs.renameSync(files.file1.path, newPath);
        	res.jsonp({'success': '上传成功！','url':newPath});
	    });		
	    	
	
 	});


 	app.post('/login', checkNotLogin);
//用户登录
 	app.post('/login', function(req, res) {
 		var md5 = crypto.createHash('md5'),
 			password = md5.update(req.body.password).digest('hex');
 		User.get(req.body.name, function(err, user){
 			if(!user) {
 				res.jsonp({'error': '用户不存在！'});
 				return false;
 			}
 			if(user.password != password){
 				res.jsonp({'error': '密码不正确！'});
 				return false;
 			}
 			req.session.user = user;
 			res.jsonp({'success': '登录成功！'});
 		});
 	}); 	


 	app.post('/reg', checkNotLogin);

 	//用户注册
 	app.post('/reg', function(req, res) {
 		var name = req.body.name,
 			password = req.body.password,
 			password_sure = req.body.password_sure,
 			email = req.body.email;
 			email_result = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(email);
 		if(password !== password_sure){
			res.json({'error':'密码不一致!'});
			return false;		
 		}
 		if(!email_result) {
 			res.json({'error': '邮箱格式不正确！'});
 			return false;
 		}

 		var md5 = crypto.createHash('md5'),
 			password = md5.update(req.body.password).digest('hex');
 		var newUser = new User({
 			name: name,
 			password: password,
 			email: email
 		});
 		User.get(newUser.name, function(err, result) {
 			if(err) {
 				throw err;
 				return res.redirect('/');
 			}
 			if(result) {
 				res.jsonp({'error':'用户名已经存在！'});
 				return false;
 			}
 			newUser.save(function(err, user){
 				if(err) {
 					throw err;
 					return res.redirect('/reg');
 				}
 				req.session.user = user;
 				res.jsonp({'success':'注册成功！'});
 			
 			});
 		});
 	});

 	app.get('/search', function(req, res) {
 		Post.search(req.query.keyword, function(err, posts){
 			if(err) {
 				return res.redirect('/');
 			}
 			res.render('search', {
 				title: 'SEARCH:' + req.query.keyword,
 				posts: posts,
 				user: req.session.user
 			});
 		});
 	});


 	//获取某个人的所有文章

 	app.get('/u/:name', function(req, res) {

 		var page = req.query.p ? parseInt(req.query.p) : 1;

 		User.get(req.params.name, function(err, user) {
 			if(!user) {
 				return res.redirect('/');
 			}
 			Post.getTen(user.name, page, function(err, post, total) {
 				if(err) {
 					return res.redirect('/');
 				}
 				res.render('user', {
 					title: user.name,
 					posts: post,
 					page: page,
 					isFirstPage: (page = 1) ==0,
 					isLastPage: ((page - 1) * 3 + post.length) == total,
 					user: req.session.user
 				});
 			});
 		});
 	});


	//获得文章详情.
	app.get('/u/:name/:day/:title', function(req, res) {
		Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post){

			if(err) {
				return res.redirect('/');
			}
			res.render('article', {
				title: req.params.title,
				post: post,
				user: req.session.user
			});
		});
	});

	app.get('/edit/:name/:day/:title', checkLogin);
	app.get('/edit/:name/:day/:title', function(req, res) {
		var currentUser = req.session.user;
		Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post) {
			if(err) {
				return res.redirect('back');
			}
			res.render('admin/edit', {
				title: '编辑',
				post: post,
				user: req.session.user
			});
		});
	});

	app.post('/edit/:name/:day/:title', checkLogin);
	app.post('/edit/:name/:day/:title', function(req, res){
		var currentUser = req.session.user;
		Post.update(currentUser.name, req.params.day, req.params.title, req.body.post,
		function(err){
			var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
			if(err) {
				return red.redirect(url);
			}
				res.jsonp({
					'url': url,
					'success': '成功'
				});
			// res.redirect('/');
		});
	});

	app.get('/remove/:name/:day/:title', checkLogin);
	app.get('/remove/:name/:day/:title', function(req, res){
		var currentUser = req.session.user;
		Post.remove(currentUser.name, req.params.day, req.params.title, function(err){
			if(err) {
				return res.redirect('back');
			}
			res.jsonp({'success':'删除成功！'});
		})
	});

	//留言
	app.post('/u/:name/:day/:title', function(req, res) {
		var date = new Date(),
			time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' '+
				date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		var comment = {
			name: req.body.name,
			email: req.body.email,
			website: req.body.website,
			time: time,
			content: req.body.content
		};
		var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
			newComment.save(function(err) {
				if(err) {
					return res.redirect('back');
				}
				res.redirect('back');
			});	
	});

	//获取文章列表
	app.get('/archive', function(req, res) {
		Post.getArchive(function(err, posts) {
			if(err) {
				return res.redirect('/');
			}
			res.render('archive', {
				title:'文章列表',
				user: req.session.user,
				posts: posts
			});
		});
	});

	//根据标签分类
	app.get('/tags', function(req, res) {
		Post.getTags(function(err, posts) {
			if(err) {
				return res.redirect('/');
			}
			res.render('tags', {
				title: '标签',
				posts: posts,
				user: req.session.user
			});
		});
	});

	//获取某个分类的所有文章
	app.get('/tags/:tag', function(req, res) {
		Post.getTag(req.params.tag, function(err, posts) {
			if(err) {
				return res.redirect('/');
			}
			res.render('tag', {
				title: 'TAG' + req.params.tag,
				posts: posts,
				user: req.session.user
			});
		});
	});

	app.get('/base', checkLogin);
	app.get('/base', function(req, res) {
		res.render('admin/base',{
			"title" : '基本信息',
			"user"	: req.session.user
		});
	});

	app.post('/base', function(req, res) {
		var title = req.body.title;
		var name = req.session.user.name;
		var motto = req.body.motto;
		var newBase = new SetBase(name, title, motto); 
			if(!(title && motto)) {
				res.json({'error':'基本信息不能为空！'});
				return false;
			} 
			newBase.get(function(err, result){
				if(err) {
					res.redirect('back');
					return;
				}
				if(result) {
					newBase.update(function(err){
						if(err) {
							res.redirect('back');
							return;
						}
						res.json({'success': '更新成功！'});
						return;
					});
				}else{
					newBase.save( function(err){
						if(err){
							res.redirect('back');
							return;
						}
						res.json({success:'更改成功！'});
						return;
					});
				}
				
			})
	});

	//获取个人信息
	app.get('/get_info', function(req, res){
		var name = req.session.user ? req.session.user.name : null;
		var get_base = new SetBase(name);
		get_base.get(function(err, doc) {
			if(err){
				res.redirect('back');
				return false;
			}
			if(doc) {
				res.json({'success': doc});
				return false;
			}else{
				res.json({'error': '未登录！'});
			}
		});
	});

	//获取最新文章
	app.get('/new_blog', function(req, res){
		var name = ''
		Post.getAll(name, function(err, doc){
			if(err){
				throw err;
				return false;
			}
			res.json({'success': doc});
		});
	});



	//更改密码页
	app.get('/set_password', function(req, res){
		res.render('admin/set_password',{
			title: '更改密码',
			user: req.session.user
		});

	});	
	//set password
	app.post('/set_password', function(req, res){
		var name = req.session.user.name;
		var old_password = req.body.password;
		var new_password = req.body.new_password;
 		var md5 = crypto.createHash('md5'),
 			md5_02 = crypto.createHash('md5'),
 			password = md5.update(old_password).digest('hex'),
 			new_pass = md5_02.update(new_password).digest('hex');
		User.get(name, function(err, doc){
			if(err) {
				throw err;
				return false;
			}
			if(doc.password != password){
				res.json({'error':'原密码不正确！'});
				return false;
			}
			User.update(name, new_pass, function(err){
				if(err){
					throw err;
					return false;
				}
				req.session.user = null;
				res.json({'success': '更改成功！'});

			});


		});
	});



	app.use(function(req, res) {
		res.render('404');
	});

	function checkLogin(req, res, next) {
		if(!req.session.user) {
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if(req.session.user){
			res.redirect('back');
		}
		next();
	}

 };