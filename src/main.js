require.config({
    paths: {
    	// "ramda": "",
    	"moment": "bower_components/moment/min/moment.min",
        "help": "util/Helpers",
        "app": "core/app",
        "BaseNode": "nodes/BaseNode",
        "FormNode": "nodes/FormNode",
        "InputNode": "nodes/InputNode",
        "TextareaNode": "nodes/TextareaNode"
    }
});

require(['app'], function(app){

	"use strict";
	
	// Custom rules (as array) - these are global right now
	var customRules = [
		{
			onSubmit: true,
	  		for: "customa", // Not yet implemented
	    	rules: {
	    		maxLength: 12,
	      		minLength: 2
	    	},
	    	events: ["change", "keyup", "blur"]
	  	}
	];

	// Start things off
	app.start(customRules[0]);

});