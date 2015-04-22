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
