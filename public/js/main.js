var AppRouter = Backbone.Router.extend({

    routes: {
        //""            : "home",
        "messages"	  : "list"
    },

    initialize: function () {
        //$('.header').html(this.headerView.el);
    	var message = new Message();
    	this.messages = new MessageCollection();
    	
        $("#messageForm").html(new MessageFormView({
    		model: message, 
    		collection: this.messages,
    		vent: vent
    	}).el);
    },

	list: function() {
        
        var self = this;
        
        this.messages.fetch({
        	success: function() {
        		$(".messages").html(new MessagesView({
        			collection: self.messages, 
        			vent: vent
        		}).el);
        	},
        	error: function() {
        		console.debug('sa mer SEGPA');
        	}
        });
    }

});

utils.loadTemplate(['MessageView', 'MessageFormView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});

var vent = _.extend({}, Backbone.Events);

_.template.formatdate = function (stamp) {
    var d = new Date(stamp), // or d = new Date(date)
        day_fragments = [
            d.getDate(),
            d.getMonth() + 1,
            d.getFullYear()
        ]; 
        time_fragments = [
             d.getHours(),
             d.getMinutes(),
             d.getSeconds()
         ]; 
    return day_fragments.join('/') + ' ' + time_fragments.join(':');
};