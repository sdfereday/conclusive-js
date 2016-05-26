define(["moment", "zxcvbn"], function(moment, zxcvbn){

	var helpers = {

		// Default rules to follow (global for now)
		rules: {
			maxLength: 6,
		  	minLength: 1,
		  	minPasswordLength: 8,
		  	minPasswordStrength: 3 // Out of 0 to 4
		},

		events: [],

		skipValid: false,

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

		findChildNodeByDataTag: function(str, nodes)
		{

			return nodes.find(function(node){
				return node.element.getAttribute("data-validate").indexOf(str) > -1;
			})

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

			if(type === "confirmemail" || type === "nopaste") {
				element.addEventListener("paste", function(e){
					e.preventDefault();
				});
			}

			elementNode.registerValidation(type);

		},

		validatebyTypeOf: function(type, context, relatedNodes, value, ruleset, cannotBeEmpty)
		{

			helpers.skipValid = false;

			var valid = false,
			passwordInfo = {},
			feedback = {
				passwordScore: null,
				ignored: false
			};

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
				case "ddmmyyyy":
				valid = helpers.validators.correctDateFormat(value);
				break;
				case "futuredate":
				valid = helpers.validators.dateIsFuture(value);
				break;
				case "pastdate":
				valid = helpers.validators.dateIsPast(value);
				break;
				case "passwordentry":
				passwordInfo = helpers.validators.validatePasswordEntry(value, relatedNodes);
				valid = passwordInfo.isValid;
				feedback.passwordScore = passwordInfo.score;
				break;
				case "passwordconfirm":
				valid = helpers.validators.validatePasswordConfirmation(value, relatedNodes);
				break;
				case "email":
				valid = helpers.validators.validateEmail(value);
				break;
				case "confirmemail":
				valid = helpers.validators.confirmEmail(value, relatedNodes);
				break;
				case "postcode":
				valid = helpers.validators.validatePostCode(value, context.element);
				break;
				case "cardnumber":
				valid = helpers.validators.validateCardNumber(value, context.element);
				break;
				case "expirymonth":
				valid = helpers.validators.validateExpiry(value, context, relatedNodes);
				break;
				case "expiryyear":
				valid = helpers.validators.validateExpiry(value, context, relatedNodes);
				break;
				case "cvv":
				valid = helpers.validators.validateCVV(value);
				break;
			};

			// If cannotBeEmpty isn't set, and the length of val is equal to zero,
			// then it's okay to validate this one.
			if(!cannotBeEmpty && value.length === 0) {
				valid = true;
				feedback.ignored = true;
			}

			// If not validated already this cycle, then approve
			helpers.markValid(context.element, valid && context.errorList.length === 0);

			return {
				type: type,
				state: valid,
				dataFeedback: feedback
			};

		},

		validators: {

			validateEmail: function(value)
			{

				// ... This is a work in progress.
				// Must be careful when validating email addresses.
				// http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
				// http://www.regular-expressions.info/email.html
				// This makes a simple layout check, nothing more, nothing less right now.
				var re = /\S+@\S+\.\S+/;
			    return re.test(value);

			},

			confirmEmail: function(value, relatedNodes)
			{

				var emailInput = helpers.findChildNodeByDataTag("email", relatedNodes);
				return helpers.validators.validateStringMatch(value, emailInput.element.value);

			},

			validateCardNumber: function (value, element) {

		        // strip card number of non-digit characters and confirm its between 13 and 16 characters
		        // remove all whitespace
		        value = value.replace(/\s+/g, '');

		        // Strip anything but numbers from string and validate lengths
		        var rtest = /\D+/g,
		        invalidFound = rtest.exec(value);

		        return !invalidFound && value.length > 12 && value.length < 17 && helpers.validators.isNumber(value);

		    },

		    validateYear: function(value)
		    {

		    	return value.length === 4 && helpers.validators.isNumber(value);

		    },

		    validateMonth: function(value)
		    {

		    	return value.length === 2 && helpers.validators.isNumber(value) && value > 0 && value < 13;

		    },

		    validateExpiry: function(value, context, relatedNodes)
		    {

		    	var month = helpers.findChildNodeByDataTag("expirymonth", relatedNodes),
				year = helpers.findChildNodeByDataTag("expiryyear", relatedNodes);

				var validMonth = helpers.validators.validateMonth(month.element.value),
		        validYear = helpers.validators.validateYear(year.element.value);

		        var dummyMoment = moment(month.element.value + "-" + year.element.value, "MM-YYYY"),
		        isInFuture = !moment().isAfter(dummyMoment),
		        dateValid = dummyMoment.isValid();

		        var allValid = validMonth && validYear && isInFuture && dateValid;

		        helpers.markValid(month.element, allValid);
		        helpers.markValid(year.element, allValid);

		        return allValid;

		    },

		    validateCVV: function(value)
		    {

		    	return helpers.validators.isNumber(value) && value.length === 3;

		    },

			validatePostCode: function(value, element)
			{
				var pattern = new RegExp("(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$");
        		value = value.toUpperCase();
    	    	element.value = value;
	        	return value && value.length > 0 && pattern.exec(value);
			},

			validatePasswordEntry: function(actual, relatedNodes)
			{
				// Would be nice to have an easy way to show the strength and get its score for the frontend.
				var zxcInfo = zxcvbn(actual);

				return {
					isValid: zxcvbn(actual).score >= helpers.rules.minPasswordStrength && actual.length >= helpers.rules.minPasswordLength,
					score: zxcInfo.score
				};
			},

			validatePasswordConfirmation: function(actual, relatedNodes)
			{
				// Would be nice to cache this to improve performance.
				var passwordElement = helpers.findChildNodeByDataTag("passwordentry", relatedNodes);
				return helpers.validators.validateStringMatch(actual, passwordElement.element.value);
			},

			validateRequired: function(actual, req)
			{
				return helpers.validators.validateMin(actual, 1);
			},

			validateStringMatch: function(a, b)
			{
				// Match won't care if the whole string is different, only that the string is within the original.
				// http://stackoverflow.com/questions/3172985/javascript-use-variable-in-string-match
				var re = new RegExp(b, 'g');
				return a.match(re) && a.length === b.length;
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