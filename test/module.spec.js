/*global describe, expect, it, jasmine, beforeEach, spyOn, afterEach */

describe('Base Module', function () {

    beforeEach(function () {
        document.body.innerHTML = window.__html__['test/fixtures/module.html'];
    });

    afterEach(function () {
        document.body.innerHTML = '';
    });



    it('should pass arguments to an initialize method on instance creation', function () {
        spyOn(Stapes.Ui.Module.prototype, 'initialize');
        var testOpts = {test: true};

        new Stapes.Ui.Module(testOpts);

        expect(Stapes.Ui.Module.prototype.initialize).toHaveBeenCalledWith(testOpts);

    });


    it('should set per-instance data', function () {

        var myInst = new Stapes.Ui.Module({
            data: {
                demo: 1
            }
        });

        expect(myInst.get('demo')).toBe(1);

    });

    it('should attach itself to a DOM element', function () {
        var base = document.getElementById('base-module');
        var modInst = new Stapes.Ui.Module({
            el: '#base-module'
        });

        expect(modInst.$el instanceof Stapes.Ui.$).toBe(true);
        expect(modInst.el).toBe(base);

    });

    it('should accept DOM nodes as $el', function () {
        var base = document.getElementById('base-module');
        var modInst = new Stapes.Ui.Module({
            $el: base
        });

        expect(modInst.$el instanceof Stapes.Ui.$).toBe(true);
        expect(modInst.el).toBe(base);

    });

    it('should replace the root element on options.replace = true', function () {

        var modInst = new Stapes.Ui.Module({
            el: '#replace-me',
            replace: true,
            tagName: 'h1',
            className: 'replaced'
        });

        expect(modInst.$el[0].tagName).toBe('H1');
        expect(modInst.$el[0].className).toBe('replaced');

        //also replaced in DOM
        expect(document.querySelectorAll('h1.replaced').length).toBe(1);

    });


    it('should be extendable and inherit its constructor from Stapes.Ui.Module', function () {

        var MyModule = Stapes.Ui.Module.subclass({
            myMethod: function () {
            }
        });

        var modInstance = new MyModule();

        expect(modInstance.myMethod).toEqual(jasmine.any(Function));
        //options object has been created by inherited constructor
        expect(modInstance.options).toEqual(jasmine.any(Object));

    });

    it('shuold allow default data and options', function () {
        var MyModule = Stapes.Ui.Module.subclass({
            _options: {
                say: 'Hello'
            },
            _data: {
                name: 'Jane',
                surname: 'Doe'
            },
            greet: function () {
                return [this.options.say, this.get('name'), this.get('surname')].join(' ');
            }
        });

        var myInst = new MyModule({
            data: {name: 'John'}
        });

        expect(myInst.greet()).toBe('Hello John Doe');

    });


});