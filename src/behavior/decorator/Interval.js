/**
 * @module behavior
 * @namespace dream.behavior.decorator
 */
(function(window){

/**
 * @class Interval
 * @constructor
 * @extends dream.behavior.decorator.Decorator
 */
var Interval = function(action, interval){
	Interval._superClass.call(this, action);
	
	this.interval = interval || 1;
	this._counter = 0;
	
}.inherits(dream.behavior.decorator.Decorator);

var Interval$ = Interval.prototype;

Interval$.step = function(){
	if (++this._counter % this.interval == 0)
		return this.action.step();
};

//exports
dream.behavior.decorator.Interval = Interval;
	
})(window);