var MyMod = Stapes.Ui.Module.subclass({
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

/* with a template engine (lodash) and a brand new element (Backbone.View like)*/


var MyModTmpl = Stapes.Ui.Module.subclass({

    initialize: function () {
        this.template = _.template(this.options.template);
    },

    render: function () {

        this.el.innerHTML = this.template(this.getAll());

        return this;
    }
});

var view = new MyModTmpl({
    tagName: 'p',
    className: 'greeting',
    template: 'Hi <%= name %>',
    color: 'blue',
    data: {
        name: 'John'
    }
});

document.getElementById('test-block-template').appendChild(view.render().el);