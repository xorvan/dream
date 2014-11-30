/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){

/**
 * Animation is Base Class for  creating dynamics that changes properties of object
 * @class Animation
 * @extends dream.behavior.Action
 **/
var Animation = function(fn, duration, initFn){
	dream.behavior.Action.call(this, fn, initFn);
	this.duration = duration || 1;
	if (this.duration < 1) this.duration = 1;
	
	/**
	 * List of actions that animation should execute
	 * @property actions
	 * @type List
	 * @example
	 * 	anim = new dream.behavior.animation.Animation; 
	 * 	anim.actions[10] = new dream.behavior.animation.FrameAction(function(){this.isBackward = true;}); 
	 */
	this.actions = new dream.collection.List;
	this._counter = 0;
	
	var anim = this;
	this.actions.onAdd.add(function(o){
		anim.isPassive = false;
	});
}.inherits(dream.behavior.Action);
var Animation$ = Animation.prototype;

Object.defineProperty(Animation$, "position", {
	get : function() {
		return  this._counter;
	}
});

Animation$.step = function() {	
	this._counter++;
	
	if(this.fn) this.fn.call(this.host, this._counter, this, 1);
	
	var action;
	if(action = this.actions[this._counter])
		action.fn.call(this.host, 1);
	if(this._counter >= this.duration){
		this._counter = 0;
		return true;
	}
};

//exports
dream.behavior.animation.Animation = Animation;
	
})(window);