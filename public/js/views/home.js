window.HomeView = Backbone.View.extend({
	
	socket: window.socket,
	
	events: {
		'click .start': 'checkNickname'
	},

    initialize:function () {
        this.render();
        _.bindAll(this, 'checkNickname');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },
    
    checkNickname: function () {
    	
    	console.debug('checknick!!');
    	
    	var value = $('#nickname').val();
    	
    	console.debug(value);
    	
    	if (value) {
    		window.socket.emit('nickname', value);
    		app.navigate('chatroom', {trigger: true});
    	}
    	
    	return false;
    }

});