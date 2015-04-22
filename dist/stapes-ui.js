/**
 * Stapes Ui
 *
 * @projectDescription  Stapes.js Widget Framework
 * @author              Marco Solazzi
 * @license             MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stapes'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('stapes'));
    } else {
        // Browser globals (root is window)
        root.Stapes.Ui = factory(root.Stapes);
    }
}(this, function (Stapes) {
/**
 * Stapes UI Core
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}

/**
 * Stapes Ui
 * @exports stapes/ui
 */
var _Ui = {},
    _silentEvents = true,
    _ = Stapes._,
    _noop = function () {},
    _log = typeof console !== 'undefined' && !!console.log ? Function.prototype.bind.call( console.log, console ) : _noop;

//Extending utility object with some more functions
/* jshint ignore:start */
//adapted from https://github.com/jquery/jquery/blob/master/src/core.js#L220
_.isPlainObject = function( obj ) {
    // Not plain objects:
    // - Any object or value whose internal [[Class]] property is not "[object Object]"
    // - DOM nodes
    // - window
    if ( _.typeOf( obj ) !== 'object' || obj.nodeType || (obj != null && obj === obj.window) ) {
        return false;
    }

    if ( obj.constructor && !obj.constructor.prototype.hasOwnProperty('isPrototypeOf' ) ) {
        return false;
    }

    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true;
};
/* jshint ignore:end */

_.forOwn = function (obj, fn) {
    var key;
    if (!_.isPlainObject(obj)) {
        return;
    }
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            fn.call(obj, key, obj[key]);
        }
    }
};

_.each = function (array, fn) {
    var i = 0,
        l = array.length;
    for (; i < l; i++) {
        fn(array[i], i);
    }
};


/**
 * Unique ID pointer
 *
 * @type {Integer}
 */
_Ui.uid = 0;


/**
 * Configuration options
 *
 * May be overriden by a custom object
 *
 * @type {Object}
 */
_Ui.Config = {
    DEBUG: false,
    //verbose logging when DEBUG === true
    VERBOSE: false
};


/**
 * Pub/Sub Hub
 * @see  {@link http://hay.github.io/stapes/#m-mixinEvents}
 */
_Ui.vent = Stapes.mixinEvents();


/**
 * =============================
 * Some core methods
 * =============================
 */

/**
 * Logging method. May be override in production
 */
_Ui.log = function () {
    _log.apply(console, arguments);
};

/**
 * Runs the application.
 *
 * @param {Object} [config] Optional config parameters
 */
_Ui.init = function (config) {

    _.extend(_Ui.Config, config || {});

    //log every event in debug mode
    if (_Ui.Config.DEBUG) {
        Stapes.on('all', function (data, event) {
            _Ui.log('stapes-ui: ' + event.type, data || null, event);
        });
        _silentEvents = !_Ui.Config.VERBOSE;
    }

    _Ui.vent.emit('bootstrap', _Ui.Config);
};

/**
 * Enqueues a function with optional context to the bootstrap event. First argument is the `IWS.Config` object
 *
 * @param {String} [context] Optional selector to run the initializer only when a specified set of elements exists
 * @param {Function} fn Function to be executed
 */
_Ui.addInitializer = function (selector, fn) {
    var callback;
    if (_.typeOf(selector) === 'function') {
        callback = selector;
    } else {
        callback = function (config) {
            var $els = _Ui.$(selector);
            if ($els && $els.length > 0) {
                fn.call(null, config, selector, $els);
            }
        };
    }

    _Ui.vent.on('bootstrap', callback);
};
/**
 * Stapes UI Minimal DOM Library
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

/*global _Ui:true, _:true */

var _arrayProto = Array.prototype;

_Ui.Dom = function (selector, context) {
    var ctx = context || document,
        els;


    if (!(this instanceof _Ui.Dom)) {
        return new _Ui.Dom(selector, ctx);
    }

    //this is by design
    if (selector !== null && selector !== undefined) {
        if (typeof selector === 'string') {
            els = Array.prototype.slice.call(ctx.querySelectorAll(selector));
        } else if (Array.isArray(selector)) {
            els = selector;
        } else if (selector.length) {
            //array-like object
            els = Array.prototype.slice.call(selector);
        } else if (selector.nodeType === 1 || selector.nodeType === 9) {
            //wrap everything else
            els = [selector];
        }
    } else {
        els = [];
    }

    this.length = els.length;

    _.extend(this, els);

    return this;
};

_Ui.Dom.parseJSON = function(data) {
    return JSON.parse(data + '');
};

_.extend(_Ui.Dom.prototype, {

    constructor: _Ui.Dom,

    each: function (callback) {
        _arrayProto.every.call(this, function(el, idx) {
            return callback.call(el, idx, el) !== false;
        });
        return this;
    },

    // @see https://github.com/jquery/jquery/blob/master/src/core.js#L52
    get: function (num) {
        if (num !== null && num !== undefined) {
            return num < 0 ? this[num + this.length] : this[num];
        }
        return _arrayProto.slice.call(this);
    },

    filter: function (callback) {
        var ret = _arrayProto.filter.call(this, function (el, i) {
            return callback.call(el, i, el);
        });
        return _Ui.Dom(ret);
    },

    text: function (value) {
        if (value === undefined) {
            return this.length > 0 ? this[0].textContent : '';
        }
        return this.each(function (i, el) {
            if (el.nodeType === 1 || el.nodeType === 11 || el.nodeType === 9) {
                el.textContent = value;
            }
        });
    },
    html: function (value) {
        if (value !== undefined) {
            return this.length > 0 ? this[0].innerHTML : '';
        }
        return this.each(function (i, el) {
            el.innerHTML = value;
        });
    }
});


/**
 * DOM Library reference
 */
_Ui.$ = _Ui.Dom;

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
    return _subclass.call(this, obj, classOnly);

};
// Just return a value to define the module export.
// This example returns an object, but the module
// can return a function as the exported value.
return _Ui;
}))
;