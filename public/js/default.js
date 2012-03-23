$(function() {
	$('.viewOutput').click(function(e){
		var formdata = form2js('config', '.');
		var json = JSON.stringify(formdata, undefined, 2);
		var syntaxHighlightedJson = syntaxHighlight(json);
		
		$('#output').html('<pre>' + syntaxHighlightedJson + '</pre>');
		$('#json').val(json);
	});
	
	$('.endpointActuator').live('click', showEndpoint);
	
	$('#addEndpoint').click(addEndpoint);
	
	$('input.endpointName').live('change', updateEndpointName)
	$('input.methodName').live('change', updateMethodName)
	$('.section.clickable').live('click', toggleSection)
	
	//$('input.parameterName').live('change', updateParameterName)
});

var toggleSection = function(e) {
	var clicked = $(e.target);
	var target = clicked.attr('target');
	
	$(target).slideToggle();
}

var showEndpoint = function(e) {
	e.preventDefault();
	var actuator = e.target;
	var id = actuator.id.replace("endpointActuator","");
	var div = $('#ep' + id);

	$('#start').hide();

	//if the clicked div is already showing, do nothing
	if(div.is(":visible"))
		return;

	//hide all divs
	$('.endpoint').hide();

	//show the div corresponding to what was clicked
	$('#ep' + id).show('slow');
};

var updateEndpointName = function(e) {
	var input = $(e.target);
	
	var endpointIndex = input.closest('.endpoint').attr('id').replace('ep','');
	var menuItem = $('#endpointActuator' + endpointIndex);

	menuItem.html(input.val());
}

var updateMethodName = function(e) {
	var span = $(e.target).closest('.method').find('.methodNameSpan');
	span.html($(e.target).val());
	
	var methodIndex = $(e.target).closest('.method').attr('methodIndex');
	var endpointIndex = $(e.target).closest('.method').attr('endpointIndex');
	var menuItem = $('#endpoint' + endpointIndex + 'method' + methodIndex +'Actuator');

	menuItem.html($(e.target).val());
}

//from http://stackoverflow.com/questions/4810841/json-pretty-print-using-javascript
var syntaxHighlight = function(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

//TODO refactor these methods into 3 objects - endpoint, method, parameter
var addEndpoint = function(){
	var endpointIndex = getEndpointIndex();
	
	var newEndpoint = $('#endpointTemplate').children('div').first().clone();
	newEndpoint = updateEndpoint(newEndpoint, newId);
	
	newEndpoint.appendTo('#config');
	
	//add the new Endpoint to the menu
	var newMenuItem = $("#endpointMenuTemplate").children('li').first().clone();
	newMenuItem = updateEndpointMenuItem(newMenuItem, newId);
	newMenuItem.appendTo('#endpointList');

	//all endpoints must have at least one method, so add a blank method here
	addMethod(endpointIndex);
	
	//hide the initial instructions
	$('#start').hide();
		
	//hide all divs
	$('.endpoint').hide();

	//show the div corresponding to what was clicked
	$('#ep' + endpointIndex).show('slow');
}

var getEndpointIndex = function() { 
	newId = parseInt($('#endpointCounter').val()) + 1;
	$('#endpointCounter').val(newId);	
	return newId;
}

var initializeEndpoint = function(endpoint){
	newId = parseInt($('#endpointCounter').val()) + 1;
	$('#endpointCounter').val(newId);
}

var updateEndpoint = function(endpoint, newId) {
	endpoint.attr('id', 'ep' + newId);
	
	//update the name and id of each child input
	endpoint.find('input').each(function(){
		$(this).attr('id', $(this).attr('id').replace('blank', newId));
		$(this).attr('name', $(this).attr('name').replace('blank', newId));
	});
	
	//update the for attribute of each child label
	endpoint.find('label').each(function(){
		$(this).attr('for', $(this).attr('for').replace('blank', newId));
	});
	
	return endpoint;
}

var updateEndpointMenuItem = function(menuItem, newId) {
	link = menuItem.children('a').first();
	link.attr('id', link.attr('id').replace('blank', newId));
	link.text("New Endpoint");
	return menuItem;
}

var addMethod = function(endpointIndex) {
	var newMethod = $('#methodTemplate').children('li').first().clone();
		
	methodIndex = getMethodIndex(endpointIndex);
	updateMethod(newMethod, endpointIndex, methodIndex);
	
	var methodList = $('#ep' + endpointIndex).children('ul').first();
	newMethod.appendTo(methodList);

}

var getMethodIndex = function(endpointIndex) {
	//if this is the first method for the endpoint, we need to add a method counter
	if(!'#endpoint' + endpointIndex + 'MethodCounter') {
		counterTemplate = $('#methodCounterTemplate').children('input').first().clone();
		counterTemplate.attr('id', counterTemplate.attr('id').replace('!endpoint!', endpointIndex));
		counterTemplate.appendTo('#config');
	}
	
	counter = $("#endpoint" + endpointIndex + "MethodCounter");
	index = parseInt(counter.val()) + 1;
	$("#endpoint" + endpointIndex + "MethodCounter").val(index);
	return index;
}

var updateMethod = function(method, endpointIndex, methodIndex) {
	//update the name and id of each child input
	method.find('input').each(function(){
		$(this).attr('id', $(this).attr('id').replace('!endpoint!', endpointIndex));
		$(this).attr('id', $(this).attr('id').replace('!method!', methodIndex));	
		$(this).attr('name', $(this).attr('name').replace('!endpoint!', endpointIndex));
		$(this).attr('name', $(this).attr('name').replace('!method!', methodIndex));
	});
	
	method.find('div').each(function(){
		if($(this).attr('id')) {
			$(this).attr('id', $(this).attr('id').replace('!endpoint!', endpointIndex));
			$(this).attr('id', $(this).attr('id').replace('!method!', methodIndex));	
		}
	});
	
	
	//update the for attribute of each child label
	method.find('label').each(function(){
		if($(this).attr('for')) {
			$(this).attr('for', $(this).attr('for').replace('!endpoint!', endpointIndex));
			$(this).attr('for', $(this).attr('for').replace('!method!', methodIndex));
		}
	});
	
	section = method.find(".section").first();
	section.attr('target', section.attr('target').replace('!endpoint!', endpointIndex));
	section.attr('target', section.attr('target').replace('!method!', methodIndex));
	
	return method;
}

//Deleting an endpoint :-
//nuke all child parameters and methods
//update the endpointXMethodCounter after removing all the methods
//select all the endpoints that had an index higher than the one removed, and decrease each index by 1



