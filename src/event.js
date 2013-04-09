/**
 * 
 */

if(!window.dream) dream = {};

dream.event = {};

dream.event.create = function(obj, name, callBack){
	Object.defineProperty(obj, name, {
		configurable: true,
		get : function () {
			if(!this.hasOwnProperty("__events")) 
				this.__events = {};
			
			var d =  this.__events[name] = new dream.util.EventDispatcher(this, name);
			
			Object.defineProperty(this, name, {
				configurable: true,
				value:d
			});
			if(callBack) callBack.call(this);
			
			return d;
		}
	});
};

dream.event.createWithCapture = function(obj, name, callBack, captureCallBack){
	dream.event.create(obj, name, callBack);
	dream.event.create(obj, name + "$capture", captureCallBack);
};

dream.event.dispatch = function(obj, name){
	var dispatcher;
	if(obj.__events && (dispatcher = obj.__events[name]))
		dispatcher.dispatch.apply(dispatcher,Array.prototype.splice.call(arguments,2));
		
};

dream.event.UIEvent = function(){
	
};