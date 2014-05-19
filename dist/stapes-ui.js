/*! Stapes UI - v0.0.1 - 2014-05-19
* Copyright (c) 2014 Marco Solazzi; Licensed MIT */
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
 * =============================
 * Main Namespace
 * =============================
 */

var _Ui = {},
	_silentEvents = true;


/**
 * =============================
 * Unique ID pointer
 * =============================
 */
_Ui.uid = 0;




/**
 * =============================
 * Configuration options
 * May be overriden by a custom object
 * =============================
 */

_Ui.Config = {
	DEBUG: false,
	//verbose logging when DEBUG === true
	VERBOSE: false
};


/**
 * =============================
 * Event PubSub central hub
 * =============================
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
 * @param {[Object]} config Optional config parameters
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
 * @param {[String]} context Optional selector to run the initializer only when a specified set of elements exists
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
/*global _Ui, _silentEvents */

var _regxpKey = /([a-z]+)\s?:/ig,
	_regxpValue = /\'/g,
	_regxpWid = /\-+/;

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

	_registerWidget: function (id, widgetFn) {
		var wid = id.replace(_regxpWid, '');
		var wConfig = {
			active: false
		};
		if ($.isFunction(widgetFn)) {
			$.extend(wConfig, {
				selector: '.' + id,
				callback: widgetFn
			});
		} else if ($.isPlainObject(widgetFn)) {
			$.extend(wConfig, widgetFn);
		} else {
			$.error('Widget constructor not provided');
		}
		//private property to store widget's instances
		wConfig._instances = [];

		this.set(wid, wConfig, _silentEvents);
	},

	_updateWidget: function (wid, widget) {
		this.set(wid, widget, _silentEvents);
		this.emit('sandbox:active:' + wid, widget);
		this.emit('sandbox:active', widget);
	},

	register: function (wid, widgetFn) {
		if ($.isPlainObject(wid)) {
			$.each(wid, $.proxy(this._registerWidget, this));
		} else {
			this._registerWidget(wid, widgetFn);
		}
		return this;
	},

	start: function (root) {

		var $root,
			sandbox = this;

		$root = this.$root = $(root || document);

		this.each(function (widget, wid) {
			var $els,
				els;
			if (widget.active === true) {
				return;
			}

			$els = $root.find(widget.selector);

			if ($els && $els.length > 0) {
				els = $els.not('[data-sui-skip],[data-sui-active]').get();

				widget._instances = $.map(els, function (el) {

					var $el = $(el),
						conf = $el.data('sui-' + wid + '-conf') || {},
						inst;

					if ($.type(conf) === 'string') {
						//maybe a JSON-like with single quotes...
						//try to cast to JSON
						//fallback to empty object on failure
						conf = conf.replace(_regxpKey, '"$1":').replace(_regxpValue, '"');
						conf = $.parseJSON(conf) || {};
					}

					conf.$el = $el;

					inst = new widget.callback(conf, sandbox).render();

					$el.data('sui-' + wid, inst).attr('data-sui-active', true);

					return inst;

				});
			}
			widget.active = true;
			this._updateWidget(wid, widget);
		});
		this.emit('sandbox:start', this);
	},

	stop: function () {
		this.each(function (widget, wid) {
			var inst;
			if (!widget.active) {
				return;
			}
			while(widget._instances.length) {
				inst = widget._instances.pop();
				if ($.isFunction(inst.destroy)) {
					inst.destroy.call(inst);
				}
			}

			widget.active = false;
			this._updateWidget(wid, widget);
		});
		this.emit('sandbox:stop', this);
	}

});
/*global _Ui, _silentEvents */
var _baseProps = ['$el', 'tagName', 'className'];

_Ui.Module = Stapes.subclass({

	_options: {},

	_data: {},

	_configureProperty: function (i, prop) {
		if (this.options.hasOwnProperty(prop)) {
			this[prop] = this.options[prop];
		}
	},

	constructor: function (options/*, sandbox*/) {

		this.options = $.extend({}, this._options, options || {});

		$.each(_baseProps, $.proxy(this._configureProperty, this));

		this.set( $.extend({}, this._data, options.data || {}), _silentEvents );

		this.initialize.apply(this, arguments);

	},

	initialize: function () {
		//setup your own initialization
	},

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