define(['help', 'InputNode', 'TextareaNode'], function(help, InputNode, TextareaNode){

	// A data object that resembles a form.
	var FormNode = function() {
	  this.guid = help.mguid();
	  this.element = null;
	  this.children = [];
	  this.hasErrors = false;
	  this.runOnSubmit = false;
	  return this.create();
	};

	FormNode.prototype.create = function() {
	  // Just doing it the usual way for now
	  return this;
	};

	FormNode.prototype.bindElement = function(el, options) {
		var self = this;
		this.element = el;
		this.element.setAttribute("data-id", this.guid);
		if(typeof options.onSubmit === "undefined" || options.onSubmit)
		{
			this.runOnSubmit = true;
			this.element.addEventListener("submit", function(e){
				// How to get to work with context?
				self.submitted(e);
			}, true);
		}
		// Get's the list of elements to validate
		this.collectElements();
		// Finds out just how to validate each element
		this.parseCollection();
		return this;
	};

	FormNode.prototype.collectElements = function() {

		// So far none-recurisve
		var childNodes = this.element.getElementsByTagName("input"),
		len = childNodes.length,
		i = 0;
		for (i; i < childNodes.length; i += 1) {
			var cn = new InputNode();
			cn.element = childNodes[i];
			cn.parentNode = this;
			this.children.push(cn);
		}

		childNodes = this.element.getElementsByTagName("textarea");
		len = childNodes.length;
		i = 0;
		for (i; i < childNodes.length; i += 1) {
			var cn = new TextareaNode();
			cn.element = childNodes[i];
			cn.parentNode = this;
			this.children.push(cn);
		}

	};

	FormNode.prototype.parseCollection = function() {

		// Finally we can use it here.
		this.children.forEach(function(cn){
	  
			cn.element.getAttribute("data-validateon").split(" ").forEach(function(cls){
				help.setupRuleset(cls, cn.element, cn, this);
				help.setupEvents(cn.element, cn, this);
			});

		}, this);

	};

	FormNode.prototype.callChildValidation = function(ch)
	{
		if(typeof ch.validate === "function")
			return ch.validate.call(ch);
	}

	FormNode.prototype.submitted = function(e) {

		console.log("Attempting to submit form: " + this.guid);

		// Doesn't submit right now.		
		e.preventDefault();

	  	if(this.runOnSubmit)
	  		this.hasErrors = this.children.map(this.callChildValidation).find(function(item){
	  			return item;
	  		});
	  	
	  	if(this.hasErrors) {
	  		console.log("Your form has validation errors (id): " + this.guid);
	  	} else {
	  		console.log("Success! (this is a test)");
	  		this.element.submit();
	  	}

	};

	return FormNode;

});