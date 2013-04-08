/**
 * @module behaviorTree
 * @namespace dream.dynamic.behaviorTree
*/
(function(window){

/**
 * @class Action
 * @constructor
 * @extends dream.dynamic.Dynamic
 */
var Action = function(fn){
	dream.dynamic.Dynamic.call(this, fn)
}.inherits(dream.dynamic.Dynamic);
	
/**
 * @class Condition
 * @constructor
 * @extends dream.dynamic.Dynamic
 */
var Condition = function(fn){
	dream.dynamic.Dynamic.call(this, fn)
}.inherits(dream.dynamic.Dynamic);

/**
 * @class Selector
 * @constructor
 * @extends dream.dynamic.Dynamic
 */
var Selector = function(){
	dream.dynamic.Dynamic.call(this);
	var selector = this;
	
	this.children = new dream.collection.LinkedList;
	
	this.children.onAdd.add(function(node){
		if(selector.host){
			node.init(selector.host);
		}
	});
	
}.inherits(dream.dynamic.Dynamic);

var Selector$ = Selector.prototype;

Selector$.init = function(host){
	var node = this.children.first; 
	while(node){
		node.init(host);
		node = node.next;
	}	
	return Selector._superClass.prototype.init.call(this, host);
};

/**
 * @namespace dream.dynamic.behaviorTree.selector
 */

/**
 * @class Priority
 * @constructor
 * @extends dream.dynamic.Dynamic
 */
var Priority = function(){
	Selector.apply(this);
}.inherits(Selector);

var Priority$ = Priority.prototype;

Priority$.step = function(){
	var node = this.children.first; 
	while(node){		
		var r = node.step();
		if(r !== false){
			return r;
		}
		node = node.next;
	}
	return false;
};

/**
 * @class Sequence
 * @constructor
 * @extends dream.dynamic.Dynamic
 */
var Sequence = function(){
	Selector.apply(this);
}.inherits(Selector);

var Sequence$ = Sequence.prototype;

Sequence$.step = function(){
	var node = this.current || this.children.first;
	delete this.current;
	while(node){
		var r = node.step();
		if( r == false){
			return false;
		}else if(r == undefined){
			this.current = node;
			return r;
		}
		node = node.next;
	}
	return true;
};


//exports
dream.dynamic.behaviorTree = {
	Action: Action,
	Condition: Condition,
	Selector: Selector,
	selector: {
		Priority: Priority,
		Sequence: Sequence
	}
};

})(window);
