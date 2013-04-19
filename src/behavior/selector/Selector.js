/**
 * @module behavior
 * @namespace dream.behavior.selector
 */
(function(window){

/**
 * @class Selector
 * @constructor
 * @extends dream.behavior.Action
 */
var Selector = function(actions){
	dream.behavior.Action.call(this);
	var selector = this;
	
	this._counter = 0;
	this.actions = new dream.collection.List(actions);
	
	this.actions.onAdd.add(function(node){
		if(selector.host){
			node.init(selector.host);
		}
	});
	
}.inherits(dream.behavior.Action);

var Selector$ = Selector.prototype;

Selector$.init = function(host){
	for(var i = 0, l = this.actions.length; i < l; i++)
		this.actions[i].init(host);
	
	return Selector._superClass.prototype.init.call(this, host);
};

//exports
dream.behavior.selector.Selector = Selector;
	
})(window);