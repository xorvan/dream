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
	this.step = this.obj.steps.add(new dream.visual.animation.Step(function(){
		this.left += b.vx;
		this.top += b.vy;
	}));
};

$.disable = function(){
	this.obj.steps.remove(this.step);
};

})();
