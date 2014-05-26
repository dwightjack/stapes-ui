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