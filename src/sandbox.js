/**
 * Stapes UI Widgets' Sandbox
 *
 * @author Marco Solazzi
 * @copyright (c) Marco Solazzi
 */

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