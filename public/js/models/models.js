window.Message = Backbone.Model.extend({

    urlRoot: "messages",
    
    noIoBind: false,
    
    socket: window.socket,

    idAttribute: "_id",
    
    initialize: function () {
    	
        _.bindAll(this, 'serverUpdate', 'serverDelete');
        
        this.validators = {};

        this.validators.message = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a message"};
        };
        
        /* if we are creating a new model to push to the server we don't want
         * to iobind as we only bind new models from the server. This is because
         * the server assigns the id. */
        if (!this.noIoBind) {
        	this.ioBind('update', this.serverUpdate, this);
        	this.ioBind('delete', this.serverDelete, this);
        }
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    defaults: {
        _id: null,
        author: "default",
        message: "",
        date: new Date().getTime()
    },
    
    serverUpdate: function (data) {
    	console.debug('serverUpdate called');
        // Useful to prevent loops when dealing with client-side updates (ie: forms).
        data.fromServer = true;
        this.set(data);
    },
    
    serverDelete: function (data) {
    	
        if (this.collection) {
	        console.debug('collection');
	        this.collection.remove(this);
        } else {
	        console.debug('remove trigger');
	        this.trigger('remove', this);
        }
        
        this.modelCleanup();
    },
    
    modelCleanup: function () {
        this.ioUnbindAll();
        return this;
    }
});

window.MessageCollection = Backbone.Collection.extend({

    model: Message,

    url: "messages",
    
    socket: window.socket,
    
    initialize: function () {
        _.bindAll(this, 'serverCreate', 'collectionCleanup');
        this.ioBind('create', this.serverCreate, this);
    },
      
    serverCreate: function (data) {
    	console.debug('serverCreate called');
	    // make sure no duplicates, just in case
	    var exists = this.get(data._id);
	    
	    if (!exists) {
	      this.add(data);
	    } else {
	      data.fromServer = true;
	      exists.set(data);
	    }
    },
    
    collectionCleanup: function (callback) {
	    this.ioUnbindAll();
	    this.each(function (model) {
	      model.modelCleanup();
	    });
	    return this;
    }
});