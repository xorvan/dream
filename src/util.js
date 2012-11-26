/**
 * 
 */
dream.util = {};

/**
 * @author Ehsan
 * @constructor
 */
dream.util.ArrayList = function(items){
	this.items = [];
	this.keys = {};
	this._index = {};
	
	if(items) this.addArray(items);
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

dream.util.ArrayList.prototype.indexOf = function(object){
	if(object instanceof Object){
		return this.keys[this._index[dream.util.getId(object)]];
	}else{
		return this.keys[object];	
	}
};

dream.util.ArrayList.prototype.removeByIndex = function(index){
	dream.util.assert(typeof index == "number");
	var r = this.items.splice(index, 1)[0];
	dream.util.assert(r);
	var gid = dream.util.getId(r);
	var id = this._index[gid];
	delete this.keys[id];
	delete this._index[gid];
	delete this[id];
	for (var i=index, o; o = this.items[i]; i++ ){
		this.keys[this._index[dream.util.getId(o)]] --;		
	}
	dream.event.dispatch(this, "onRemove", r);
	return r;
};

dream.util.ArrayList.prototype.remove = function(object){
	if(typeof object == "number"){
		return this.removeByIndex(i);
	}else{
		var i = this.indexOf(object);
		if(typeof i == "number"){
			return this.removeByIndex(i);
		}else{
			return false;
		}
	}
	
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
	for(var i=0, o; o = this.items[i]; i++){		
		dream.event.dispatch(this, "onRemove", o);
		delete this[this._index[dream.util.getId(o)]];
	}
	this.items = [];
	this.keys = [];
	this._index = [];
};

dream.util.ArrayList.prototype.addArray = function(items){
	for(var i in items) 
		this.add(items[i]);
};

/**
 * @author Ehsan
 * @constructor
 */
dream.util.IndexedArrayList = function(indexes, items){	
	this.indexes = indexes;	
	this.index = [];
	for(var i=0, index; index = this.indexes[i]; i++){
		this.index[index] = {};
	}
	
	dream.util.IndexedArrayList._superClass.call(this, items);	
	
}.inherits(dream.util.ArrayList);

dream.util.IndexedArrayList.prototype.add = function(object, id){
	for(var i=0, index; index = this.indexes[i]; i++){
		var a = this.index[index][object[index]] || (this.index[index][object[index]] = []);  
		a.push(object);
	}
	return dream.util.IndexedArrayList._superClass.prototype.add.call(this, object, id);
};

/**
 * @author Ehsan
 * @constructor
 */
dream.util.Selector = function(items){
	dream.util.Selector._superClass.call(this, items);	
	
}.inherits(dream.util.ArrayList);

dream.event.create(dream.util.Selector.prototype, "onDeselect");
dream.event.create(dream.util.Selector.prototype, "onSelect");

dream.util.Selector.prototype.selectObject = function(obj){
	dream.util.assert(obj != undefined);
	dream.event.dispatch(this, "onDeselect", this._current);
	this._current = obj;
	dream.event.dispatch(this, "onSelect", obj);
	return obj;
};

dream.util.Selector.prototype.select = function(obj){
	if(typeof obj == "string"){
		return this.selectObject(this[obj]);
	}else if(typeof obj == "number"){
		return this.selectObject(this.items[obj]);
	}else{
		return this.selectObject(obj);
	}
};

dream.util.Selector.prototype.next = function(step){
	var i = this.indexOf(this.current) + (step || 1);
	this.select(i >= this.items.length ? 0 : i);
};

dream.util.Selector.prototype.previous = function(step){
	var i = this.indexOf(this.current) - (step || 1);
	this.select(i < 0 ? this.items.length -1  : i);
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
dream.util.EventDispatcher = function(obj, name){
	dream.util.EventDispatcher._superClass.call(this);
	
	this.obj = obj;	
	this.name = name;
	
	this.listeners = {};
	
}.inherits(dream.util.ArrayList);

dream.util.EventDispatcher.prototype.add = function(object, owner){
	var h = dream.util.EventDispatcher._superClass.prototype.add.call(this, object, typeof owner == "string" ? owner : null);
	if(owner){
		var oid = dream.util.getId(owner);
		var l = this.listeners[oid] || (this.listeners[oid] = []);
		l.push(h);
	}
	return h;
};

dream.util.EventDispatcher.prototype.removeByOwner = function(owner){
	var oid = dream.util.getId(owner), l;
	if(l = this.listeners[oid]){
		l.forEach(this.remove, this);
		delete this.listeners[oid];
	}
};

dream.util.EventDispatcher.prototype.dispatch = function(){
	var obj = this.obj;
	var args = arguments;
	this.items.forEach(function(l){
		l.apply(obj, args);
	});
};

dream.util.EventDispatcher.prototype.propagate = function(target, event){
	var e = event || this.name;
	var maps = arguments;
	return this.add(function(){
		var args = [target, e];
		if(maps.length>2)
			for(var i = 2, m; m = maps[i]; i++)
				arguments[i-2] = m instanceof Function ? m(arguments[i-2]) : m;
		if(arguments.length < maps.length - 2) arguments.length = maps.length - 2; 
		Array.prototype.forEach.call(arguments, args.push, args);		
		dream.event.dispatch.apply(null, args);
	}, target);
};

/**
 * @constructor
 */
dream.util.AssetLibrary = function(){
	dream.util.AssetLibrary._superClass.call(this);
	
	this.loader = new dream.preload.Loader();
}.inherits(dream.util.ArrayList);

dream.util.AssetLibrary.prototype.prepare = function(callBack){ 	
	if(callBack) 
		this.loader.onLoad.add(function(){
			callBack();
			//remove
		});

	this.loader.load(this.requiredResources);
};

Object.defineProperty(dream.util.AssetLibrary.prototype, "requiredResources", {
	get : function () {
		var r = [];
		for(var i=0,asset; asset=this.items[i]; i++ )
			r = r.concat(asset.requiredResources);
		return r;
	}
});

/**
 * @author Ehsan
 * @constructor
 */
dream.util.RedrawRegionList = function(){
	dream.util.ArrayList.call(this);
}.inherits(dream.util.ArrayList);

dream.util.RedrawRegionList.prototype.add = function(rect){
	var list = this;
	if(rect.width <=0 || rect.height <= 0) return false;
	for(var i = 0, r; r = this.items[i]; i++){
		if(rect.hasIntersectWith(r)){
			list.remove(r);
			return list.add(r.add(rect));
		}
	}
	return dream.util.RedrawRegionList._superClass.prototype.add.call(this, rect);
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

