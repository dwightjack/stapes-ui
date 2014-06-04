/*global describe, expect, it, jasmine, loadFixtures, beforeEach, spyOn */

jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('UI Sandbox', function () {

	var sandbox;

	beforeEach(function () {
		loadFixtures('sandbox.html');

		sandbox = new Stapes.Ui.Sandbox();
	});

	it('should have a $root and a id property', function() {

		expect(sandbox.$root).toBeDefined();
		expect(sandbox.id).toBeDefined();
	});

	it('should register a module with arguments [id, fn]', function() {

		var id = 'testModule';
		var callback = function () {};

		spyOn(sandbox, 'set');

		sandbox._registerModule(id, callback);

		expect(sandbox.set).toHaveBeenCalledWith(id, jasmine.any(Object), jasmine.any(Boolean));

	});

	it('should register a module with an id and a registration object as argument', function () {

		var id = 'testModule',
			regObj = {
				selector: '.test',
				callback: function () {}
			};

		spyOn(sandbox, 'set');

		sandbox._registerModule(id, regObj);

		expect(sandbox.set).toHaveBeenCalledWith(id, jasmine.any(Object), jasmine.any(Boolean));

	});

	it('should format internal registration object', function () {

		var id = 'testModule',
			regObj = {
				selector: '.test',
				callback: function () {},
				_instances: false //this should be forced to empty array
			},
			id2 = 'testModule2',
			callback2 = function () {};

		spyOn(sandbox, 'set');

		sandbox._registerModule(id, regObj);

		var callArgs = sandbox.set.calls.argsFor(0);

		expect(callArgs[1].selector).toBe('.test');
		expect(callArgs[1].callback).toEqual(jasmine.any(Function));
		expect(callArgs[1].active).toBe(false);
		expect(callArgs[1]._instances).toEqual(jasmine.any(Array));

		//another way
		sandbox._registerModule(id2, callback2);

		var callArgs2 = sandbox.set.calls.argsFor(1);

		expect(callArgs2[1].selector).toBe('.testModule2');
		expect(callArgs2[1].callback).toEqual(jasmine.any(Function));
		expect(callArgs2[1].active).toBe(false);
	});


	it('should update a registration object and emit events', function () {

		var updateObj = {
			selector: '.anotherOne',
			callback: function () {},
			active: true
		};

		spyOn(sandbox, 'set');

		spyOn(sandbox, 'emit');

		sandbox._registerModule('test', function () {});

		sandbox._updateModule('test', updateObj);

		expect(sandbox.set).toHaveBeenCalledWith('test', updateObj, jasmine.any(Boolean));

		expect(sandbox.emit).toHaveBeenCalledWith('sandbox:update:test', updateObj);
		expect(sandbox.emit).toHaveBeenCalledWith('sandbox:update', updateObj);

	});


	it('should expose a public module registration method', function () {

		spyOn(sandbox, '_registerModule');

		sandbox.register('test', function () {});

		expect(sandbox._registerModule).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Function));

	});


	it('should allow batch module registration passing an object', function() {

		var expected = [jasmine.any(String), jasmine.any(Function)];

		spyOn(sandbox, '_registerModule');

		sandbox.register({
			'test': function () {},
			'test2': function () {}
		});

		expect(sandbox._registerModule.calls.count()).toBe(2);
		expect(sandbox._registerModule.calls.allArgs()).toEqual([expected, expected]);

	});


});