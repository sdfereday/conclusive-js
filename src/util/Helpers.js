define(function(){

	var helpers = {

		findChildNodeByDataTag: function(str, nodes)
		{

			return nodes.find(function(node){
				return node.element.getAttribute("data-validate").indexOf(str) > -1;
			})

		},

		markValid: function(element, state)
		{

			if(!state)
			{
				helpers.removeClass(element, "valid");
				helpers.addClass(element, "invalid");
			} else {
				helpers.removeClass(element, "invalid");
				helpers.addClass(element, "valid");
			}

		},

		mguid: function() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
		},

		isArray: function(potential)
		{
			return Object.prototype.toString.call( potential ) === '[object Array]';
		},

		containsClass: function(element, str)
		{

			if(helpers.isArray(str)) {

				return str.find(function(substr){
					if(element)
						return element.className.indexOf(substr) > -1;
				}) ? element : null;

			}

			return element && element.className.indexOf(str) > -1;

		},

		// Attempts to retrieve parent by class name
		getParentByClassName: function(element, parentClass, maxDepth, currentMax)
		{

			if(!maxDepth)
				maxDepth = 2;

			if(!currentMax)
				currentMax = 1;

			// Check if class exists on element, and if element exists at all
			var found = helpers.containsClass(element.parentElement, parentClass);

			// If we've not yet gotten to the max allowed, yet have a parent element, but haven't found anything
			if(currentMax < maxDepth && element.parentElement && !found)
				return this.getParentByClassName(element.parentElement, parentClass, maxDepth, currentMax)

			// If we've hit the max, check if we've found anything, otherwise null.
			return found ? element.parentElement : null;

		},

		// http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
		extend: function(base, sub) {
			// Avoid instantiating the base class just to setup inheritance
			// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
			// for a polyfill
			// Also, do a recursive merge of two prototypes, so we don't overwrite 
			// the existing prototype, but still maintain the inheritance chain
			// Thanks to @ccnokes
			var origProto = sub.prototype;
			sub.prototype = Object.create(base.prototype);
			for (var key in origProto)  {
				sub.prototype[key] = origProto[key];
			}
			// Remember the constructor property was set wrong, let's fix it
			sub.prototype.constructor = sub;
			// In ECMAScript5+ (all modern browsers), you can make the constructor property
			// non-enumerable if you define it like this instead
			Object.defineProperty(sub.prototype, 'constructor', { 
				enumerable: false, 
				value: sub 
			});
		},

		addClass: function(element, str)
		{

			// IE10+ only.
			// element.className = element.className && element.className.length > 0 ? element.className + " " + str : str;
			element.classList.add(str);

		},

		removeClass: function(element, str)
		{

			// IE10+ only.
			// element.className = //
			element.classList.remove(str);

		},

		resetClasses: function(element)
		{

			element.classList.remove("valid");
			element.classList.remove("invalid");

		}

	}

	return helpers;

});