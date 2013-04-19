(function(){
/**
 * 
 * @param base
 */
Function.prototype.inherits = function(base){
	//var b = function(){};
	//b.prototype = base.prototype;
	var p = this.prototype = new base;
	if(p.__events){
		for(var i in p.__events){
			dream.event.create(p, i);
		}
	}
	this._superClass = base;
	this.prototype.constructor = this;
	return this;
};

})();

window.URL = window.URL || window.webkitURL;
if(window.performance) window.performance.now = window.performance.now || window.performance.webkitNow();

if (!Function.prototype.bind) {
	  Function.prototype.bind = function (oThis) {
	    if (typeof this !== "function") {
	      // closest thing possible to the ECMAScript 5 internal IsCallable function
	      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	    }
	 
	    var aArgs = Array.prototype.slice.call(arguments, 1), 
	        fToBind = this, 
	        fNOP = function () {},
	        fBound = function () {
	          return fToBind.apply(this instanceof fNOP && oThis
	                                 ? this
	                                 : oThis,
	                               aArgs.concat(Array.prototype.slice.call(arguments)));
	        };
	 
	    fNOP.prototype = this.prototype;
	    fBound.prototype = new fNOP();
	 
	    return fBound;
	  };
	}

/**
 * @namespace This is DreamJS root package.
 */
if(!window.dream) dream = {
	fc: 0,
	hiwc: 0,
	event: {},
	geometry: {},
	behavior: {
		selector: {},
		decorator: {},
		animation: {}
	}
};

dream.DEBUG = false;

/**
 * @constructor
 */
dream.Asset = function(){	
	this.requiredResources = [];
};

/**
 * @namespace dream.event
 */
dream.event.create = function(obj, name, callBack){
	Object.defineProperty(obj, name, {
		configurable: true,
		get : function () {
			if(!this.hasOwnProperty("__events")) 
				this.__events = {};
			
			var d =  this.__events[name] = new dream.event.EventDispatcher(this, name);
			
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

dream.event.buffer = function(obj, name){
	var dispatcher;
	if(obj.__events && (dispatcher = obj.__events[name]))
		dispatcher.buffer.apply(dispatcher);
};

dream.event.removeBuffer = function(obj, name){
	var dispatcher;
	if(obj.__events && (dispatcher = obj.__events[name]))
		dispatcher.removeBuffer.apply(dispatcher);
};

dream.event.clear = function(obj, name){
	var dispatcher;
	if(obj.__events && (dispatcher = obj.__events[name]))
		dispatcher.clear.apply(dispatcher);
};

dream.event.flush = function(obj, name, filter){
	var dispatcher;
	if(obj.__events && (dispatcher = obj.__events[name]))
		dispatcher.flush.call(dispatcher, filter);
};
