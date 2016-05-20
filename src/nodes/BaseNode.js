define(['help'], function(help){

	var BaseNode = function() {
		return this.create();
	}

	BaseNode.prototype.create = function()
	{
		this.validatorTypes = []; // WIP
		this.errorList = [];
		this.registeredEvents = [];
		this.guid = help.mguid();
 	    this.element = null;
 	    this.parentNode = null;
		return this;
	}

	BaseNode.prototype.registerEvent = function(evt)
	{
		// Will run the validate method on event specified - check this is ok to do. It'll fire multiple times.
		var self = this;

		// Make a volatile array that houses each items name
		var valueArr = this.registeredEvents.map(function(item){ return item });

		// This checks if valType already exists (rather than checking 'after' it's been added)
		var isDuplicate = valueArr.some(function(item, idx){
		    return valueArr.indexOf(evt) > -1;
		});

		// Don't forget to check if we already have it existing!
		if(isDuplicate)
			return;

		this.registeredEvents.push(evt);

		this.element.addEventListener(evt, function(){
			self.validate();
		});

	}

	BaseNode.prototype.registerValidation = function(valType)
	{

		// Make a volatile array that houses each items name
		var valueArr = this.validatorTypes.map(function(item){ return item });

		// This checks if valType already exists (rather than checking 'after' it's been added)
		var isDuplicate = valueArr.some(function(item, idx){
		    return valueArr.indexOf(valType) > -1;
		});

		// Don't forget to check if we already have it existing!
		if(!isDuplicate)
			this.validatorTypes.push(valType);
	}

	BaseNode.prototype.getPresentValue = function()
	{

		return this.element.value;

	}

	BaseNode.prototype.validate = function()
	{

		// Reset and have another go
		this.errorList = [];

		// Use map please. Can we also cache this too? Rules should probably be passed elsewhere.
		this.validatorTypes.forEach(function(str){

			// Stick in a controller?
			var result = help.validatebyTypeOf(str, this.parentNode.getChildren(), this.getPresentValue(), help.getDefaultRules());

			// Ew, but just testing. :)
			if(!result.state){
				this.errorList.push(result);
				console.log("Any extra data?", result.dataFeedback);
			}

		}, this);

		// Should return the 'type' of invalid thing that it is, in case we have multiple types on it.
		// ...

		// Flags parent as having errors
		if(this.errorList.length > 0) {
			// Consider not calling this here, and doing it on the parent form instead.
			this.parentNode.hasErrors = true;
			this.element.style.border = "1px solid red";
		} else {
			// Do a default action (to improve)
			this.element.style.border = "1px solid green";
		}

		return this.errorList.length > 0;

	}

	return BaseNode;

});