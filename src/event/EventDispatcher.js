(function(window){
	
/**
 * @author Ehsan
 * @constructor
 */
var EventDispatcher = function(obj, name){
	dream.event.EventDispatcher._superClass.call(this);
	
	this.obj = obj;	
	this.name = name;
	
	this.listeners = {};
	
}.inherits(dream.collection.List);
var EventDispatcher$ = EventDispatcher.prototype;

EventDispatcher$.add = function(fn, owner){
	var h = dream.event.EventDispatcher._superClass.prototype.add.call(this, fn, typeof owner == "string" ? owner : null);
	if(owner){
		var oid = dream.util.getId(owner);
		var l = this.listeners[oid] || (this.listeners[oid] = []);
		l.push(this.length);
	}
	
	if(this.length == 1){
		this.dispatch = this[0].bind(this.obj);
	}else{
		delete this.dispatch;
	}
	
	return h;
};

EventDispatcher$.addTemp = function(object, owner){
	var tmpFn, event = this;
	this.add(tmpFn = function(){
		event.remove(tmpFn);
		object && object.call(this);		
	}, owner);
};

EventDispatcher$.removeByOwner = function(owner){
	var oid = dream.util.getId(owner), l;
	if(l = this.listeners[oid]){
		for(var i = 0, ll = l.length; i < ll; i++)
			this.removeByIndex(i);
		delete this.listeners[oid];
	}
};

EventDispatcher$.dispatch = function(){
	var obj = this.obj;
	for(var i = 0, l = this.length; i < l; i++)
		this[i].apply(obj, arguments);
};

EventDispatcher$.buffer = function(){
	this.queue = [];
	this.dispatch = function(){
		this.queue.push(arguments);
	};
};

EventDispatcher$.flush = function(filter){
	var queue = filter ? (filter(this.queue) || this.queue) : this.queue,
		obj = this.obj;
	
	for(var ii = 0, ll = queue.length; ii < ll; ii++){
		var args = queue[ii];
		//dispatch inlined
		for(var i = 0, l = this.length; i < l; i++)
			this[i].apply(obj, args);
	}
	this.queue = [];
};

EventDispatcher$.clear = function(){
	this.queue = [];
};

EventDispatcher$.removeBuffer = function(){
	delete this.queue;
	delete this.dispatch;
};

EventDispatcher$.propagate = function(target, event){
	var e = event || this.name;
	var maps = Array.prototype.splice.call(arguments, 2, arguments.length);
	return this.add( maps.length ? 
		function(){
			for(var i = 0, m; m = maps[i]; i++)
				arguments[i] = m.call(target, arguments[i]);			
				
			if(arguments.length < maps.length) arguments.length = maps.length;
			
			var dispatcher;
			if(target.__events && (dispatcher = target.__events[e]))
				dispatcher.dispatch.apply(dispatcher, arguments);
				
		} : 
		function(){
			var dispatcher;
			if(target.__events && (dispatcher = target.__events[e]))
				dispatcher.dispatch.apply(dispatcher, arguments);
			
		},
	target);
};

EventDispatcher$.propagateFlagged = function(target, flag){
	return this.add(function(){
		target[flag] = true;
	});
};

dream.event.EventDispatcher = EventDispatcher;

})(window);
