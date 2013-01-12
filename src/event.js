/**
 * 
 */

if(!window.dream) dream = {};

dream.event = {};

dream.event.create = function(obj, name, withCapture){
	Object.defineProperty(obj, name, {
		get : function () {
			return (this.__events && this.__events[name]) || ((this.__events || (this.__events = {})) && (this.__events[name] = new dream.util.EventDispatcher(this, name)));
		}
	});
	if(withCapture) dream.event.create(obj, name+"$capture"); 
};

dream.event.dispatch = function(obj, name){
	var dispatcher;
	if(obj.__events && (dispatcher = obj.__events[name]))
		dispatcher.dispatch.apply(dispatcher,Array.prototype.splice.call(arguments,2));
		
};

dream.event.UIEvent = function(){
	
};