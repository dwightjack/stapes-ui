var Ui = require('./../../dist/stapes-ui');


//use zepto
Ui.$ = global.Zepto;


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
