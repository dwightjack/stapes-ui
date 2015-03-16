var Ui = require('./../../dist/stapes-ui');


var MyMod = Ui.Module.subclass({
    render: function () {
        this.$el
            .css('color', this.options.color)
            .text('Hi ' + this.get('name'));
        return this;
    }
});

new MyMod({
    $el: Ui.$('#test-block'),
    color: 'blue',
    data: {
        name: 'John'
    }
}).render();
