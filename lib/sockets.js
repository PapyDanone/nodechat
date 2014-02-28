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

module.exports = exports = function (node_server) {
	
	var io = require('socket.io').listen(node_server);
	
	/**
	 * Init
	 */
	var isClientConnected;
	var clientCount = 0;

	/**
	 * Client actions
	 */
	io.sockets.on('connection', function (socket) {
		
		isClientConnected = true;
		clientCount++;
		
		socket.on('messages:read', function (data, callback) {
			 db.collection('messages', function(err, collection) {
				 if (typeof data._id == 'undefined') {
					 collection.find().toArray(function(err, items) {
				         callback(null, items);
				     });
				 } else {
					 collection.findOne({'_id':new BSON.ObjectID(data._id)}, function(err, item) {
						 callback(null, item);
				     });
				 }
			 });
		});
		
		socket.on('messages:create', function (data, callback) {
		    console.log('Adding message: ' + JSON.stringify(data));
		    db.collection('messages', function(err, collection) {
		        collection.insert(data, {safe:true}, function(err, result) {
		            if (err) {
		                callback(null, {'error':'An error has occurred' + err});
		            } else {
		                console.log('Success: ' + JSON.stringify(result[0]));
		                socket.broadcast.emit('messages:create', result[0]);
		                callback(null, result[0]);
		            }
		        });
		    });
		});
		
		socket.on('messages:update', function (data, callback) {
		    console.log('Updating message: ' + JSON.stringify(data));
		    var id =  data._id;
		    delete data._id;
		    db.collection('messages', function(err, collection) {
		        collection.update({'_id':new BSON.ObjectID(id)}, data, {safe:true}, function(err, result) {
		            if (err) {
		                callback(null, {'error':'An error updating message' + err});
		            } else {
		                console.log('' + result + ' document(s) updated');
		                socket.broadcast.emit('messages/' + id + ':update', data);
		                callback(null, data);
		            }
		        });
		    });
		});
		
		socket.on('messages:delete', function (data, callback) {
		    console.log('Deleting message: ' + JSON.stringify(data));
		    db.collection('messages', function(err, collection) {
		        collection.remove({'_id':new BSON.ObjectID(data._id)}, {safe:true}, function(err, result) {
		            if (err) {
		                callback(null, {'error':'An error has occurred' + err});
		            } else {
		                console.log('' + result + ' document(s) deleted');
		                socket.broadcast.emit('messages/' + data._id + ':delete', data);
		                callback(null, data);
		            }
		        });
		    });
		});
		
		socket.on('disconnect', function(){
			clientCount--;
			if (clientCount == 0) {
				isClientConnected = false; // no one is connected anymore
			}
		});
	  
	});
};