/**
 * @module behavior
 * @namespace dream.behavior.decorator
 */
(function(window){

/**
 * @class True
 * @constructor
 * @extends dream.behavior.decorator.Decorator
 */
var True = function(action){
  True._superClass.call(this, action);

}.inherits(dream.behavior.decorator.Decorator);
var True$ = True.prototype;

True$.step = function(){
  this.action.step();
  return true;
};

//exports
dream.behavior.decorator.True = True;

})(window);
