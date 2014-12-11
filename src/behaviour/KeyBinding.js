/**
 * 
 */
(function(window){

/**
 * @constructor
 */
var KeyBinding = function(key, fn, interval){
	this.fn = fn;
	this.key = key;
	this.interval = interval || 1;
}.inherits(dream.Behaviour);
var $ = KeyBinding.prototype;

$.enable = function(){
	var b = this;
	var isDown = false;
	var d = new dream.behavior.Action(function(){
		if(isDown) b.fn.call(this, ++b.counter);
	});
	if(this.interval != 1) d = new dream.behavior.decorator.Interval(d, this.interval); 
	this.d = this.obj.behavior.actions.add(d);
	this._kdl = dream.input.onKeyDown.add(function(e){if(!isDown && e.keyCode == b.key) b.counter = 0, isDown = true; });
	this._kul = dream.input.onKeyUp.add(function(e){if(e.keyCode == b.key) isDown = false; });
};

$.disable = function(){
	if(this.d){
		this.obj.behavior.actions.remove(d);
		delete this.d;
		dream.input.onKeyDown.remove(this._kdl);
		dream.input.onKeyUp.remove(this._kul);
	}
};

dream.behaviour.KeyBinding = KeyBinding;

})(window);