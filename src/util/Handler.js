define(["helpers", "validators", "rules"], function(helpers, validators, rules){

	var handler = {

		events: [],

		skipValid: false,

		setRules: function(obj) {

			var key = "";

			// Make sure to sanitize these. If they don't exist above, then you can't assign them.
			// Should probably make that object immutable actually...
			// Should use the ES6 standard of doing object loops.
			if(obj.rules)
				for(key in obj.rules) {
					if(rules[key] !== "undefined")
						rules[key] = obj.rules[key];
				}

			if(obj.events.length > 0)
				handler.events = obj.events;			

		},

		getDefaultRules: function() {

			return handler.rules;

		},

		setupEvents: function(element, elementNode, formNode){

			// Just uses what we registered from global rules. This will change later.
			// TODO: Sanitize cheeck that the element event is a valid one.
			handler.events.forEach(function(ev){
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

		validatebyTypeOf: function(type, context, relatedNodes, value, cannotBeEmpty)
		{

			handler.skipValid = false;

			var valid = false,
			passwordInfo = {},
			feedback = {
				passwordScore: null,
				ignored: false
			};

			switch(type){
				case "required":
				valid = validators.validateRequired(value.length);
				break;
				case "minlength":
				valid = validators.validateMin(value.length, rules.minLength);
				break;
				case "maxlength":
				valid = validators.validateMax(value.length, rules.maxLength);
				break;
				case "numberonly":
				valid = validators.isNumber(value);
				break;
				case "textonly":
				valid = validators.isText(value);
				break;
				case "ddmmyyyy":
				valid = validators.correctDateFormat(value);
				break;
				case "futuredate":
				valid = validators.dateIsFuture(value);
				break;
				case "pastdate":
				valid = validators.dateIsPast(value);
				break;
				case "birthdate":
				valid = validators.validateBirth(value);
				break;
				case "passwordentry":
				passwordInfo = validators.validatePasswordEntry(value, relatedNodes);
				valid = passwordInfo.isValid;
				feedback.passwordScore = passwordInfo.score;
				break;
				case "passwordconfirm":
				valid = validators.validatePasswordConfirmation(value, relatedNodes);
				break;
				case "email":
				valid = validators.validateEmail(value);
				break;
				case "telephone":
				valid = validators.validateTelephone(value, rules.minLength, rules.maxLength);
				break;
				case "confirmemail":
				valid = validators.confirmEmail(value, relatedNodes);
				break;
				case "postcode":
				valid = validators.validatePostCode(value, context.element);
				break;
				case "cardnumber":
				valid = validators.validateCardNumber(value, context.element);
				break;
				case "expirymonth":
				valid = validators.validateExpiry(value, context, relatedNodes);
				break;
				case "expiryyear":
				valid = validators.validateExpiry(value, context, relatedNodes);
				break;
				case "cvv":
				valid = validators.validateCVV(value);
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

		}

	}

	return handler;

});