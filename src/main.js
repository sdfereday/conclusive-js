require.config({
    paths: {
    	// "ramda": "",
    	"moment": "libs/bower_components/moment/min/moment.min",
    	"zxcvbn": "libs/bower_components/zxcvbn/dist/zxcvbn",
        "helpers": "util/Helpers",
        "handler": "util/handler",
        "validators": "util/Validators",
        "app": "core/app",
        "BaseNode": "nodes/BaseNode",
        "FormNode": "nodes/FormNode",
        "InputNode": "nodes/InputNode",
        "TextareaNode": "nodes/TextareaNode",
        "rules": "rules"
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