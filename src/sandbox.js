/**
 * Stapes UI Modules' Sandbox
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

/*global _Ui, _silentEvents, _  */

var _regxpKey = /([a-z]+)\s?:/ig,
	_regxpValue = /\'/g,
	_regxpDataAttr = /([A-Z])/g,
	_regxpMid = /\-+/;

/**
 * Parses data attributes to POJO
 *
 * @param el
 * @private
 */

/**
 * Modules container (sandbox).
 *
 * Features module's registration, initialization and cross comunication
 */
_Ui.Sandbox = Stapes.subclass(
    /** @lends Stapes.Ui.Sandbox.prototype */
    {

    /**
     * Sandbox constructor
     *
     * @constructs
     * @param {String|Object} [module] Module ID string, or an object hash composed by `'ModuleID': ModuleConstructor`
     * @param {Function} [moduleConstructor] Module constructor.
     * @return {Object} Sandbox instance
     */
    constructor: function () {
        if (arguments.length > 0) {
            this.register.apply(this, arguments);
        }
        //set a unique id
        this.id = 'sui-sbox-' + (++Stapes.Ui.uid);

        //sandbox root element
        //initialized on start
        this.$root = null;
        this.root = null;

        return this;
    },

    /**
     * Parses DOM element `data` attributes to module configuration options.
     *
     * @param {String} mid  Module ID string
     * @param {Object} moduleRegObj Module Registration object
     * @param {Element} el DOM element to scan
     * @return {Object}
     * @private
     */
    _parseConfig: function (mid, moduleRegObj, el) {


        var data,
            proto = moduleRegObj.prototype,
            conf = {};

        //new configuration setup
        if (proto.hasOwnProperty('_options') && _.isPlainObject(proto._options)) {
            //elData = $el.data();
            _.forOwn(proto._options, function (key) {
                var dataKey = mid + key.charAt(0).toUpperCase() + key.substr(1),
                    dataAttr = 'data-' + dataKey.replace(_regxpDataAttr, function (match) {
                        return '-' + match.toLowerCase();
                    }),
                    attrValue = el.getAttribute(dataAttr);

                if (el.getAttribute(dataAttr)) {
                    conf[key] = attrValue;
                }
            });
        }
        //getting initial data
        data = el.getAttribute('data-' + mid + '-data') || {};
        if (_.typeOf(data) === 'string') {
            //maybe a JSON-like with single quotes...
            //try to cast to JSON
            //fallback to empty object on failure
            data = data.replace(_regxpKey, '"$1":').replace(_regxpValue, '"');
            data = _Ui.$.parseJSON(data) || {};
        }
        conf.data = data;

        return conf;

    },

	/**
	 * Registers a module into the sandbox.
	 *
	 * For fine-grainer registration, the second argument mey be an object with two keys:
	 *
	 * * `selector`: CSS selector to match module DOM elements
	 * * `callback`: Module constructor
	 *
	 * @private
	 * @param  {String}				id       Module ID
	 * @param  {Function|Object}	moduleFn Constructor or registration object.
	 */
    _registerModule: function (id, moduleFn) {
        var mid = id.replace(_regxpMid, '');
        var moduleRegObj = {
            active: false
        };
        if (_.typeOf(moduleFn) === 'function') {
            _.extend(moduleRegObj, {
                //selector: '.' + id,
                selector: '[data-sui-module="' + id + '"]',
                callback: moduleFn
            });
        } else if (_.isPlainObject(moduleFn)) {
            _.extend(moduleRegObj, moduleFn);
        } else {
            throw new Error('Widget constructor not provided');
        }
        //private property to store widget's instances
        moduleRegObj._instances = [];

        this.set(mid, moduleRegObj, _silentEvents);
    },

    /**
     * Updates a module registration object.
     *
     * Emits two events: `sandbox:update` and `sandbox:update:{moduleID}` with the module registration object itself as argument
     *
     * @private
     * @param {String} mid Module ID
     * @param {Object} moduleRegObj Module Registration object
     */
    _updateModule: function (mid, moduleRegObj) {
        this.set(mid, moduleRegObj, _silentEvents);
        this.emit('sandbox:update:' + mid, moduleRegObj);
        this.emit('sandbox:update', moduleRegObj);
    },

    /**
     * Registers a module registration object.
     *
     * Emits two events: `sandbox:update` and `sandbox:update:{moduleID}` with the module registration object itself as argument.
     *
     * @see Stapes.Ui.Sandbox~_registerModule
     * @param {String|Object} mid Module ID. Accepts a shortcut object `{'moduleID': ModuleConstructor}`
     * @param {Object} moduleRegObj Module Registration object
     * @return {Object} Sandbox instance
     */
    register: function (mid, moduleRegObj) {
        if (_.isPlainObject(mid)) {
            _.forOwn(mid, this._registerModule.bind(this));
        } else {
            this._registerModule(mid, moduleRegObj);
        }
        return this;
    },

    /**
     * Executes registered modules in the sandbox.
     *
     * Emits a `sandbox:start` event with the sandbox instance as argument.
     *
     * @param  {String|DOMElement|jQuery} [root=document]  Optional root selector/element to use as sandbox root element
     */
    start: function (root) {

        var rootEl,
            sandbox = this;

        this.$root = _Ui.$(root || document);

        rootEl = this.root = this.$root[0];

        //before starting a sandbox, ensure it's stopped
        this.stop();

        this.each(function (moduleRegObj, mid) {
            var instances = moduleRegObj._instances;
            if (moduleRegObj.active === true || !moduleRegObj.selector) {
                return;
            }

            _Ui.$(moduleRegObj.selector, rootEl).filter(function (i, el) {
                return !(el.hasAttribute('data-sui-skip') || el.hasAttribute('data-sui-active'));
            }).each(function (i, el) {

                var conf = sandbox._parseConfig(mid, moduleRegObj.callback, el),
                    inst;

                conf.el = el;

                inst = new moduleRegObj.callback(conf, sandbox).render();

                el.setAttribute('data-sui-active', 'true');

                instances.push(inst);

            });

            moduleRegObj.active = true;
            this._updateModule(mid, moduleRegObj);
        });
        this.emit('sandbox:start', this);
    },

    /**
     * Stops registered modules in the sandbox.
     *
     * Executes the module's instance `destroy` method if available.
     * Emits a `sandbox:stop` event with the sandbox instance as argument (just when passing from an active to a inactive state)
     */
    stop: function () {
        var wasActive = false;
        this.each(function (moduleRegObj, mid) {
            var inst;
            if (!moduleRegObj.active) {
                return;
            }
            wasActive = true;
            while (moduleRegObj._instances.length) {
                inst = moduleRegObj._instances.pop();
                inst.el.removeAttribute('data-sui-active');
                if (_.typeOf(inst.destroy) === 'function') {
                    inst.destroy.call(inst);
                }
            }

            moduleRegObj.active = false;
            this._updateModule(mid, moduleRegObj);
        });
        if (wasActive) {
            this.emit('sandbox:stop', this);
        }
    }

});

_Ui.Sandbox.legacySelector = false;