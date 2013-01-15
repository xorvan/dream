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
	var d = this.d = this.obj.dynamics.add(new dream.dynamic.Dynamic(function(){
		b.fn.call(this, ++b.counter);
	}, this.interval));
	this._kdl = dream.input.onKeyDown.add(function(e){if(!d.isPlaying && e.keyCode == b.key) b.counter = 0, d.play(); });
	this._kul = dream.input.onKeyUp.add(function(e){if(e.keyCode == b.key) d.pause(); });
};

$.disable = function(){
	if(this.d){
		this.obj.dynamics.remove(d);
		delete this.d;
		dream.input.onKeyDown.remove(this._kdl);
		dream.input.onKeyUp.remove(this._kul);
	}
};

dream.behaviour.KeyBinding = KeyBinding;

})(window);