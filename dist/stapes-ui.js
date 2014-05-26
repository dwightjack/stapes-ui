/**
 * Stapes Ui
 *
 * @projectDescription  Stapes.js Widget FrameworkEJF is a single namespaced, module pattern oriented functions collection for frontend development.
 * @author              Marco Solazzi
 * @license             MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stapes', 'jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('stapes'), require('jquery'));
    } else {
        // Browser globals (root is window)
        root.Stapes.Ui = factory(root.Stapes, root.jQuery);
    }
}(this, function (Stapes, $) {
/**
 * Stapes UI Core
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

/**
 * Stapes Ui
 * @exports stapes/ui
 */
var _Ui = {},
	_silentEvents = true;


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
	console.log.apply(console, arguments);
};

/**
 * Runs the application.
 *
 * @param {Object} [config] Optional config parameters
 */
_Ui.init = function (config) {

	$.extend(_Ui.Config, config || {});

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

	if ($.isFunction(selector)) {
		callback = selector;
	} else {
		callback = function (config) {
			var $els = $(selector);
			if ($els && $els.length > 0) {
				fn.call(null, config, selector, $els);
			}
		};
	}

	_Ui.vent.on('bootstrap', callback);
};
/**
 * Stapes UI Widgets' Sandbox
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

/*global _Ui, _silentEvents */

var _regxpKey = /([a-z]+)\s?:/ig,
	_regxpValue = /\'/g,
	_regxpMid = /\-+/;

_Ui.Sandbox = Stapes.subclass({

	constructor: function () {
		if (arguments.length > 0) {
			this.register.apply(this, arguments);
		}
		//set a unique id
		this.id = 'sui-sbox-' + (++Stapes.Ui.uid);

		//sandbox root element
		//initialized on start
		this.$root = null;

		return this;
	},

	_registerModule: function (id, moduleFn) {
		var mid = id.replace(_regxpMid, '');
		var mConfig = {
			active: false
		};
		if ($.isFunction(moduleFn)) {
			$.extend(mConfig, {
				selector: '.' + id,
				callback: moduleFn
			});
		} else if ($.isPlainObject(moduleFn)) {
			$.extend(mConfig, moduleFn);
		} else {
			$.error('Widget constructor not provided');
		}
		//private property to store widget's instances
		mConfig._instances = [];

		this.set(mid, mConfig, _silentEvents);
	},

	_updateModule: function (mid, moduleFn) {
		this.set(mid, moduleFn, _silentEvents);
		this.emit('sandbox:update:' + mid, moduleFn);
		this.emit('sandbox:update', moduleFn);
	},

	register: function (mid, moduleFn) {
		if ($.isPlainObject(mid)) {
			$.each(mid, $.proxy(this._registerModule, this));
		} else {
			this._registerModule(mid, moduleFn);
		}
		return this;
	},

	start: function (root) {

		var $root,
			sandbox = this;

		$root = this.$root = $(root || document);

		this.each(function (moduleFn, mid) {
			var $els,
				els;
			if (moduleFn.active === true) {
				return;
			}

			$els = $root.find(moduleFn.selector);

			if ($els && $els.length > 0) {
				els = $els.not('[data-sui-skip],[data-sui-active]').get();

				moduleFn._instances = $.map(els, function (el) {

					var $el = $(el),
						conf = $el.data('sui-' + mid + '-conf') || {},
						inst;

					if ($.type(conf) === 'string') {
						//maybe a JSON-like with single quotes...
						//try to cast to JSON
						//fallback to empty object on failure
						conf = conf.replace(_regxpKey, '"$1":').replace(_regxpValue, '"');
						conf = $.parseJSON(conf) || {};
					}

					conf.$el = $el;

					inst = new moduleFn.callback(conf, sandbox).render();

					$el.data('sui-' + mid, inst).attr('data-sui-active', true);

					return inst;

				});
			}
			moduleFn.active = true;
			this._updateModule(mid, moduleFn);
		});
		this.emit('sandbox:start', this);
	},

	stop: function () {
		this.each(function (moduleFn, mid) {
			var inst;
			if (!moduleFn.active) {
				return;
			}
			while(moduleFn._instances.length) {
				inst = moduleFn._instances.pop();
				if ($.isFunction(inst.destroy)) {
					inst.destroy.call(inst);
				}
			}

			moduleFn.active = false;
			this._updateModule(mid, moduleFn);
		});
		this.emit('sandbox:stop', this);
	}

});
/**
 * Stapes UI Base Module
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

/*global _Ui, _silentEvents */

//This properties are taken from passed in options and copied as instance properties
var _baseProps = ['$el', 'tagName', 'className'];

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
	_configureProperty: function (i, prop) {
		if (this.options.hasOwnProperty(prop)) {
			this[prop] = this.options[prop];
		}
	},

	/**
	 * Replaces root element with a new one
	 *
	 * This method is invoked by the constructor if `options.remove === true`
	 *
	 * New element will be created on following template `<{tagName} class="{className}"></div>`
	 *
	 */
	_replaceEl: function () {
		var $newEl = $(document.createElement(this.tagName))
					.addClass(this.className || '');

		this.$el.replaceWith($newEl);

		this.$el = $newEl;
	},


	/**
	 * Default module constructor
	 *
	 * Usually you wouldn't overwrite this method. To add custom logic use {@link Stapes.Ui.Module#initialize}
	 * @constructs
	 */
	constructor: function (options/*, sandbox*/) {

		this.options = $.extend({}, this._options, options || {});

		$.each(_baseProps, $.proxy(this._configureProperty, this));

		this.set( $.extend({}, this._data, options.data || {}), _silentEvents );

		if (this.options.replace === true) {
			//whether the original element should be replaced with a custom one
			this._replaceEl();
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
	initialize: function () {
		//setup your own initialization
	},
	/**
	 * Render
	 */
	render: function () {
		/* custom render logic, must always return this */
		return this;
	},

	destroy: function () {
		/* custom destroy logic */
	}

});

//monkey patching subclass
//to make `_Module.prototype.constructor`
//the default constructor
var _subclass = _Ui.Module.subclass;

_Ui.Module.subclass = function () {
	var args = {
		constructor: _Ui.Module.prototype.constructor
	};

	args.push.apply(args, arguments);

	return _subclass.apply(_Ui.Module, args);
};
    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return _Ui;
}));