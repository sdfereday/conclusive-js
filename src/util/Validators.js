define(["moment", "zxcvbn", "helpers", "rules"], function(moment, zxcvbn, helpers, rules){

	var validators = {

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
			return validators.validateStringMatch(value, emailInput.element.value);

		},

		validateCardNumber: function (value, element) {

	        // strip card number of non-digit characters and confirm its between 13 and 16 characters
	        // remove all whitespace
	        value = value.replace(/\s+/g, '');

	        // Strip anything but numbers from string and validate lengths
	        var rtest = /\D+/g,
	        invalidFound = rtest.exec(value);

	        return !invalidFound && value.length > 12 && value.length < 17 && validators.isNumber(value);

	    },

	    validateYear: function(value)
	    {

	    	return value.length === 4 && validators.isNumber(value);

	    },

	    validateMonth: function(value)
	    {

	    	return value.length === 2 && validators.isNumber(value) && value > 0 && value < 13;

	    },

	    validateBirth: function(value)
	    {

	    	// Matches it to the day, rather than being lapse about it.
	    	var dateCorrect = validators.correctDateFormat(value);

	    	if(!dateCorrect)
	    		return false;

	    	var selectedDate = moment(value, 'DD/MM/YYYY');

	    	// Deprecated - consider changing
	    	return validators.dateIsPast(value) && moment().diff(selectedDate, 'years') >= rules.minAge;

	    },

	    validateExpiry: function(value, context, relatedNodes)
	    {

	    	var month = helpers.findChildNodeByDataTag("expirymonth", relatedNodes),
			year = helpers.findChildNodeByDataTag("expiryyear", relatedNodes);

			var validMonth = validators.validateMonth(month.element.value),
	        validYear = validators.validateYear(year.element.value);

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

	    	return validators.isNumber(value) && value.length === 3;

	    },

		validatePostCode: function(value, element)
		{
			var pattern = new RegExp("(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$");
    		value = value.toUpperCase();
	    	element.value = value;
        	return value && value.length > 0 && pattern.exec(value);
		},

		validateTelephone: function(value, min, max)
		{

			return validators.isNumber(value) && validators.validateMin(value.length, min) && validators.validateMax(value.length, max);

		},

		validatePasswordEntry: function(actual, relatedNodes)
		{
			// Would be nice to have an easy way to show the strength and get its score for the frontend.
			var zxcInfo = zxcvbn(actual);

			return {
				isValid: zxcvbn(actual).score >= rules.minPasswordStrength && actual.length >= rules.minPasswordLength,
				score: zxcInfo.score
			};
		},

		validatePasswordConfirmation: function(actual, relatedNodes)
		{
			// Would be nice to cache this to improve performance.
			var passwordElement = helpers.findChildNodeByDataTag("passwordentry", relatedNodes);
			return validators.validateStringMatch(actual, passwordElement.element.value);
		},

		validateRequired: function(actual, req)
		{
			return validators.validateMin(actual, 1);
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
	        return validators.correctDateFormat(actual) && !moment().isAfter(newMoment) && actual.length > 0;
		},

		dateIsPast: function(actual)
		{
			var newMoment = moment(actual, "DD-MM-YYYY");
	        return validators.correctDateFormat(actual) && moment().isAfter(newMoment) && actual.length > 0;
		}

	};

	return validators;

});