/**
 * @module behavior
 * @namespace dream.behavior.decorator
 */
(function(window){

/**
 * @class Not
 * @constructor
 * @extends dream.behavior.decorator.Decorator
 */
var Not = function(action){
  Not._superClass.call(this, action);

}.inherits(dream.behavior.decorator.Decorator);
var Not$ = Not.prototype;

Not$.step = function(){
  var r = this.action.step();
  return r == undefined ? undefined : !r;
};

//exports
dream.behavior.decorator.Not = Not;

})(window);
