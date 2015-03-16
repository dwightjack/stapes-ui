require.config({
    paths: {
        // vendor
        jquery: '../../bower_components/jquery/dist/jquery',
        stapes: '../../bower_components/stapes/stapes',
        'stapes-ui': '../../dist/stapes-ui'
    }
});

require(['stapes-ui'], function (Ui) {

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

});


