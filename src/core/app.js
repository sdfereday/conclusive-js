define(['FormNode', 'handler'], function(FormNode, handler){
	
	var App = function() {
	  
	  this.formNodes = [];
	  return this;

	};

	App.prototype.start = function(customRules) {
		
		if(customRules !== null)
			handler.setRules(customRules);

		this.getFormNodes(customRules);
	
	};

	App.prototype.getFormNodes = function(options) {

	  var forms = document.getElementsByTagName("form");

	  // We're dealing with a html array, it's not the same sadly.
	  for (var i = 0; i < forms.length; i += 1) {
	    var fm = new FormNode();
	    fm.bindElement(forms[i], options);
	    this.formNodes.push(fm);
	  }

	}

	return new App();

});