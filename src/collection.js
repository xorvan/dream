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

var List = function(arr){
	if (arr){
		for(var i=0; i< arr.length;i++)
			this.push(arr[i]);
	}
}.inherits(Collection);	
	
var $ = List.prototype;

$.add = function(obj){
	this.push(obj);
	dream.event.dispatch(this, "onAdd", obj);
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
	dream.event.dispatch(this, "onRemove", obj);
	var obj = this[index];
	var rObj = this.pop();
	var rKey = this.keys.pop();
	delete this[this.keys[index]];
	this[index] = rObj;
	this.keys[index] = rKey;
};

$.remove = function(obj){
	return this.removeByIndex(this.indexOf(obj));
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

var Linkedlist = function(){
	this.length = 0;
	this.first = this.last = null;
};

var $ = Linkedlist.prototype;
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

$.addAt = function(obj, ind){
	if(obj.hasOwnProperty("previous") || obj.hasOwnProperty("next"))
		throw Error("can't add object with next and previous attributes, may be duplicate!");
	var node = this.at(ind);
	if(node.previous) node.previous.next = obj;
	else this.first = obj;
	obj.previous = node.previous;
	obj.next = node;
	node.previous = obj;
	if(ind == this.length - 1) this.last = obj;
	this.length++;
	dream.event.dispatch(this, "onAdd", obj);
};

$.addAfter = function(obj, node){
	var ind = this.indexOf(node);
	this.addAt(ind+1);
};

$.addBefore = function(obj, node){
	var ind = this.indexOf(node);
	this.addAt(ind);
};


$.removeByIndex = function(ind){
	var node = this.at(ind);
	if(node.next) node.next.previous = node.previous;
	else this.last = node.previous;
	if(node.previous) node.previous.next = node.next;
	else this.first = node.next;
	dream.event.dispatch(this, "onRemove", node);
	delete node.next;
	delete node.previous;
	this.length--;
};

$.remove = function(obj){
	var ind = this.indexOf(obj);
	this.removeByIndex(ind);
};



// export
dream.collection = {
	List: List,
	Linkedlist: Linkedlist,
	Set: Set,
	Dict: Dict,
	Selector: Selector
};
	
})();
