require.config({
    paths: {
        // vendor
        stapes: '../../bower_components/stapes/stapes',
        'stapes-ui': '../../dist/stapes-ui'
    }
});

require(['stapes-ui'], function (Ui) {

    var MyMod = Ui.Module.subclass({
        render: function () {
            var el = this.el;

            el.style.color = this.options.color;
            el.textContent = 'Hi ' + this.get('name');

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

});


