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
        module.exports = factory(require('stapes'), require.resolve('jquery') ? require('jquery') : {});
    } else {
        // Browser globals (root is window)
        root.Stapes.Ui = factory(root.Stapes, (root.jQuery || root.Zepto || root.ender || root.$));
    }
}(this, function (Stapes, $) {