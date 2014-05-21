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
 * By itself it does nothing, extend it with `Ui.Module.subclass` to define your own Modules
 *
 */
_Ui.Module = Stapes.subclass({

	/**
	 * Default options.
	 *
	 * By design the only reserved option is `replace`.
	 * If set to `true` the original element to which the module is applied to
	 * will be replaced by a new element created on following template `<{tagName} class="{className}"></div>
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
	 * @private
	 */
	_replaceEl: function () {
		var $newEl = $(document.createElement(this.tagName))
					.addClass(this.className || '');

		this.$el.replaceWith($newEl);

		this.$el = $newEl;
	},

	constructor: function (options/*, sandbox*/) {

		this.options = $.extend({}, this._options, options || {});

		$.each(_baseProps, $.proxy(this._configureProperty, this));

		this.set( $.extend({}, this._data, options.data || {}), _silentEvents );

		if (this.options.replace === true) {
			//whether the original element should be replaced with a custom one
			this._replaceEl();
		}

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