var express = require('express'),
    path = require('path'),
    http = require('http'),
    message = require('./routes/messages');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/messages', message.findAll);
app.get('/messages/:id', message.findById);
app.post('/messages', message.addMessage);
app.put('/messages/:id', message.updateMessage);
app.delete('/messages/:id', message.deleteMessage);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
