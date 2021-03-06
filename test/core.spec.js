/*global describe, it, expect, jasmine, spyOn, beforeEach, afterEach */

describe('Core Functionalities', function () {

	beforeEach(function () {
        document.body.innerHTML = window.__html__['test/fixtures/core.html'];
	});


    afterEach(function () {
        document.body.innerHTML = '';
    });

	it('should expose a Stapes.Ui namespace', function () {

		expect(Stapes.Ui).toBeDefined();
	});



	it('should have a `uid` index for internal pointer features', function () {

		expect(Stapes.Ui.uid).toEqual(jasmine.any(Number));

	});



	it('should expose a pub/sub event emitter', function () {
		var ventSpy = jasmine.createSpy('ventSpy');
		var methods = ['emit', 'on', 'off'];
		while (methods.length) {
			expect(Stapes.Ui.vent[methods.pop()]).toEqual(jasmine.any(Function));
		}
		//test event functionality
		Stapes.Ui.vent.on('testvent', ventSpy);
		Stapes.Ui.vent.emit('testvent');
		Stapes.Ui.vent.off('testvent', ventSpy);
		Stapes.Ui.vent.emit('testvent');

		expect(ventSpy.calls.count()).toEqual(1);

	});



	it('should have a method to enqueue initialization functions which proxies to `.vent` ', function () {

		var cb = function () {};

		spyOn(Stapes.Ui.vent, 'on');

		Stapes.Ui.addInitializer(cb);

		expect(Stapes.Ui.vent.on).toHaveBeenCalledWith('bootstrap', cb);

	});



	it('should have a `.init` method which emits a `bootstrap` event', function () {

		spyOn(Stapes.Ui.vent, 'emit');

		Stapes.Ui.init();

		expect(Stapes.Ui.vent.emit).toHaveBeenCalledWith('bootstrap', Stapes.Ui.Config);

		//accepts a config object which extends Ui.Config
		Stapes.Ui.init({test: true});

		expect(Stapes.Ui.Config.test).toBe(true);

	});



	it('should allow to filter initializer based on DOM selectors', function () {

		var initSpy = jasmine.createSpy('initSpy');
		var initSpy2 = jasmine.createSpy('initSpy2');
		var $testEl = Stapes.Ui.$('#test-el');

		Stapes.Ui.addInitializer('#test-el', initSpy);

		Stapes.Ui.addInitializer('#fake-el', initSpy2);

		Stapes.Ui.init();

		expect(initSpy).toHaveBeenCalledWith(Stapes.Ui.Config, '#test-el', $testEl);

		expect(initSpy2).not.toHaveBeenCalled();

	});



});