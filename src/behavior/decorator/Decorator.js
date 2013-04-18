/**
 * @module behavior
 * @namespace dream.behavior.decorator
 */
(function(window){

/**
 * @class Decorator
 * @constructor
 * @extends dream.behavior.Action
 */
var Decorator = function(action, fn, initFn){
	dream.behavior.Action.call(this, fn, initFn);
	
	this.action = action;
	
}.inherits(dream.behavior.Action);
var Decorator$ = Decorator.prototype;

Decorator$.init = function(host){
	Decorator._superClass.prototype.init.call(this, host);
	this.action.init(this.host);
	return this;
};

//exports
dream.behavior.decorator.Decorator = Decorator;
	
})(window);