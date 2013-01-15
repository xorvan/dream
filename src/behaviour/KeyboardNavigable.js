/**
 * 
 */
(function(window){

/**
 * @constructor
 */
var KeyboardNavigable = function(maxSpeed, minSpeed, duration, interval, up, right, down, left){
	this.maxSpeed = maxSpeed || 40;
	this.minSpeed = minSpeed || 1;
	this.duration = duration || 5;
	this.interval = interval || 1;
	this.upKey = up || dream.input.Key.UP;
	this.rightKey = right || dream.input.Key.RIGHT;
	this.downKey = down || dream.input.Key.DOWN;
	this.leftKey = left || dream.input.Key.LEFT;
	
}.inherits(dream.Behaviour);
var $ = KeyboardNavigable.prototype;

$.enable = function(){
	var b = this;
	this._rb = this.obj.behaviours.add(new dream.behaviour.KeyBinding(this.rightKey, function(i){b.obj.camera.left += Math.min((i/b.duration)|0 + b.minSpeed, b.maxSpeed);}));
	this._lb = this.obj.behaviours.add(new dream.behaviour.KeyBinding(this.leftKey, function(i){b.obj.camera.left -= Math.min((i/b.duration)|0 + b.minSpeed, b.maxSpeed);}));
	this._ub = this.obj.behaviours.add(new dream.behaviour.KeyBinding(this.upKey, function(i){b.obj.camera.top -= Math.min((i/b.duration)|0 + b.minSpeed, b.maxSpeed);}));
	this._db = this.obj.behaviours.add(new dream.behaviour.KeyBinding(this.downKey, function(i){b.obj.camera.top += Math.min((i/b.duration)|0 + b.minSpeed, b.maxSpeed);}));
};

$.disable = function(){
	this.obj.behaviours.remove(this._rb);
	this.obj.behaviours.remove(this._lb);
	this.obj.behaviours.remove(this._ub);
	this.obj.behaviours.remove(this._db);
};

dream.behaviour.KeyboardNavigable = KeyboardNavigable;

})(window);