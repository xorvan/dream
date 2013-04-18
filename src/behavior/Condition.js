/**
 * @module behavior
 * @namespace dream.behavior
 */
(function(window){
	
/**
 * @class Condition
 * @constructor
 * @extends dream.behavior.Action
 */
var Condition = function(fn, interval, init){
	dream.behavior.Action.apply(this, arguments);
	
}.inherits(dream.behavior.Action);

//exports
dream.behavior. Condition = Condition;

})(window);