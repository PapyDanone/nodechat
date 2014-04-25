var AppRouter = Backbone.Router.extend({

    routes: {
        ""              : "home",
        "chatroom"	    : "list",
        "messages/:id"	: "detail"
    },

    initialize: function () {
    	this.headerView = new HeaderView();
        $('body').append(this.headerView.el);
    },
    
    home: function () {
    	$("#content").html(new HomeView().el);
    	$("#messageForm").remove();
    	this.headerView.selectMenuItem('home');
    },

	list: function() {
		
		this.headerView.selectMenuItem('chatroom');
        
    	var messages = new MessageCollection();
        
        messages.fetch({
        	success: function() {
        		
        		var msgView = new MessagesView({
        			collection: messages, 
        			vent: vent,
        			socket: window.socket
        		});
        		
        		$("#content").html(msgView.el);
        		msgView.scroll();
        		
        		var view = new MessageFormView({
            		model: new Message(), 
            		collection: messages,
            		vent: vent
            	});
            	
            	$("div[role=main]").after(view.el);
        	},
        	error: function() {
        		console.debug('sa mer SEGPA');
        	}
        });
    },
    
    detail: function (id) {
        var message = new Message({_id: id});
        message.fetch({success: function(){
            $("#content").html(new MessageView({model: message, vent: vent}).el);
        }});
        //this.headerView.selectMenuItem();
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'MessageView', 'MessageFormView'], function() {
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