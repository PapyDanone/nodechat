var express = require('express');
	path = require('path'),
	app = express(),
	connect = require('connect');
	
var sessionStore = new connect.session.MemoryStore();
var SITE_SECRET = 'I am not wearing any pants';

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.cookieParser(SITE_SECRET));
    app.use(express.session({
        key: 'express.sid'
      , store: sessionStore
    }));
    /*app.use(express.session({
	  store: new MongoStore({
	    db: 'nodechat',
	    host: '127.0.0.1',
	    port: 27017
	  })
	}));*/
});

var server = require('http').Server(app);
require('./lib/sockets')(server, SITE_SECRET, sessionStore);

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

