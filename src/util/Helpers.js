define(["moment"], function(moment){

	var helpers = {

		// Default rules to follow (global for now)
		rules: {
			maxLength: 6,
		  	minLength: 1
		},

		events: [],

		setRules: function(obj) {

			var key = "";

			// Make sure to sanitize these. If they don't exist above, then you can't assign them.
			// Should probably make that object immutable actually...
			// Should use the ES6 standard of doing object loops.
			if(obj.rules)
				for(key in obj.rules) {
					if(helpers.rules[key] !== "undefined")
						helpers.rules[key] = obj.rules[key];
				}

			if(obj.events.length > 0)
				helpers.events = obj.events;			

		},

		getDefaultRules: function() {

			return helpers.rules;

		},

		setupEvents: function(element, elementNode, formNode){

			// Just uses what we registered from global rules. This will change later.
			// TODO: Sanitize cheeck that the element event is a valid one.
			helpers.events.forEach(function(ev){
				elementNode.registerEvent(ev);
			});

		},

		// This 'might' be best as just a static method of a ruleset class.
		setupRuleset: function(type, element, elementNode, formNode){

			elementNode.registerValidation(type);

		},

		validatebyTypeOf: function(type, value, ruleset)
		{

			var valid = false;
			switch(type){
				case "required":
				valid = helpers.validators.validateRequired(value.length);
				break;
				case "minlength":
				valid = helpers.validators.validateMin(value.length, ruleset.minLength);
				break;
				case "maxlength":
				valid = helpers.validators.validateMax(value.length, ruleset.maxLength);
				break;
				case "numberonly":
				valid = helpers.validators.isNumber(value);
				break;
				case "textonly":
				valid = helpers.validators.isText(value);
				break;
				case "ddmmyy":
				valid = helpers.validators.correctDateFormat(value);
				break;
				case "futuredate":
				valid = helpers.validators.dateIsFuture(value);
				break;
				case "pastdate":
				valid = helpers.validators.dateIsPast(value);
				break;
			};

			return {
				type: type,
				state: valid
			};

		},

		validators: {

			validateRequired: function(actual, req)
			{
				return helpers.validators.validateMin(actual, 1);
			},

			validateMin: function(actual, req)
			{	
				return actual >= req;
			},

			validateMax: function(actual, req)
			{
				return actual <= req;
			},

			isNumber: function(actual)
			{
				return !isNaN(actual);
			},

			isText: function(actual)
			{
				return isNaN(actual);
			},

			correctDateFormat: function(actual)
			{

				return moment(actual, "DD-MM-YYYY", true).isValid();

			},

			dateIsFuture: function(actual)
			{

		        var newMoment = moment(actual, "DD-MM-YYYY");
		        return helpers.validators.correctDateFormat(actual) && !moment().isAfter(newMoment) && actual.length > 0;

			},

			dateIsPast: function(actual)
			{

				var newMoment = moment(actual, "DD-MM-YYYY");
		        return helpers.validators.correctDateFormat(actual) && moment().isAfter(newMoment) && actual.length > 0;

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
		}

	}

	return helpers;

});