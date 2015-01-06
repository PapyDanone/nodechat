window.Message = Backbone.Model.extend({

    urlRoot: "/messages",

    idAttribute: "_id",
    
    initialize: function () {
        this.validators = {};

        this.validators.message = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a message"};
        };

        this.validators.author = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a name"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },
    
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
        author: "",
        message: "",
        date: new Date().getTime()
    }
});

window.MessageCollection = Backbone.Collection.extend({

    model: Message,

    url: "/messages"

});