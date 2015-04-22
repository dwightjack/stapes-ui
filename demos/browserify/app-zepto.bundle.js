(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../../dist/stapes-ui":2}],2:[function(require,module,exports){
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
        root.Stapes.Ui = factory(root.Stapes, (root.jQuery || root.Zepto || root.ender || root.$));
    }
}(this, function (Stapes, $) {
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
 * DOM Library reference
 */
_Ui.$ = $;

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

if (typeof _Ui.$ === 'undefined') {
    _Ui.$ = _Ui.Dom;
}
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
         * Used when `options.replace === true`
         * @type {String}
         */
        tagName: 'div',

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
         * This method is invoked by the constructor if `options.remove === true`.
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
},{"stapes":3}],3:[function(require,module,exports){
//
//  ____  _                           _
// / ___|| |_ __ _ _ __   ___  ___   (_)___  (*)
// \___ \| __/ _` | '_ \ / _ \/ __|  | / __|
//  ___) | || (_| | |_) |  __/\__ \_ | \__ \
// |____/ \__\__,_| .__/ \___||___(_)/ |___/
//              |_|              |__/
//
// (*) the Javascript MVC microframework that does just enough
//
// (c) Hay Kranen < hay@bykr.org >
// Released under the terms of the MIT license
// < http://en.wikipedia.org/wiki/MIT_License >
//
// Stapes.js : http://hay.github.com/stapes
;(function() {
    'use strict';

    var VERSION = "0.8.1";

    // Global counter for all events in all modules (including mixed in objects)
    var guid = 1;

    // Makes _.create() faster
    if (!Object.create) {
        var CachedFunction = function(){};
    }

    // So we can use slice.call for arguments later on
    var slice = Array.prototype.slice;

    // Private attributes and helper functions, stored in an object so they
    // are overwritable by plugins
    var _ = {
        // Properties
        attributes : {},

        eventHandlers : {
            "-1" : {} // '-1' is used for the global event handling
        },

        guid : -1,

        // Methods
        addEvent : function(event) {
            // If we don't have any handlers for this type of event, add a new
            // array we can use to push new handlers
            if (!_.eventHandlers[event.guid][event.type]) {
                _.eventHandlers[event.guid][event.type] = [];
            }

            // Push an event object
            _.eventHandlers[event.guid][event.type].push({
                "guid" : event.guid,
                "handler" : event.handler,
                "scope" : event.scope,
                "type" : event.type
            });
        },

        addEventHandler : function(argTypeOrMap, argHandlerOrScope, argScope) {
            var eventMap = {},
                scope;

            if (typeof argTypeOrMap === "string") {
                scope = argScope || false;
                eventMap[ argTypeOrMap ] = argHandlerOrScope;
            } else {
                scope = argHandlerOrScope || false;
                eventMap = argTypeOrMap;
            }

            for (var eventString in eventMap) {
                var handler = eventMap[eventString];
                var events = eventString.split(" ");

                for (var i = 0, l = events.length; i < l; i++) {
                    var eventType = events[i];
                    _.addEvent.call(this, {
                        "guid" : this._guid || this._.guid,
                        "handler" : handler,
                        "scope" : scope,
                        "type" : eventType
                    });
                }
            }
        },

        addGuid : function(object, forceGuid) {
            if (object._guid && !forceGuid) return;

            object._guid = guid++;

            _.attributes[object._guid] = {};
            _.eventHandlers[object._guid] = {};
        },

        // This is a really small utility function to save typing and produce
        // better optimized code
        attr : function(guid) {
            return _.attributes[guid];
        },

        clone : function(obj) {
            var type = _.typeOf(obj);

            if (type === 'object') {
                return _.extend({}, obj);
            }

            if (type === 'array') {
                return obj.slice(0);
            }
        },

        create : function(proto) {
            if (Object.create) {
                return Object.create(proto);
            } else {
                CachedFunction.prototype = proto;
                return new CachedFunction();
            }
        },

        createSubclass : function(props, includeEvents) {
            props = props || {};
            includeEvents = includeEvents || false;

            var superclass = props.superclass.prototype;

            // Objects always have a constructor, so we need to be sure this is
            // a property instead of something from the prototype
            var realConstructor = props.hasOwnProperty('constructor') ? props.constructor : function(){};

            function constructor() {
                // Be kind to people forgetting new
                if (!(this instanceof constructor)) {
                    throw new Error("Please use 'new' when initializing Stapes classes");
                }

                // If this class has events add a GUID as well
                if (this.on) {
                    _.addGuid( this, true );
                }

                realConstructor.apply(this, arguments);
            }

            if (includeEvents) {
                _.extend(superclass, Events);
            }

            constructor.prototype = _.create(superclass);
            constructor.prototype.constructor = constructor;

            _.extend(constructor, {
                extend : function() {
                    return _.extendThis.apply(this, arguments);
                },

                // We can't call this 'super' because that's a reserved keyword
                // and fails in IE8
                'parent' : superclass,

                proto : function() {
                    return _.extendThis.apply(this.prototype, arguments);
                },

                subclass : function(obj) {
                    obj = obj || {};
                    obj.superclass = this;
                    return _.createSubclass(obj);
                }
            });

            // Copy all props given in the definition to the prototype
            for (var key in props) {
                if (key !== 'constructor' && key !== 'superclass') {
                    constructor.prototype[key] = props[key];
                }
            }

            return constructor;
        },

        emitEvents : function(type, data, explicitType, explicitGuid) {
            explicitType = explicitType || false;
            explicitGuid = explicitGuid || this._guid;

            // #30: make a local copy of handlers to prevent problems with
            // unbinding the event while unwinding the loop
            var handlers = slice.call(_.eventHandlers[explicitGuid][type]);

            for (var i = 0, l = handlers.length; i < l; i++) {
                // Clone the event to prevent issue #19
                var event = _.extend({}, handlers[i]);
                var scope = (event.scope) ? event.scope : this;

                if (explicitType) {
                    event.type = explicitType;
                }

                event.scope = scope;
                event.handler.call(event.scope, data, event);
            }
        },

        // Extend an object with more objects
        extend : function() {
            var args = slice.call(arguments);
            var object = args.shift();

            for (var i = 0, l = args.length; i < l; i++) {
                var props = args[i];
                for (var key in props) {
                    object[key] = props[key];
                }
            }

            return object;
        },

        // The same as extend, but uses the this value as the scope
        extendThis : function() {
            var args = slice.call(arguments);
            args.unshift(this);
            return _.extend.apply(this, args);
        },

        // from http://stackoverflow.com/a/2117523/152809
        makeUuid : function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        removeAttribute : function(keys, silent) {
            silent = silent || false;

            // Split the key, maybe we want to remove more than one item
            var attributes = _.trim(keys).split(" ")
                ,mutateData = {}
                ;

            // Actually delete the item
            for (var i = 0, l = attributes.length; i < l; i++) {
                var key = _.trim(attributes[i]);

                if (key) {
                    // Store data for mutate event
                    mutateData.key = key;
                    mutateData.oldValue = _.attr(this._guid)[key];

                    delete _.attr(this._guid)[key];

                    // If 'silent' is set, do not throw any events
                    if (!silent) {
                        this.emit('change', key);
                        this.emit('change:' + key);
                        this.emit('mutate', mutateData);
                        this.emit('mutate:' + key, mutateData);
                        this.emit('remove', key);
                        this.emit('remove:' + key);
                    }

                    // clean up
                    delete mutateData.oldValue;
                }
            }
        },

        removeEventHandler : function(type, handler) {
            var handlers = _.eventHandlers[this._guid];

            if (type && handler) {
                // Remove a specific handler
                handlers = handlers[type];
                if (!handlers) return;

                for (var i = 0, l = handlers.length, h; i < l; i++) {
                    h = handlers[i].handler;
                    if (h && h === handler) {
                        handlers.splice(i--, 1);
                        l--;
                    }
                }
            } else if (type) {
                // Remove all handlers for a specific type
                delete handlers[type];
            } else {
                // Remove all handlers for this module
                _.eventHandlers[this._guid] = {};
            }
        },

        setAttribute : function(key, value, silent) {
            silent = silent || false;

            // We need to do this before we actually add the item :)
            var itemExists = this.has(key);
            var oldValue = _.attr(this._guid)[key];

            // Is the value different than the oldValue? If not, ignore this call
            if (value === oldValue) {
                return;
            }

            // Actually add the item to the attributes
            _.attr(this._guid)[key] = value;

            // If 'silent' flag is set, do not throw any events
            if (silent) {
                return;
            }

            // Throw a generic event
            this.emit('change', key);

            // And a namespaced event as well, NOTE that we pass value instead of
            // key here!
            this.emit('change:' + key, value);

            // Throw namespaced and non-namespaced 'mutate' events as well with
            // the old value data as well and some extra metadata such as the key
            var mutateData = {
                "key" : key,
                "newValue" : value,
                "oldValue" : oldValue || null
            };

            this.emit('mutate', mutateData);
            this.emit('mutate:' + key, mutateData);

            // Also throw a specific event for this type of set
            var specificEvent = itemExists ? 'update' : 'create';

            this.emit(specificEvent, key);

            // And a namespaced event as well, NOTE that we pass value instead of key
            this.emit(specificEvent + ':' + key, value);
        },

        trim : function(str) {
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },

        typeOf : function(val) {
            if (val === null || typeof val === "undefined") {
                // This is a special exception for IE, in other browsers the
                // method below works all the time
                return String(val);
            } else {
                return Object.prototype.toString.call(val).replace(/\[object |\]/g, '').toLowerCase();
            }
        },

        updateAttribute : function(key, fn, silent) {
            var item = this.get(key);

            // In previous versions of Stapes we didn't have the check for object,
            // but still this worked. In 0.7.0 it suddenly doesn't work anymore and
            // we need the check. Why? I have no clue.
            var type = _.typeOf(item);

            if (type === 'object' || type === 'array') {
                item = _.clone(item);
            }

            var newValue = fn.call(this, item, key);
            _.setAttribute.call(this, key, newValue, silent || false);
        }
    };

    // Can be mixed in later using Stapes.mixinEvents(object);
    var Events = {
        emit : function(types, data) {
            data = (typeof data === "undefined") ? null : data;

            var splittedTypes = types.split(" ");

            for (var i = 0, l = splittedTypes.length; i < l; i++) {
                var type = splittedTypes[i];

                // First 'all' type events: is there an 'all' handler in the
                // global stack?
                if (_.eventHandlers[-1].all) {
                    _.emitEvents.call(this, "all", data, type, -1);
                }

                // Catch all events for this type?
                if (_.eventHandlers[-1][type]) {
                    _.emitEvents.call(this, type, data, type, -1);
                }

                if (typeof this._guid === 'number') {
                    // 'all' event for this specific module?
                    if (_.eventHandlers[this._guid].all) {
                        _.emitEvents.call(this, "all", data, type);
                    }

                    // Finally, normal events :)
                    if (_.eventHandlers[this._guid][type]) {
                        _.emitEvents.call(this, type, data);
                    }
                }
            }
        },

        off : function() {
            _.removeEventHandler.apply(this, arguments);
        },

        on : function() {
            _.addEventHandler.apply(this, arguments);
        }
    };

    _.Module = function() {

    };

    _.Module.prototype = {
        each : function(fn, ctx) {
            var attr = _.attr(this._guid);
            for (var key in attr) {
                var value = attr[key];
                fn.call(ctx || this, value, key);
            }
        },

        extend : function() {
            return _.extendThis.apply(this, arguments);
        },

        filter : function(fn) {
            var filtered = [];
            var attributes = _.attr(this._guid);

            for (var key in attributes) {
                if ( fn.call(this, attributes[key], key)) {
                    filtered.push( attributes[key] );
                }
            }

            return filtered;
        },

        get : function(input) {
            if (typeof input === "string") {
                // If there is more than one argument, give back an object,
                // like Underscore's pick()
                if (arguments.length > 1) {
                    var results = {};

                    for (var i = 0, l = arguments.length; i < l; i++) {
                        var key = arguments[i];
                        results[key] = this.get(key);
                    }

                    return results;
                } else {
                    return this.has(input) ? _.attr(this._guid)[input] : null;
                }
            } else if (typeof input === "function") {
                var items = this.filter(input);
                return (items.length) ? items[0] : null;
            }
        },

        getAll : function() {
            return _.clone( _.attr(this._guid) );
        },

        getAllAsArray : function() {
            var arr = [];
            var attributes = _.attr(this._guid);

            for (var key in attributes) {
                var value = attributes[key];

                if (_.typeOf(value) === "object" && !value.id) {
                    value.id = key;
                }

                arr.push(value);
            }

            return arr;
        },

        has : function(key) {
            return (typeof _.attr(this._guid)[key] !== "undefined");
        },

        map : function(fn, ctx) {
            var mapped = [];
            this.each(function(value, key) {
                mapped.push( fn.call(ctx || this, value, key) );
            }, ctx || this);
            return mapped;
        },

        // Akin to set(), but makes a unique id
        push : function(input, silent) {
            if (_.typeOf(input) === "array") {
                for (var i = 0, l = input.length; i < l; i++) {
                    _.setAttribute.call(this, _.makeUuid(), input[i], silent || false);
                }
            } else {
                _.setAttribute.call(this, _.makeUuid(), input, silent || false);
            }

            return this;
        },

        remove : function(input, silent) {
            if (typeof input === 'undefined') {
                // With no arguments, remove deletes all attributes
                _.attributes[this._guid] = {};
                this.emit('change remove');
            } else if (typeof input === "function") {
                this.each(function(item, key) {
                    if (input(item)) {
                        _.removeAttribute.call(this, key, silent);
                    }
                });
            } else {
                // nb: checking for exists happens in removeAttribute
                _.removeAttribute.call(this, input, silent || false);
            }

            return this;
        },

        set : function(objOrKey, valueOrSilent, silent) {
            if (typeof objOrKey === "object") {
                for (var key in objOrKey) {
                    _.setAttribute.call(this, key, objOrKey[key], valueOrSilent || false);
                }
            } else {
                _.setAttribute.call(this, objOrKey, valueOrSilent, silent || false);
            }

            return this;
        },

        size : function() {
            var size = 0;
            var attr = _.attr(this._guid);

            for (var key in attr) {
                size++;
            }

            return size;
        },

        update : function(keyOrFn, fn, silent) {
            if (typeof keyOrFn === "string") {
                _.updateAttribute.call(this, keyOrFn, fn, silent || false);
            } else if (typeof keyOrFn === "function") {
                this.each(function(value, key) {
                    _.updateAttribute.call(this, key, keyOrFn);
                });
            }

            return this;
        }
    };

    var Stapes = {
        "_" : _, // private helper functions and properties

        "extend" : function() {
            return _.extendThis.apply(_.Module.prototype, arguments);
        },

        "mixinEvents" : function(obj) {
            obj = obj || {};

            _.addGuid(obj);

            return _.extend(obj, Events);
        },

        "on" : function() {
            _.addEventHandler.apply(this, arguments);
        },

        "subclass" : function(obj, classOnly) {
            classOnly = classOnly || false;
            obj = obj || {};
            obj.superclass = classOnly ? function(){} : _.Module;
            return _.createSubclass(obj, !classOnly);
        },

        "version" : VERSION
    };

    // This library can be used as an AMD module, a Node.js module, or an
    // old fashioned global
    if (typeof exports !== "undefined") {
        // Server
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = Stapes;
        }
        exports.Stapes = Stapes;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(function() {
            return Stapes;
        });
    } else {
        // Global scope
        window.Stapes = Stapes;
    }
})();

},{}]},{},[1]);
