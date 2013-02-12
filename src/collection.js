(function(){

var Collection = function(){
	
}.inherits(Array)
var $ = Collection.prototype;

dream.event.create($, "onAdd");	
dream.event.create($, "onRemove");

$.indexOf = function(obj){
	var l = this.length;
	for( var i = 0; i < l; i++)
		if(this[i] == obj) return i;
};

$.addArray = function(items){
	if (items)
		for (var i = 0; i < items.length; i++)
			this.add(items[i],"item"+i);
	
};

var List = function(){
	
	
}.inherits(Collection);	
	
var $ = List.prototype;


$.add = function(obj){
	this.push(obj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
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



// export
dream.collection = {
	List: List,
	Set: Set,
	Dict: Dict,
	Selector: Selector
};
	
})();
