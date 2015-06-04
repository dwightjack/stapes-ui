/**
 * Stapes UI Base Module
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

/*global _Ui, _silentEvents, _, _noop */

//This properties are taken from passed in options and copied as instance properties
var _baseProps = ['$el', 'el', 'tagName', 'className'];

/**
 * Base Module Constructor
 *
 * By itself it does nothing, extend it with `Stapes.Ui.Module.subclass` to define your own Modules
 *
 */
_Ui.Module = Stapes.subclass(
    /** @lends Stapes.Ui.Module.prototype */
    {


        /**
         * Default options.
         *
         * By design the only reserved option is `replace`.
         *
         * If set to `true` the original element to which the module is applied to will be replaced by a new element.
         *
         * @see Stapes.Ui.Module#_replaceEl
         *
         * @type {Object}
         */
        _options: {
            replace: false
        },

        /**
         * Default datas.
         *
         * After initialization they may be retrieved and updated using [Stapes' data methods](http://hay.github.io/stapes/#m-data)
         * @type {Object}
         */
        _data: {},

        /**
         * Root element tagName.
         *
         * Used when `options.replace === true` or when `el` is not provided
         * @type {String}
         */
        tagName: 'div',

        /**
         * Root element className.
         *
         * Used when `options.replace === true` or when `el` is not provided
         * @type {String}
         */
        className: '',

        /**
         * Copies some options to the object instance
         *
         * @private
         * @param  {Integer} i  Property index
         * @param  {Mixed} prop Property value
         */
        _configureProperty: function (prop) {
            if (this.options.hasOwnProperty(prop)) {
                this[prop] = this.options[prop];
            }
        },

        /**
         * Replaces root element with a new one
         *
         * This method is invoked by the constructor if `options.replace === true`.
         *
         * New element will be created on following template `<{tagName} class="{className}"></div>`
         *
         * @private
         */
        _replaceEl: function () {
            var newEl = document.createElement(this.tagName),
                el = this.el,
                parent = el.parentNode;

            newEl.className = this.className || '';
            parent.replaceChild(newEl, el);
            this.el = newEl;
            this.$el = _Ui.$(newEl);

        },

        /**
         * Creates a root element
         *
         * New element will be created on following template `<{tagName} class="{className}"></div>`
         *
         * @private
         */
        _createEl: function () {
            var newEl = document.createElement(this.tagName);

            newEl.className = this.className || '';
            this.el = newEl;
            this.$el = _Ui.$(newEl);
        },


        /**
         * Default module constructor
         *
         * Usually you wouldn't overwrite this method. To add custom logic use {@link Stapes.Ui.Module#initialize}
         *
         * @constructs
         * @param {Object} [options] Instance options
         * @param {Stapes.Ui.Sandbox} [sandbox] The containing sandbox instance.
         */
        constructor: function (options, sandbox) {

            this.options = _.extend({}, this._options, options || {});

            _.each(_baseProps, this._configureProperty.bind(this));

            this.set(_.extend({}, this._data, this.options.data || {}), _silentEvents);


            if (this.el) {
                this.$el = _Ui.$(this.el);
                this.el = this.$el[0];
            } else if (this.$el) {
                //normalize `el` and `$el` references
                this.$el = this.$el instanceof _Ui.$ ? this.$el : _Ui.$(this.$el);
                this.el = this.$el[0];
            } else {
                this._createEl();
            }

            if (this.options.replace === true) {
                //whether the original element should be replaced with a custom one
                this._replaceEl();
            }

            if (sandbox && sandbox instanceof _Ui.Sandbox) {
                this.broadcast = sandbox.emit.bind(sandbox);
                this.onBroadcast = sandbox.on.bind(sandbox);
                this.offBroadcast = sandbox.off.bind(sandbox);
            }

            this.initialize.apply(this, arguments);

            return this;

        },

        /**
         * Custom initialization
         *
         * Overwrite this method with your own logic
         *
         * @param {Object} [options={}] Instance options
         * @param {Stapes.Ui.Sandbox} sandbox Sandbox instance controlling the module
         */
        initialize: _noop,
        /**
         * Rendering method.
         *
         * Always return `this`
         * @return {Object} Module instance
         */
        render: function () {
            /* custom render logic, must always return this */
            return this;
        },

        /**
         * Custom method launched at instance destroy.
         *
         * Used to unbind event and cleanup the DOM
         */
        destroy: _noop,

        /**
         * Emits an event to the parent sandbox (if passed in on initialization)
         *
         * @see http://hay.github.io/stapes/#m-emit
         */
        broadcast: _noop,

        /**
         * Listens for an event from the parent sandbox (if passed in on initialization)
         *
         * @see http://hay.github.io/stapes/#m-on
         */
        onBroadcast: _noop,

        /**
         * Removes a listener for an event from the parent sandbox (if passed in on initialization)
         *
         * @see http://hay.github.io/stapes/#m-off
         */
        offBroadcast: _noop

    });

//monkey patching subclass
//to make `_Module.prototype.constructor`
//the default constructor
var _subclass = _Ui.Module.subclass;

_Ui.Module.subclass = function (obj, classOnly) {
    if (obj && !obj.hasOwnProperty('constructor')) {
        obj.constructor = _Ui.Module.prototype.constructor;
    }
    var sub = _subclass.call(this, obj, classOnly);
    sub.subclass = _Ui.Module.subclass.bind(sub);
    return sub;
};