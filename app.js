var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var routes = require('./routes/index');
var settings = require('./settings');
var user = require('./routes/user');
var bodyParser = require('body-parser')
var morgan = require('morgan');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('combined', {stream: accessLog}))

//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());


app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next){
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
	next();
});
app.use(cookieParser());



app.use(session({
	secret: settings.cookieSecret,
	key: settings.db,
	cookie: { maxAge: 1000*60*24*30 },
	store: new MongoStore({
		db: settings.db,
		host: settings.host,
		port: settings.port
	})
}));


app.use(app.router);
routes(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
