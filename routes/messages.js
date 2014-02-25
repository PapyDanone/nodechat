var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('nodechat', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'nodechat' database");
        db.collection('messages', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'messages' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findAll = function(req, res) {
    db.collection('messages', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving message: ' + id);
    db.collection('messages', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.addMessage = function(req, res) {
    var message = req.body;
    console.log('Adding message: ' + JSON.stringify(message));
    db.collection('messages', function(err, collection) {
        collection.insert(message, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateMessage = function(req, res) {
    var id = req.params.id;
    var message = req.body;
    delete message._id;
    console.log('Updating message: ' + id);
    console.log(JSON.stringify(message));
    db.collection('messages', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, message, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating message: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(message);
            }
        });
    });
};

exports.deleteMessage = function(req, res) {
    var id = req.params.id;
    console.log('Deleting message: ' + id);
    db.collection('messages', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};