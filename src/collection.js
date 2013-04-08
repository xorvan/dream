(function(){

var Collection = function(){
	
}.inherits(Array);
var $ = Collection.prototype;

dream.event.create($, "onAdd");	
dream.event.create($, "onRemove");

$.indexOf = function(obj){
	var i=0, l = this.length-1;
	while(i++ != l)
		if(this[i] == obj) return i;
};

$.addArray = function(items){
	if (items)
		for (var i = 0; i < items.length; i++)
			this.add(items[i],"item"+i);
	
};

$.push = function(item){
	var r = Array.prototype.push.call(this, item);
	dream.event.dispatch(this, "onAdd", item);
	return r;
};

var List = function(arr){
	if (arr){
		for(var i=0; i< arr.length;i++)
			this.push(arr[i]);
	}
}.inherits(Collection);	
	
var $ = List.prototype;

$.add = function(obj){
	this.push(obj);
	return obj;
};

$.pop = function(){
	var obj = this[this.length-1];
	this.length--;
	dream.event.dispatch(this, "onRemove", obj);
	return obj;
};

$.shift = function(){
	var obj = this[0];
	dream.event.dispatch(this, "onRemove", obj);
	return obj;
};

$.at = function(n){
	return this[n];
};

$.insert = function(index, obj){
	this.splice(index,0,obj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
};

$.removeByIndex = function(index){
	var obj = this.splice(index,1)[0];
	dream.event.dispatch(this, "onRemove", obj);
	return obj;
};

$.put = function(index, obj){
	var oldObj = this[index];
	this[index]=obj;
	if(oldObj) dream.event.dispatch(this, "onRemove", oldobj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
};
	
$.remove = function(obj)	{
	for (var i = 0; i < this.length; i++)
		if (this[i] == obj)
			return this.removeByIndex(i);
};

$.clear = function(){
	
	for(var i = 0, l = this.length; i < l; i++)
		dream.event.dispatch(this, "onRemove", this[i]);
	
	this.length = 0;
};

var Set = function(){
	this._GIDs = {};
}.inherits(List);
var $ = Set.prototype;

$.add = function(obj){
	var gid = dream.util.getId(obj);
	if(this._GIDs[gid]) return obj;
	this._GIDs[gid] = true;
	//INLINED: List.prototype.add.call(this, obj);
	this.push(obj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
};

$.removeByIndex = function(index){
	delete this._GIDs[dream.util.getId(this[index])];
	return List.prototype.removeByIndex.call(this, index);
}
	

var Dict = function(){
	this.keys = [];
	
}.inherits(Collection);
var $ = Dict.prototype;

$.add = function(obj, id){
	var id = id || obj.id || "id" + dream.util.getId(obj);
	this[id] = obj;
	this.keys.push(id);
	this.push(obj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
};

$.addJson = function(items){
	if(items)
		for (var k in items)
			this.add(items[k],k);
};

$.removeById = function(id){
	for(var i = 0; i < this.keys.length; i++)
		if(this.keys[i] == id)
			return this.removeByIndex(i);
};

$.removeByIndex = function(index){
	if (index < 0 || index > this.length -1)
		throw Error("index out of range");
	var obj = this[index];
	if(index != this.length - 1){
		var rObj = this.pop();
		var rKey = this.keys.pop();
		delete this[this.keys[index]];
		this[index] = rObj;
		this.keys[index] = rKey;
	} else {
		this.splice(index,1);
		this.keys.splice(index,1);
	}
	dream.event.dispatch(this, "onRemove", obj);
};

$.remove = function(obj){
	var i = this.indexOf(obj);
	if (i != -1)
		return this.removeByIndex(i);
	else 
		throw Error("object is not in dictionary");
};

$.clear = function(){
	for(var i = 0; this[0]; i++)
		this.removeByIndex(0);
};

var Selector = function(){
	this._current = null;
}.inherits(Dict);

var $ = Selector.prototype;

dream.event.create($, "onSelect");	
dream.event.create($, "onDeselect");

$.select = function(obj){
	if(this._current)
		dream.event.dispatch(this, "onDeselect", this._current);
	this._current = obj;
	dream.event.dispatch(this, "onSelect", obj);
};

$.selectById = function(id){
	var obj;
	if (obj = this[id])
		this.select(obj);
};

Object.defineProperty($, "current", {
	get : function () {
		return this._current;
	},
	set : function (v) {
		this.select(v);
	}
});

var LinkedList = function(){
	this.length = 0;
	this.first = this.last = null;
};

var $ = LinkedList.prototype;
dream.event.create($, "onAdd");	
dream.event.create($, "onRemove");

$.push = function(obj){
	if(obj.hasOwnProperty("previous") || obj.hasOwnProperty("next"))
		throw Error("can't add object with next and previous attributes, may be duplicate!");
	if (!this.first) this.first = obj;
	obj.previous = this.last;
	if(obj.previous) obj.previous.next = obj;
	obj.next = null;
	this.last = obj;
	this.length++;
	dream.event.dispatch(this, "onAdd", obj);
};

$.pop = function(){
	var obj = this.last;
	this.last = obj.previous;
	this.last.next = null;
	this.length--;
	if(this.length == 0) this.first = null;
	dream.event.dispatch(this, "onRemove", obj);
	return obj;
};

$.shift = function(){
	var node = this.first;
	if(node){
		this.first = node.next;
		node.next.previous = undefined;
		dream.event.dispatch(this, "onRemove", node);
		this.length--;
		return node;
	}
};

$.unshift = function(obj){
	var node = this.first;
	if(!node) this.push(obj);
	this.addAt(obj, 0);
};

$.at = function(ind){
	if (ind < 0 || ind >= this.length) 
		throw Error("index out of Linklist range:  " + ind);
	var node = this.first;
	for (var i=0; i < ind; i++)
		node = node.next;
	return node;
};

$.indexOf = function(obj){
	for (var i = 0, node = this.first; i < this.length; i++, node = node.next)
		if (node == obj)
			return i;
		return -1;
}; 

$.add = $.push;

$.insertAt = function(ind, obj){
	var node = this.at(ind);
	this.insertBefore(node, obj);
};

$.insertAfter = function(node, obj){
	if(node.next)
		this.insertBefore(node.next, obj);
	else{
		this.last = obj;
		obj.previous = node;
		node.next = obj;
		this.length++;
		dream.event.dispatch(this, "onAdd", obj);
	}
};

$.insertBefore = function(node, obj){
	if(obj.hasOwnProperty("previous") || obj.hasOwnProperty("next"))
		throw Error("can't add object with next and previous attributes, may be duplicate!");
	if(node.previous) {
		node.previous.next = obj;
		obj.previous = node.previous;
	} else this.first = obj;
	obj.next = node;
	node.previous = obj;
	this.length++;
	dream.event.dispatch(this, "onAdd", obj);
};

$.remove = function(obj){
	if(obj.previous && obj.previous){
		obj.previous.next = obj.next;
		obj.next.previous = obj.previous;
	} else{
		if(!obj.next && obj.previous){
			this.last = obj.previous;
			this.previous.next = null;
		}else if(!obj.previous && obj.next){
			this.first = obj.next;
			obj.next.previous = null;
		}
	}
	delete obj.previous;
	delete obj.next;
	this.length--;
	dream.event.dispatch(this, "onRemove", obj);
};

$.removeByIndex = function(ind){
	var obj = this.at(ind);
	this.remove(obj);
};


// export
dream.collection = {
	Collection: Collection,
	List: List,
	LinkedList: LinkedList,
	Set: Set,
	Dict: Dict,
	Selector: Selector
};
	
})();
