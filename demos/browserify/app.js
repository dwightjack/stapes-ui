var Ui = require('./../../dist/stapes-ui');

//using jQuery
Ui.$ = require('jquery');

var MyMod = Ui.Module.subclass({
    render: function () {
        this.$el
            .css('color', this.options.color)
            .text('Hi ' + this.get('name'));
        return this;
    }
});

new MyMod({
    el: '#test-block',
    color: 'blue',
    data: {
        name: 'John'
    }
}).render();
