/**
 * @module collection
 * @namespace dream.collection
 */

(function(){
	
/**
 * *Collection* class inherits from *Array* and has *onAdd* and *onRemove* events and some utility functions.
 * @class Collection
 */	
var Collection = function(){
	
}.inherits(Array);
var Collection$ = Collection.prototype;

/**
 * this implementation of indexOf is faster than it's native implementation as of this writing
 * @private
 */
Collection$.indexOf = function(obj){
	var i, l = this.length;
	for(i = 0; i < l; i++)
		if(this[i] == obj) return i;
	return -1;
};

/**
 * onAdd event will raise whenever something is added.
 * @event onAdd
 * @param {Object} obj
 * the added object
 */
dream.event.create(Collection$, "onAdd");	
/**
 * onRemove event will raise whenever something is removed.
 * @event onRemove
 * @param {Object} obj
 * the removed object
 */
dream.event.create(Collection$, "onRemove");

/**
 * similar to array push method but invokes onAdd event.
 * @method push
 * @param item
 * @returns {Number} length
 */
Collection$.push = function(item){
	var r = Array.prototype.push.call(this, item);
	dream.event.dispatch(this, "onAdd", item);
	return r;
};

/**
 * adds all items of an array to object
 * @method addArray
 * @param {Array} items
 * 
 */
Collection$.addArray = function(items){
	if (items)
		for (var i = 0; i < items.length; i++)
			this.push(items[i]);
	
};
/**
 * *List* class provides *Array*-like interface but adds few utilities to it. So all standard *Array* functionalities are present in *List*.
 * 
 * One important note is that in order to List object work, you have to use provided methods documented here, to raise *onAdd* and *onRemove* events.
 * You should not use *Array* index like: `list[i] = object` or `delete list[i]` if you are going to use events.
 * 
 * Any object that is added to list by methods like *push*, *add*, *insert*, *put* and *addArray* will raise *onAdd* event and any object that get's removed from List
 * by any method like *remove*, *removeByIndex*, *put*, *shift*, *pop* and *clear* will raise *onRemove* event.
 * In both cases, subject object, will be passed as argument to listeners. 
 * @class List
 * @extends dream.collection.Collection
 * @constructor
 * @param {Array} [array]
 * the initial array to construct List with it
 */
var List = function(arr){
	if (arr){
		for(var i=0; i< arr.length;i++)
			this.push(arr[i]);
	}
}.inherits(Collection);	
	
var List$ = List.prototype;

/**
 * add function adds the argument to the List
 * @method add
 * @param {Object} obj
 * @return {Object} obj
 */
List$.add = function(obj){
	this.push(obj);
	return obj;
};
/**
 * like Array pop
 * @method pop
 * @returns {Object} obj
 */
List$.pop = function(){
	var obj = this[this.length-1];
	this.length--;
	dream.event.dispatch(this, "onRemove", obj);
	return obj;
};

/**
 * like Array shift
 * @method shift
 * @returns {Object} obj
 */
List$.shift = function(){
	var obj = this[0];
	if (obj){
		this.splice(0, 1);
		dream.event.dispatch(this, "onRemove", obj);
		return obj;
	}
};

/**
 * at method returns object at the given position
 * @method at
 * @param {Number} position
 * @return {Object} obj
 */
List$.at = function(n){
	return this[n];
};

/**
 * insert method, inserts given object at given position. it does not remove the object in given position but shifts object to right to insert
 * given object
 * @method insertAt
 * @param {Number} index
 * position to insert object at
 * @param {Object} obj
 * object to be inserted
 * @return {Object} obj
 */
List$.insertAt = function(index, obj){
	this.splice(index,0,obj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
};

/**
 * like Array unshift
 * @method unshift
 * @param {Object} obj
 * @return {Object} obj
 */
List$.unshift = function(obj){
	return this.insertAt(0, obj);
};

/**
 * to remove an item from List that we know it's index (position in List)
 * @method removeByIndex
 * @param {Number} index
 * index of object to be removed
 * @return {Object} obj
 */
List$.removeByIndex = function(index){
	if(this[index]){
		var obj = this.splice(index,1)[0];
		dream.event.dispatch(this, "onRemove", obj);
		return obj;
	}
};
/**
 * puts given object in given index, it removes the object in given position if any.
 * @method put
 * @param {Number} index
 * the position to put object
 * @param {Object} obj
 * the object to be putted
 * @return {Object} obj
 */
List$.put = function(index, obj){
	var oldObj = this[index];
	this[index]=obj;
	if(oldObj) dream.event.dispatch(this, "onRemove", oldObj);
	dream.event.dispatch(this, "onAdd", obj);
	return obj;
};

/**
 * it removes given object from List, if it is in list, otherwise it returns null
 * @method remove
 * @param obj
 * object to be removed
 * @returns {Object} obj
 */
List$.remove = function(obj)	{
	for (var i = 0; i < this.length; i++)
		if (this[i] == obj)
			return this.removeByIndex(i);
};
/**
 * clears List, all object will be removed.
 * @method clear
 * 
 */
List$.clear = function(){
	
	for(var i = 0, l = this.length; i < l; i++){
		dream.event.dispatch(this, "onRemove", this[i]);
		delete this[i];
	}
	this.length = 0;
};

/**
 * Set is just like {{#crossLink "dream.collection.List"}}List{{/crossLink}} but prevents Duplication
 * @class Set
 * @extends dream.collection.List
 * @constructor
 */
var Set = function(){
	this._GIDs = {};
}.inherits(List);
var Set$ = Set.prototype;

Set$._checkDuplication = function(obj){
	var gid = dream.util.getId(obj);
	if(this._GIDs[gid]) return true;
	if ((! (obj instanceof Object)) && this.indexOf(obj) != -1) return true;
	this._GIDs[gid] = true;
	return false;
};

Set$.push = function(obj){
	if(this._checkDuplication(obj))
		return obj;
	else	
		return List$.push.call(this, obj);
};

Set$.put = function(index, obj){
	if(this._checkDuplication(obj))
		return obj;
	else	
		return List$.put.call(this, index, obj);
};

Set$.insertAt = function(index, obj){
	if(this._checkDuplication(obj))
		return obj;
	else	
		return List$.insertAt.call(this, index, obj);
};

Set$.unshift = function(obj){
	if(this._checkDuplication(obj))
		return obj;
	else	
		return List$.unshift.call(this, obj);
};

Set$.shift = function(){
	delete this._GIDs[dream.util.getId(this[0])];
	return List$.shift.call(this);
};

Set$.pop = function(){
	delete this._GIDs[dream.util.getId(this[this.length - 1])];
	return List$.pop.call(this);
};

Set$.removeByIndex = function(index){
	delete this._GIDs[dream.util.getId(this[index])];
	return List$.removeByIndex.call(this, index);
};
	
/**
 * Dict instances are dictionary like objects
 * @class Dict
 * @constructor
 * @extends dream.collection.Collection
 * 
 */
var Dict = function(){
	this.keys = [];
	
}.inherits(Collection);
var $ = Dict.prototype;

$.add = function(obj, id){
	var id = id || obj.id || "id" + dream.util.getId(obj);
	this[id] = obj;
	this.keys.push(id);
	this.push(obj);
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


/**
 * this is an implementation of Linkeedlist, instances of this calss act as a list of objects that any object within it has a next and previous 
 * attribute.
 * any attempt to add an object with next and/or previous attributes return -3.
 * anything that is going to be added to linkedlist must be an object, technically and instance of Object.
 * attempting to add a number or string or so to a linkedlist will return -2.
 * also an object could not be added to a linkedlist more than once, any attempt will return -3
 * @class LinkedList
 * @constructor
 * 
 */
var LinkedList = function(){
	this.length = 0;
	this.first = this.last = null;
};

var LinkedList$ = LinkedList.prototype;

/**
 * onAdd event will raise whenever something is added.
 * @event onAdd
 * @param {Object} obj
 * the added object
 */
dream.event.create(LinkedList$, "onAdd");	
/**
 * onRemove event will raise whenever something is removed.
 * @event onRemove
 * @param {Object} obj
 * the removed object
 */
dream.event.create(LinkedList$, "onRemove");

/**
 * checks input be instance of Object and also is not added already
 * @private
 */
LinkedList$._checkObject = function(obj){
	if (!(obj instanceof Object))
		return -2;
	if(obj.hasOwnProperty("previous") || obj.hasOwnProperty("next"))
		return -3;
	return 0;
};

/**
 * adds the object at the end of the linkedlist
 * @method push
 * @param {Object} obj
 * object to be added
 * @return {Object} obj
 */
LinkedList$.push = function(obj){
	var r = this._checkObject(obj);
	if(r < 0)
		return r;
	if (!this.first) this.first = obj;
	obj.previous = this.last;
	if(obj.previous) obj.previous.next = obj;
	obj.next = null;
	this.last = obj;
	this.length++;
	dream.event.dispatch(this, "onAdd", obj);
	return this.length;
};

/**
 * adds the object at the end of the linkedlist
 * @method add
 * @param {Object} obj
 * object to be added
 * @return {Object} obj
 */
LinkedList$.add = function(obj){
	var r = this.push(obj);
	if(r < 0)
		return r;
	return obj;
};

/**
 * removes the object from the end of the linkedlist
 * @method pop
 * @return {Object} obj
 */
LinkedList$.pop = function(){
	var obj = this.last;
	this.last = obj.previous;
	this.last.next = null;
	this.length--;
	if(this.length == 0) this.first = null;
	dream.event.dispatch(this, "onRemove", obj);
	return obj;
};

/**
 * removes the object from the beginnig of linkedlist, if linked list is not empty
 * @method shift
 * @return {Object} obj
 */
LinkedList$.shift = function(){
	var node = this.first;
	if(node){
		this.first = node.next;
		node.next.previous = undefined;
		dream.event.dispatch(this, "onRemove", node);
		this.length--;
		return node;
	}
};

/**
 * adds object to the beginnig of linkedlist
 * @method unshift
 * @param {Object} obj
 */
LinkedList$.unshift = function(obj){
	var r = this._checkObject(obj);
	if(r < 0)
		return r;
	var node = this.first;
	if(!node) this.push(obj);
	this.insertAt(obj, 0);
};

/**
 * returns object at the given index (position)
 * @method at
 * @param {Number} index
 * @return {Object} obj
 * @example
 * a =  ll.at(2);
 */
LinkedList$.at = function(ind){
	if (ind < 0 || ind >= this.length) 
		throw Error("index out of Linklist range:  " + ind);
	var node = this.first;
	for (var i=0; i < ind; i++)
		node = node.next;
	return node;
};
/**
 * returns index of given object in linkedlist or return -1 if object is not in linkedlist
 * @method indexOf
 * @param {Object} obj
 */
LinkedList$.indexOf = function(obj){
	for (var i = 0, node = this.first; i < this.length; i++, node = node.next)
		if (node == obj)
			return i;
		return -1;
}; 

/**
 * inserts given object at the given position, if there is an object in that position it will not be deleted but it's pushed one step to right.
 * @method insertAt
 * @param {Object} obj
 * object to be added
 * @return {Object} obj
 */
LinkedList$.insertAt = function(ind, obj){
	var node = this.at(ind);
	return this.insertBefore(node, obj);
};

/**
 * inserts given object after the given node, node is an object in the linkedlist. if the node is not found in linkedlist, return -1.
 * @method insertAfter
 * @param {Object} Node
 * NOde after which object should be added
 * @param {Object} obj
 * object to be added
 * @return {Object} obj
 */
LinkedList$.insertAfter = function(node, obj){
	var r = this._checkObject(obj);
	if(r < 0)
		return r;
	if(this.indexOf(node) == -1)
		return -1;
	if(node.next)
		return this.insertBefore(node.next, obj);
	else{
		this.last = obj;
		obj.previous = node;
		node.next = obj;
		this.length++;
		dream.event.dispatch(this, "onAdd", obj);
		return obj;
	}
};
/**
 * inserts given object before the given node, node is an object in the linkedlist. if the node is not found in linkedlist, return -1.
 * @method insertBefore
 * @param {Object} Node
 * Node before which object should be added
 * @param {Object} obj
 * object to be added
 * @return {Object} obj
 */
LinkedList$.insertBefore = function(node, obj){
	var r = this._checkObject(obj);
	if(r < 0)
		return r;
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
	return obj;
};
/**
 * removes given object from linkedList, if it is in it, otherwise it returns null
 * @method remove
 * @param obj
 * object to be removed
 * @returns {Object} obj
 */
LinkedList$.remove = function(obj){
	if(this.indexOf(obj) == -1)
		return null;
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
	return obj;
};
/**
 * removes given object from linkedList at given index (position)
 * @method removeByIndex
 * @param {Number} index
 * index of object to be removed
 * @returns {Object} obj
 */
LinkedList$.removeByIndex = function(ind){
	var obj = this.at(ind);
	if(obj) 
		return this.remove(obj);
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
