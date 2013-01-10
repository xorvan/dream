/**
 * 
 */
(function(){
	
/**
 * @constructor
 */
dream.behaviour.Moving  = function(vx, vy){
	this.vx = vx || 0;
	this.vy = vy || 0;
	
}.inherits(dream.Behaviour);
var $ = dream.behaviour.Moving.prototype;

$.enable = function(){
	var b = this;
	this.step = this.obj.dynamics.add(new dream.dynamic.Dynamic(function(){
		this.left += b.vx;
		this.top += b.vy;
	})).play();
};

$.disable = function(){
	this.obj.dynamics.remove(this.step);
};

})();
