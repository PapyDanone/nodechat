var MessagesView = Backbone.View.extend({
	
	tagName: "ul",
	
	className: "messages",

    initialize: function (options) {
    	console.debug('initialize');
    	_.bindAll(this, 'addMessageView', 'addBroadCastMessage');
    	this.vent = options.vent;
        this.render();
        this.listenTo(this.collection, "add", this.addMessageView);
    },
    
    addMessageView: function(message) {
    	
    	var view = new MessageView({model: message, vent: this.vent});
    	
    	$(this.el).append(view.el);
    },
    
    addBroadCastMessage: function (object) {
    	
    	this.addMessageView(new Message(object));
    },

    render: function () {
    	console.debug('rendering Messages'); 
    	
    	_.each(this.collection.models, this.addMessageView);

        return this;
    }
});

var MessageView = Backbone.View.extend({

    tagName: "li",
    
    events: {
        "click .edit": "edit",
        "click .delete": "removeMessage"
    },

    initialize: function (options) {
    	this.vent = options.vent;
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.remove, this);
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    edit: function () {
    	this.vent.trigger("editMessage", this.model);
    },
    
    removeMessage: function () {
    	if (confirm('Are you sure?')) {
	    	this.model.destroy({
	            success: function () {
	            	utils.showAlert('Success!', 'Message deleted successfully', 'alert-success');
	            }
	        });
    	} else {
    		return false;
    	}
    }

});

var MessageFormView = Backbone.View.extend({
	
	tagName: "div",
	
	className: "messageForm",

    initialize: function (options) {
    	console.debug('initializing form');
    	_.bindAll(this, "editMessage");
    	options.vent.bind('editMessage', this.editMessage);
        this.render();
    },

    render: function () {
    	console.debug('rendering form');
    	$(this.el).html(this.template(this.model.toJSON()));

        return this;
    },

    events: {
        "click .save": "beforeSave",
        "change": "change"
    },
    
    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.model.set('date', new Date().getTime());
        this.saveMessage();
        return false;
    },

    saveMessage: function () {
        var self = this;
        this.collection.create(
        	this.model, {
	            success: function (model) {
	                utils.showAlert('Success!', 'Message saved successfully', 'alert-success');
	                self.model = new Message();
	                self.render();
	            },
	            error: function () {
	                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
	            }
	         }
        );
    },
    
    editMessage: function (message) {
    	this.model = message;
        this.render();
    }
});