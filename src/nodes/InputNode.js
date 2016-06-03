define(['helpers', 'BaseNode'], function(help, BaseNode){

	var InputNode = function() {
		BaseNode.call(this);
	}

	help.extend(BaseNode, InputNode);

	return InputNode;

});