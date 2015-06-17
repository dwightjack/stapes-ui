#Stapes UI (WIP)

Stapes UI is a lightweight User Interface library built on top of [Stapes.js](https://github.com/hay/stapes). Its intended usage scenario are small to medium websites where full fledged frameworks like Backbone are _too much_ but you still want to keep your codebase structured and maintainable.

##Overview

Stapes UI requires [Stapes.js](https://github.com/hay/stapes). It can be consumed as a classical global object or as an AMD / CommonJS module.

Since it relies on some modern features (like `document.querySelectorAll`), legacy browsers such as IE 8 and below are not currently supported.
 
To support legacy browsers you have to use a supporting DOM library like jQuery 1.x (see _Using a custom DOM Library_ below).

##Installation

You may download the latest build or install it with bower (this will install Stapes.js as well):

	bower install stapes-ui --save

Then reference the library and its dependencies in your HTML:

	<script src="/bower_components/stapes/stapes.js"></script>
	<script src="/bower_components/stapes-ui/dist/stapes-ui.js"></script>

###Using a custom DOM Library

Stapes UI doesn't rely on any DOM library, anyway you may use jQuery or a jQuery compatible library by referencing its constructor function to `Stapes.Ui.$`:

 
	//Use jQuery 1.x as default DOM library
	Stapes.Ui.$ = jQuery;
  

##Library Overview

Stapes UI consists of three parts:

* **Core** methods and objects to initialize (`Stapes.Ui.addInitializer`) and bootstrap (`Stapes.Ui.init`) your application, plus a central event hub (`Stapes.Ui.vent`).
* a **Module** interface for your UI components (`Stapes.Ui.Module`)
* a **Sandbox** constructor to manage and group UI components (`Stapes.Ui.Sandbox`)

##Usage Examples

The most basic but useful usage example of Stapes UI is setting up a list of initializers:

	//Generic initializer
	Stapes.Ui.addInitializer(function () {
		console.log('started!');
	});

	//DOM filtered initializer
	//runs only when the selector matches
	Stapes.Ui.addInitializer('#my-block', function (stapesConf, selector, $matches) {
		console.log($matches.length);
	});

	//more code...

	Stape.Ui.init();

In the second initializer we added a _DOM filter_ which will try to match the given selector before launching the callback. This callback receives three arguments:

* a reference to the current `Stapes.Ui.Config` object
* the provided selector
* a jQuery-like object of the matched elements

On init a `bootstrap` event will be triggered on `Stapes.Ui.vent` 

Note that after `Stape.Ui.init()` is executed every subsequent initializer will be executed right away.

##Global options

`Stapes.Ui.Config` is an object containing the current global configuration. It might be extended at will, anyway default parameters are:
 
* `DEBUG`: (default `false`) enable global event logging 
* `VERBOSE`: (default `false`) verbose logging when `DEBUG` === true

##Getting started with Modules and Sandboxes

While initializers are a nifty feature, you may need more structured components for your project. That's what modules and sandboxes are for.

###Modules

A *Module* in Stapes UI is a UI component, like an image gallery or a content slider. Here is an example:


	<div class="test-module"></div>

	<script>
		var TestModule = Stapes.Ui.Module.subclass({
			render: function () {
				var el = this.el;
                
				el.style.color = this.options.color;
				el.textContent = 'Hi ' + this.get('name');
				
				//always return `this` for chaining
				return this;
			}
		});

		var testModuleInstance = new TestModule({
			el: '.test-module',
			color: 'blue',
			data: {
				name: 'John'
			}
		});

		testModuleInstance.render();
	</script>

The module instance will attach itself to the `.test-module` element and will fill the text with the given data.


####Module default options

Even if you may provide any number of options to a module constructor, some options are used internally and thus promoted to _first class options_:

* `el` {String|NodeList|DOMElement} either a CSS string selector, an array-like object or a DOMElement node or collection (for instance a `document.querySelector` call result).
* `$el` {jQuery-like} jQuery-like object, automatically generated from `el` and used internally as reference.
* `data` {Object} data payload object parsed as [Stapes data](http://hay.github.io/stapes/#m-set). Defaults to `{}`.
* `replace`: {Boolean} replaces the `el` root element with a newly generated element with a template `<{tagName} class="{className}"></div>`. Defaults to `false`.
* `tagName`: {String} Tag name used for generated root element whenever `replace` is `true` or `el` is not provided. Defaults to `'div'`.
* `className`: {String} Class attribute value used for generated root element whenever `replace` is `true` or `el` is not provided. Defaults to `''`.

####Module default methods

Two commonly used methods may be provided to extend `Stapes.Ui.Module`:

* `initialize`: will be called on each module instantiation.
* `render`: a function invoked _on demand_ responsible for DOM manipulations and interface rendering.

	
####Example usage

Here is a complete example:

	<ul id="user-list"></ul>
	<script>
		var User = Stapes.Ui.Module.subclass({
			tagName: 'li'
    		
    		className: 'user-list__item',
    		
    		initialize: function () {
    			//ensure name is a string
    			this.set('name', this.get('name') || '');
    		},
    		
    		render: function () {
    			this.el.innerHTML = this.get('name');
    			return this;
    		}
    	});
    	
    	var userList = document.getElementById('user-list');
    	
    	var els = ['John', 'Jane'].forEach(function (username) {
    		var user = new User({
    			data: {
    				name: username
    			}
    		});
    		userList.appendChild(user.render().el);
    	});
	</script>
	
HTML output will be:

	<ul id="user-list">
		<li class="user-list__item">John</li>
		<li class="user-list__item">Jane</li>
	</ul>


###Sandboxes

A *Sandbox* acts as a central hub for modules. Think of it as a panel of your interface where you may place multiple instances of your components, start and stop them while keeping everything separated from other parts of the application.

As an example let's use the previous `TestModule` into a sandbox:

	<section id="main-panel">
		<div data-sui-module="test-module"></div>
	</section>
	
	<script>
		var sandbox = new Stapes.Ui.Sandbox();

		//register the module
		sandbox.register('testModule', TestModule);

		//startup the sandbox
		sandbox.start('#main-panel');

	</script>

This way the sandbox will match every `*[data-sui-module="test-module"]` element inside `#main-panel` and for each it'll instantiate `TestModule`.
This process will trigger three kind of events on the sandbox instance:

* a `sandbox:update` and a `sandbox:update:<module-name>` for every registered module definition with module configuration object as data.
* a `sandbox:start`

To kill the sandbox just run: `sandbox.stop()`. This method will cycle through active modules and run their `.destroy()` method if available. 
In addition a `sandbox:stop` event will be triggered on the sandbox instance.

While setting the `data-sui-module` is the default behaviour for module-DOM matching, you may use a custom selector:

	<section id="main-panel">
		<div class="test-module"></div>
	</section>
	
	<script>
		var sandbox = new Stapes.Ui.Sandbox();

		//register the module with a custom selector
		sandbox.register('testModule', {
			selector: '.test-module',
			callback: TestModule
		});

		//startup the sandbox
		sandbox.start('#main-panel');

	</script>

###Module defaults and inline configurations

As you may notice there's no way to pass custom data nor options to modules' instances when using sandboxes.

To overcome this problem you may set default data and options in the module's constructor:

	var TestModule = Stapes.Ui.Module.subclass({
		_data: {
			name: 'John'
		},
		_options: {
			color: 'blue'
		},
		render: function () {
			...
		};
	});

Then, to customize them for a single instance set an attribute `data-<modulename>-<option-name>` on the DOM element with custom value:

	<div data-sui-module="test-module" data-test-module-color="red"></div>

To pass custom data values, set an attribute `data-<modulename>-data` with a JSON-like value:

	<div data-sui-module="test-module" data-test-module-data="{'name': 'Jane'}"></div>

If you want to avoid certain elements to be matched just add `data-sui-skip`:

	<div data-sui-module="test-module" data-sui-skip></div>

This way no instance will be created on that element.

###*In-sandbox* events

Both modules and sandboxes inherit [Stapes event methods](http://hay.github.io/stapes/#m-events).

When registered in a sandobox a module can communicate with the parent sandbox by mean of three methods:
 
* `broadcast`: will trigger an event in the parent sandbox ([signature doc](http://hay.github.io/stapes/#m-emit))
* `onBroadcast`: will listen for a sandbox's event ([signature doc](http://hay.github.io/stapes/#m-on))
* `offBroadcast`: removes a listener for a sandbox's event ([signature doc](http://hay.github.io/stapes/#m-off))

###Release History

* 0.2.3 Maintenance release 
 
* 0.2.0 Removed jQuery dependency. `el` promoted to _first class_ parameter. Better module documentation 

* 0.1.0 Refining performances, docs and *In-sandbox* messaging