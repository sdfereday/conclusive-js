define(['help', 'BaseNode'], function(help, BaseNode){

	var TextareaNode = function() {
		BaseNode.call(this);
	}

	help.extend(BaseNode, TextareaNode);

	return TextareaNode;

});