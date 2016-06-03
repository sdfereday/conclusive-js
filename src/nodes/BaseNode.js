define(['helpers', 'handler'], function(help, handler){

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
 	    this.required = false;
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

		if(valType === "required") {
			this.required = true;
			this.element.setAttribute("required", true);
			this.element.className = this.element.className && this.element.className.length > 0 ? this.element.className + " required" : "required";
		}

		// Don't forget to check if we already have it existing!
		if(!isDuplicate)
			this.validatorTypes.push(valType);
	}

	BaseNode.prototype.getPresentValue = function()
	{

		return this.element.value;

	}

	// returns: bool
	BaseNode.prototype.validate = function()
	{

		// Reset and have another go
		this.errorList = [];

		// Use map please. Can we also cache this too? Rules should probably be passed elsewhere.
		this.validatorTypes.forEach(function(str){

			// Stick in a controller?
			var result = handler.validatebyTypeOf(str, this, this.parentNode.getChildren(), this.getPresentValue(), this.required);

			// Ew, but just testing. :)
			if(!result.state)
				this.errorList.push(result);

		}, this);

		if(!this.required && this.element.value.length === 0)
			return true;

		if(this.errorList.length > 0)
			this.parentNode.hasErrors = true;

		return this.errorList.length > 0;

	}

	return BaseNode;

});