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
    _log.apply( console, arguments );
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