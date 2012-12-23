/**
 * 
 */
dream.util = {};

/**
 * @param items
 * @constructor
 */
dream.util.ArrayList = function(items){
	this.keys = {};
	this._index = {};
	
	if(items) this.addArray(items);
}.inherits(Array);

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
	this.keys[nid] = this.push(object) -1;
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
	var r = this.splice(index, 1)[0];
	dream.util.assert(r);
	var gid = dream.util.getId(r);
	var id = this._index[gid];
	delete this.keys[id];
	delete this._index[gid];
	delete this[id];
	for (var i=index, o; o = this[i]; i++ ){
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
	this[index] = newObject;
	
	dream.event.dispatch(this, "onRemove", object);
	dream.event.dispatch(this, "onAdd", newObject);
	return newObject;
};

dream.util.ArrayList.prototype.clear = function(){
	for(var i=0, o; o = this[i]; i++){		
		dream.event.dispatch(this, "onRemove", o);
		delete this[this._index[dream.util.getId(o)]];
		delete this[i];
	}
	this.splice(0, this.length);
	this.keys = [];
	this._index = [];
};

dream.util.ArrayList.prototype.addArray = function(items){
	items && items.forEach(this.add, this);
};

/**
 * @author Ehsan
 * @constructor
 */
dream.util.IndexedArrayList = function(indexes, items){	
	this.indexes = indexes;	
	this.index = {};
	for(var index in this.indexes){
		this.index[index] = {};
	}
	
	dream.util.IndexedArrayList._superClass.call(this, items);	
	
}.inherits(dream.util.ArrayList);

dream.util.IndexedArrayList.prototype.add = function(object, id){
	for(var index in this.indexes){
		var a = this.index[index][object[index]] || (this.index[index][object[index]] = []);
		a.push(object);

		var ar = this;
		
		if (this.indexes[index])
			object[this.indexes[index]].add(function(oldValue){
				var a = ar.index[index][oldValue];
				a.splice(a.indexOf(object),1);
				if(!a.length) delete ar.index[index][oldValue];
				var n = ar.index[index][this[index]] || (ar.index[index][this[index]] = []);
				n.push(object);
			});
		
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

dream.util.Selector.prototype.selectObject = function(obj, i){
	//dream.util.assert(obj != undefined);
	//dream.event.dispatch(this, "onDeselect", this._current);
	this._current = obj;
	this._currentIndex = i;
	dream.event.dispatch(this, "onSelect", obj);
	return obj;
};

dream.util.Selector.prototype.select = function(obj){
	if(typeof obj == "string"){
		return this.selectObject(this[obj], this.indexOf(obj));
	}else if(typeof obj == "number"){
		return this.selectObject(this[obj], obj);
	}else{
		return this.selectObject(obj, this.indexOf(obj));
	}
};

dream.util.Selector.prototype.next = function(step){
	var i = this._currentIndex + (step || 1);
	this.select(i >= this.length ? 0 : i);
};

dream.util.Selector.prototype.previous = function(step){
	var i = this._currentIndex - (step || 1);
	this.select(i < 0 ? this.length -1  : i);
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
	this.forEach(function(l){
		l.apply(obj, args);
	});
};

dream.util.EventDispatcher.prototype.propagate = function(target, event){
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

dream.util.EventDispatcher.prototype.propagateFlagged = function(target, flag){
	return this.add(function(){
		target[flag] = true;
	});
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
		var r = new dream.util.ArrayList;
		for(var i=0,asset; asset=this[i]; i++ )
			r.addArray(asset.requiredResources);
		return r;
	}
});

/**
 * @author Ehsan
 * @constructor
 */
dream.util.RedrawRegionList = function(){
}.inherits(Array);

dream.util.RedrawRegionList.prototype.add = function(rect){
	if(rect.width <=0 || rect.height <= 0) return false;
	for(var i = 0, r; r = this[i]; i++)
		if(rect.hasIntersectWith(r))
			return this.add(this.splice(i,1)[0].add(rect));
	
	return this.push(rect);
};

//dream.util.RedrawRegionList.prototype.addArray = dream.util.ArrayList.prototype.addArray;
dream.util.RedrawRegionList.prototype.addArray = function(items){
	if(items instanceof dream.util.RedrawRegionList)
		for(var i = 0, o; o = items[i]; i++)
			this.push(o);
	else
		for(var i = 0, o; o = items[i]; i++)
			this.add(o);
		
};

dream.util.RedrawRegionList.prototype.clear = function(){
	this.splice(0, this.length);
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
			return window.setTimeout(callback, 1000 / fps);
		};
	}else{
		return window.requestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback, element) {
				return window.setTimeout(callback, 1000 / 60);
			};
	}
};

dream.util.getCancelRequestAnimationFrame = function(fps) {
	if(fps){
		return window.clearTimeout;
	}else{
		return window.cancelRequestAnimationFrame
			|| window.webkitCancelRequestAnimationFrame
			|| window.mozCancelRequestAnimationFrame
			|| window.oCancelRequestAnimationFrame
			|| window.msCancelRequestAnimationFrame
			|| window.clearTimeout;
	}
};

dream.util.assert = function(assertion, message){
	if(!assertion) throw new Error("Assertion failed! " + (message || ""));
};

dream.util.objCount = 0;

dream.util.getId = function(obj){
	return obj.__GID || (obj.__GID = ++dream.util.objCount);
};

dream.util.createProperty = function(obj, name, shadowVariable){
	var sv = shadowVariable || "_"+name;
	return Object.defineProperty(obj, name, {
		get : new Function("return this."+sv),
		set : new Function("v", "this."+sv+"=v;")
	});
};

dream.util.createEventProperty = function(obj, name, changeEvent, shadowVariable){
	var e = changeEvent || "onChange", sv = shadowVariable || "_"+name;
	return Object.defineProperty(obj, name, {
		get : new Function("return this."+sv),
		set : new Function("v", "var o = this."+sv+";this."+sv+"=v;dream.event.dispatch(this, '"+e+"', o);")
	});
};

dream.util.createFlagProperty = function(obj, name, changeFlag, shadowVariable){
	var f = changeFlag || "isChanged", sv = shadowVariable || "_"+name;
	return Object.defineProperty(obj, name, {
		get : new Function("return this."+sv),
		set : new Function("v", "var o = this."+sv+";this."+sv+"=v; if(v!=o) this."+f+" = true;")
	});
};

dream.util.createEventFlagProperty = function(obj, name, changeEvent, changeFlag, shadowVariable){
	var e = changeEvent || "onChange",f = changeFlag || "isChanged", sv = shadowVariable || "_"+name;
	return Object.defineProperty(obj, name, {
		get : new Function("return this."+sv),
		set : new Function("v", "var o = this."+sv+";this."+sv+"=v;dream.event.dispatch(this, '"+e+"', o);if(v!=o) this."+f+" = true;")
	});
};