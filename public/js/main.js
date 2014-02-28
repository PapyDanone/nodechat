var AppRouter = Backbone.Router.extend({

    routes: {
        //""            : "home",
        "messages"	    : "list",
        "messages/:id"	: "detail"
    },

    initialize: function () {
        //$('.header').html(this.headerView.el);
    },

	list: function() {
        
    	var messages = new MessageCollection();
        
        messages.fetch({
        	success: function() {
        		$("#content").prepend(new MessagesView({
        			collection: messages, 
        			vent: vent,
        			socket: window.socket
        		}).el);
        	},
        	error: function() {
        		console.debug('sa mer SEGPA');
        	}
        });
        
        var view = new MessageFormView({
    		model: new Message(), 
    		collection: messages,
    		vent: vent
    	});
    	
    	$("#content").html(view.el);
    },
    
    detail: function (id) {
        var message = new Message({_id: id});
        message.fetch({success: function(){
            $("#content").html(new MessageView({model: message, vent: vent}).el);
        }});
        //this.headerView.selectMenuItem();
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

window.socket = io.connect('http://localhost:3000');