/**
 * @module behavior
 * @namespace dream.behavior.decorator
 */
(function(window){

/**
 * @class Timeout
 * @constructor
 * @extends dream.behavior.decorator.Decorator
 */
var Timeout = function(action, timout){
	Timeout._superClass.apply(this, action);
	
	this.timout = timout || 1;
	this._counter = 0;
	
}.inherits(dream.behavior.decorator.Decorator);
var Timeout$ = Timeout.prototype;

Timeout$.step = function(){
	this._counter++;
	var r = this.action.step();
	if(r == undefined && this._counter++ > this.timout){
		this._counter++;
		return false;
	}else{
		return r;
	}
};

//exports
dream.behavior.decorator.Timeout = Timeout;

})(window);