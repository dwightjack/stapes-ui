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