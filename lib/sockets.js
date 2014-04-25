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

module.exports = exports = function (node_server, SITE_SECRET, sessionStore) {

	var io = require('socket.io').listen(node_server);
	var connect = require('connect');
	
	io.set('authorization', function(data, accept){
		  /* NOTE: To detect which session this socket is associated with,
		   *       we need to parse the cookies. */
		  if (!data.headers.cookie) {
		    return accept('Session cookie required.', false);
		  }
		 
		  /* XXX: Here be hacks! Both of these methods are part of Connect's
		   *      private API, meaning there's no guarantee they won't change
		   *      even on minor revision changes. Be careful (but still
		   *      use this code!) */
		  /* NOTE: First parse the cookies into a half-formed object. */
		  data.cookie = require('cookie').parse(data.headers.cookie);
		  /* NOTE: Next, verify the signature of the session cookie. */
		  data.cookie = connect.utils.parseSignedCookies(data.cookie, SITE_SECRET);
		  
		  console.dir(data.cookie);
		 
		  /* NOTE: save ourselves a copy of the sessionID. */
		  data.sessionID = data.cookie['express.sid'];
		  /* NOTE: get the associated session for this ID. If it doesn't exist,
		   *       then bail. */
		  sessionStore.get(data.sessionID, function(err, session){
		    if (err) {
		      return accept('Error in session store.', false);
		    } else if (!session) {
		      return accept('Session not found.', false);
		    }
		    // success! we're authenticated with a known session.
		    data.session = session;
		    return accept(null, true);
		  });
		  return accept(null, true);
		});
	
	/**
	 * Initializations
	 */
	var clients = [];
	var clientCount = 0;

	/**
	 * Client actions
	 */
	io.sockets.on('connection', function (socket) {
		
		var hs = socket.handshake;
		console.log('A socket with sessionID '+hs.sessionID+' connected.');
		console.dir(hs);
		
		var intervalID = setInterval(function(){
		    hs.session.reload(function(){
		      hs.session.touch().save();
		    });
		  }, 60 * 1000);
		
		isClientConnected = true;
		clientCount++;
		
		var nickname = null;
		
	    // determine author
	    var lookup = clients.filter(function(v) {
	        return v.id === socket.id;
	    });
	    
	    if (0 < lookup.length) {
	    	nickname = lookup[0].nickname;
	    }
		
		socket.on('nickname', function (data) {
			clients.push({
				id: socket.id,
				nickname: data
			});
			
			nickname = data;
			hs.session.nickname = nickname;
			
			console.dir(clients);
		});
		
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
		    console.log('Author: ' + nickname);
		    
		    data.author = nickname;
		    
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
			console.log('A socket with sessionID '+hs.sessionID+' disconnected.');
		    clearInterval(intervalID);
			clientCount--;
			if (clientCount == 0) {
				isClientConnected = false; // no one is connected anymore
			}
		});
	  
	});
};