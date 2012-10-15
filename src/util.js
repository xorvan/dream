/**
 * 
 */
dream.util = {};

/**
 * @author Ehsan
 * @constructor
 */
dream.util.ArrayList = function(){
	this.items = [];
	this.keys = {};
	this._index = {};
	
};

dream.event.create(dream.util.ArrayList.prototype, "onAdd");	
dream.event.create(dream.util.ArrayList.prototype, "onRemove");

/**
 * @param object
 * @param {string} [id]
 */
dream.util.ArrayList.prototype.add = function(object, id){
	dream.util.assert(object);
	var gid = dream.util.getId(object);
	if(this._index[gid]) return object;
	
	var nid = id || "id" + gid;
	if(this.keys[nid] != undefined) {console.log(nid+" replaced!");this.remove(nid);};
	
	this._index[gid] = nid;
	this.keys[nid] = this.items.push(object) -1;
	this[nid] = object;
	dream.event.dispatch(this, "onAdd", object);
	return object;
};

dream.util.ArrayList.prototype.removeByIndex = function(index){
	var r = this.items.splice(index, 1)[0];
	dream.util.assert(r);
	var gid = dream.util.getId(r);
	var id = this._index[gid];
	delete this.keys[id];
	delete this._index[gid];	
	for (var i=index, o; o = this.items[i]; i++ ){
		this.keys[this._index[dream.util.getId(o)]] --;		
	}
	dream.event.dispatch(this, "onRemove", r);
	return r;
};

dream.util.ArrayList.prototype.remove = function(object){
	var i;
	if(object instanceof Object){
		var id = this._index[dream.util.getId(object)];
		i = this.keys[id];
	}else{
		i = this.keys[object];
	}
	return this.removeByIndex(i);
};

dream.util.ArrayList.prototype.replace = function(object, newObject, id){
	dream.util.assert(object);
	dream.util.assert(newObject);
	var gid = dream.util.getId(object);
	var ngid = dream.util.getId(newObject);
	var nid = id || "id" + ngid;
	
	var pid = this._index[gid];
	delete this._index[gid];
	this._index[ngid] = nid;
	var index = this.keys[pid];
	this.keys[nid] = index;
	delete this.keys[pid];
	this.items[index] = newObject;
	
	dream.event.dispatch(this, "onRemove", object);
	dream.event.dispatch(this, "onAdd", newObject);
	return newObject;
};

dream.util.ArrayList.prototype.clear = function(){
	this.items = [];
	this.keys = [];
	this._index = [];
};

/**
 * @author Ehsan
 * @constructor
 */
dream.util.Selector = function(){
	dream.util.Selector._superClass.call(this);	
	
}.inherits(dream.util.ArrayList);

dream.event.create(dream.util.Selector.prototype, "onDeselect");
dream.event.create(dream.util.Selector.prototype, "onSelect");

dream.util.Selector.prototype.selectObject = function(obj){
	dream.event.dispatch(this, "onDeselect");
	this._current = obj;
	dream.event.dispatch(this, "onSelect");			
};

dream.util.Selector.prototype.select = function(obj){
	if(typeof obj == "string"){
		this.selectObject(this[obj]);
	}else if(typeof obj == "number"){
		this.selectObject(this.items[obj]);
	}else{
		this.selectObject(this[obj]);
	}
};

Object.defineProperty(dream.util.Selector.prototype, "current", {
	get : function () {
		return this._current;
	},
	set : function (v) {
		this.selectObject(v);
	}
});

/**
 * @author Ehsan
 * @constructor
 */
dream.util.EventDispatcher = function(obj){
	dream.util.EventDispatcher._superClass.call(this);
	
	this.obj = obj;	
	
}.inherits(dream.util.ArrayList);

dream.util.EventDispatcher.prototype.dispatch = function(){
	var obj = this.obj;
	var args = arguments;
	this.items.forEach(function(l){
		l.apply(obj, args);
	});
};

/**
 * @constructor
 */
dream.util.BufferCanvas = function(width, height){
	this.canvas = document.createElement("canvas");

	this.canvas.width = width;
	this.canvas.height = height;
	this.context = this.canvas.getContext("2d");	
};

dream.util.getRequestAnimationFrame = function(fps) {
	if(fps){
		return function(callback, element) {
			window.setTimeout(callback, 1000 / fps);
		};
	}else{
		return window.requestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback, element) {
				window.setTimeout(callback, 1000 / 60);
			};
	}
};

dream.util.getCancelRequestAnimationFrame = function(fps) {
	if(fps){
		return function(callback, element) {
			window.clearTimeout;
		};
	}else{
		return window.cancelRequestAnimationFrame
			|| window.webkitCancelRequestAnimationFrame
			|| window.mozCancelRequestAnimationFrame
			|| window.oCancelRequestAnimationFrame
			|| window.msCancelRequestAnimationFrame
			|| window.clearTimeout;
	}
};

dream.util.assert = function(assertion){
	if(!assertion) throw new Error("Assertion failed!");
};

dream.util.objCount = 0;

dream.util.getId = function(obj){
	return obj.__GID || (obj.__GID = ++dream.util.objCount);
};