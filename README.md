#Stapes UI

Stapes UI is a lightweight User Interface library built on top of [Stapes.js](https://github.com/hay/stapes). Its intended usage scenario is small to medium websites where full fledged frameworks like Backbone are _too much_ but you still want to keep your codebase structured and maintainable.

##Overview

Stapes UI requires [Stapes.js](https://github.com/hay/stapes) and a jQuery-ish DOM framework (like [Zepto](http://zeptojs.com/) or [jQuery](http://jquery.com/) itself). Like Stapes.js, it can be used as classical global object or as AMD / CommonJS module.

##Installation

You may download the latest build or install it with bower (this will install Stapes.js as well):

	bower install stapes-ui --save

Then reference the library and its dependencies in your HTML:

<script src="/bower_components/stapes/stapes.js"></script>
<script src="/bower_components/jquery/dist/jquery.js"></script>
<script src="/bower_components/stapes-ui/dist/stapes-ui.js"></script>


_**Note:** Since jQuery is not a strict dependency, you need to install it separately or use a jQuery compatible library._

##Usage Example

