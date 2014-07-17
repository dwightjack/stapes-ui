#Stapes UI (WIP)

Stapes UI is a lightweight User Interface library built on top of [Stapes.js](https://github.com/hay/stapes). Its intended usage scenario are small to medium websites where full fledged frameworks like Backbone are _too much_ but you still want to keep your codebase structured and maintainable.

##Overview

Stapes UI requires [Stapes.js](https://github.com/hay/stapes) and [jQuery](http://jquery.com/) (or a jQuery-ish DOM library like [Zepto](http://zeptojs.com/)). It can be consumed as a classical global object or as an AMD / CommonJS module.

##Installation

You may download the latest build or install it with bower (this will install Stapes.js as well):

	bower install stapes-ui --save

Then reference the library and its dependencies in your HTML:

	<script src="/bower_components/stapes/stapes.js"></script>
	<script src="/bower_components/jquery/dist/jquery.js"></script>
	<script src="/bower_components/stapes-ui/dist/stapes-ui.js"></script>


_**Note:** Since jQuery is not a strict dependency, you need to install it separately or use a jQuery compatible library._

##Library Overview
 
Stapes UI consists of three parts:

* **Core** methods and objects to inizialize (`Stapes.Ui.addInitializer`) and bootstrap (`Stapes.Ui.init`) your application, plus a central event hub (`Stapes.Ui.vent`).
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

##Getting started with Modules and Sandboxes

While initializers are a nifty feature, you may need more strucured components for your project. That's what modules and sandboxes are for.

###Modules

A *Module* in Stapes UI is a UI component, like an image gallery or a content slider. Since there're no different interfaces for model and view (like in Backbone) everything reside on a single object. While this might look _dirty_ to some, it's a convenient setup for small UIs.

Here is an example:

	
	<div class="test-module"></div>
	
	<script>
		var TestModule = Stapes.Ui.Module.subclass({
			render: function () {
				this.$el
				.css('color', this.options.color)
				.text('Hi' + this.get('name'));
				return this;
			};
		});
		
		var testModuleInstance = new TestModule({
			$el: $('.test-module'),
			color: 'blue',
			data: {
				name: 'John'
			}
		});

		testModuleInstance.render();
	</script>

The module instance will attach itself to the `#test-module` element and will fill the text with the given data.

###Sandboxes

A *Sandbox* acts as a central hub for modules. Think of it as a panel of your interface where you may place multiple instances of your components, start and stop them while keeping everything separated from other parts of the application.

As an example let's use the previous `TestModule` into a sandbox:

	<div class="test-module"></div>
	
	<script>
		var sandbox = new Stapes.Ui.Sandbox();
			
		//register the module			
		sandbox.register('testModule', {
			selector: '.test-module'
			callback: TestModule
		});
	
		//startup the sandbox
		sandbox.start('#main-panel');
		
	</script>

This way the sandbox will match every `'.test-module'` element inside `'#main-panel'` and for each it'll instantiate `TestModule`.

To kill the sandbox just run: `sandbox.stop()`. This method will cycle throught active modules and run their `.destroy()` method if available.

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

Then, to customize them for a single instance set an attribute `data-sui-<moduleid>-conf` on the DOM element with a JSON-like value:

	<div class="test-module" data-sui-testModule-conf="{{'data': 'name': 'Jane'}, 'color': 'red' }"></div>

If you want to avoid certain elements to be matched just add `data-sui-skip`:

	<div class="test-module" data-sui-skip></div>

This way no instance will be created on that element.
