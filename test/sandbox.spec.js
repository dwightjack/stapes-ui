/*global describe, expect, it, jasmine, loadFixtures, beforeEach, spyOn */

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
				selector: '[data-sui-module="test"]',
				callback: function () {}
			};

		spyOn(sandbox, 'set');

		sandbox._registerModule(id, regObj);

		expect(sandbox.set).toHaveBeenCalledWith(id, jasmine.any(Object), jasmine.any(Boolean));

	});

	it('should format internal registration object', function () {

		var id = 'testModule',
			regObj = {
				selector: '[data-sui-module="test"]',
				callback: function () {},
				_instances: false //this should be forced to empty array
			},
			id2 = 'testModule2',
			callback2 = function () {};

		spyOn(sandbox, 'set');

		sandbox._registerModule(id, regObj);

		var callArgs = sandbox.set.calls.argsFor(0);

		expect(callArgs[1].selector).toBe('[data-sui-module="test"]');
		expect(callArgs[1].callback).toEqual(jasmine.any(Function));
		expect(callArgs[1].active).toBe(false);
		expect(callArgs[1]._instances).toEqual(jasmine.any(Array));

		//another way
		sandbox._registerModule(id2, callback2);

		var callArgs2 = sandbox.set.calls.argsFor(1);

		expect(callArgs2[1].selector).toBe('[data-sui-module="testModule2"]');
		expect(callArgs2[1].callback).toEqual(jasmine.any(Function));
		expect(callArgs2[1].active).toBe(false);
	});


	it('should update a registration object and emit events', function () {

		var updateObj = {
			selector: '[data-sui-module="anotherOne"]',
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

	it('should run module initialization on start', function () {
		var module1 = jasmine.createSpy('module1');

		module1.and.callFake(function() {
	      return new Stapes.Ui.Module();
	    });

		sandbox.register('module1', module1);

		sandbox.start();

		expect(module1).toHaveBeenCalled();
	});

	it('should update module registration object and emit an event on start', function () {

		sandbox.register('module1', Stapes.Ui.Module);

		spyOn(sandbox, '_updateModule');
		spyOn(sandbox, 'emit');

		sandbox.start();

		var callArgs = sandbox._updateModule.calls.argsFor(0);

		expect(callArgs[0]).toBe('module1');
		expect(callArgs[1].active).toBe(true);
		expect(callArgs[1]._instances.length).toBeGreaterThan(0);

		expect(sandbox.emit).toHaveBeenCalledWith('sandbox:start', sandbox);

	});


	it('should attach to DOM elements, render and add control attributes', function () {
		var module1 = Stapes.Ui.Module.subclass({
			render: function () {
				this.$el.text('works!');
				return this;
			}
		});

		sandbox.register('module1', module1);
		sandbox.start();

		//$root defaults to document
		expect(sandbox.$root).toBeMatchedBy(document);

		//module is activated
		expect($('[data-sui-module="module1"]')).toHaveText('works!');
		expect($('[data-sui-module="module1"]')).toHaveAttr('data-sui-active', 'true');
	});

	it('should read custom module configuration from DOM', function () {
		var moduleconf = Stapes.Ui.Module.subclass({
			_options: {
				count: 1
			},
            _data: {
                'name': 'John'
            },
			render: function () {
				this.$el.text(this.options.count + ' ' + this.get('name'));
				return this;
			}
		});

		sandbox.register('moduleconf', moduleconf);
		sandbox.start();

		expect($('#moduleconf1')).toHaveText('1 John');
        expect($('#moduleconf3')).toHaveText('3 Jane');
	});

	it('should skip DOM elements with data-sui-skip or data-sui-active attribute', function() {

		sandbox.register('moduleskip', Stapes.Ui.Module);
		sandbox.start();

		var regObj = sandbox.get('moduleskip');

		expect(regObj._instances.length).toBe(1);
	});

	it('should allow to customize the sandbox root element', function () {
		sandbox.register('module2', Stapes.Ui.Module);

		sandbox.start('#childSandbox');

		var regObj = sandbox.get('module2');

		expect(sandbox.$root).toBeMatchedBy('#childSandbox');
		expect(regObj._instances.length).toBe(1);

	});

	it('should run module destroy on stop', function () {
		var destroySpy = jasmine.createSpy('destroySpy');
		var module1 = Stapes.Ui.Module.subclass({
			destroy: destroySpy
		});

		sandbox.register('module1', module1);

		sandbox.start();
		sandbox.stop();

		expect(destroySpy).toHaveBeenCalled();
	});


	it('should update module registration object and emit an event on stop', function () {

		sandbox.register('module1', Stapes.Ui.Module);

		sandbox.start();

		spyOn(sandbox, '_updateModule');
		spyOn(sandbox, 'emit');

		sandbox.stop();

		var callArgs = sandbox._updateModule.calls.argsFor(0);

		expect(callArgs[0]).toBe('module1');
		expect(callArgs[1].active).toBe(false);
		expect(callArgs[1]._instances.length).toBe(0);

		expect(sandbox.emit).toHaveBeenCalledWith('sandbox:stop', sandbox);

	});

	it('should allow modules to send messages to parent sandbox', function () {

		sandbox.start();
		spyOn(sandbox, 'emit');

		//attach a module after sandbox is started
		var mod = new Stapes.Ui.Module({}, sandbox);

		mod.broadcast('test');
		expect(sandbox.emit).toHaveBeenCalled();


	});

	it('should allow modules to receive messages from parent sandbox', function () {

		sandbox.start();
		spyOn(sandbox, 'on');

		//attach a module after sandbox is started
		var mod = new Stapes.Ui.Module({}, sandbox);

		mod.onBroadcast('test', function() {});
		expect(sandbox.on).toHaveBeenCalledWith('test', jasmine.any(Function));

	});

	it('should allow modules to unregister to messages from parent sandbox', function () {

		sandbox.start();

		spyOn(sandbox, 'off');

		//attach a module after sandbox is started
		var mod = new Stapes.Ui.Module({}, sandbox);

		mod.offBroadcast('test');

		expect(sandbox.off).toHaveBeenCalledWith('test');

	});


});