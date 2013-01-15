/**
 * 
 */
(function(window){

/**
 * @constructor
 */
var KeyboardZoomable = function(delta, interval, zoomIn, zoomOut){
	this.delta = delta || 0.1;
	this.interval = interval || 1;
	this.zoomInKey = zoomIn || dream.input.Key.PLUS;
	this.zoomOutKey = zoomOut || dream.input.Key.MINUS;
	
}.inherits(dream.Behaviour);
var $ = KeyboardZoomable.prototype;

$.enable = function(){
	var b = this;
	this._rb = this.obj.behaviours.add(new dream.behaviour.KeyBinding(this.zoomInKey, function(i){b.obj.camera.scale += b.delta;}));
	this._lb = this.obj.behaviours.add(new dream.behaviour.KeyBinding(this.zoomOutKey, function(i){b.obj.camera.scale -= b.delta;}));
};

$.disable = function(){
	this.obj.behaviours.remove(this._rb);
	this.obj.behaviours.remove(this._lb);
	this.obj.behaviours.remove(this._ub);
	this.obj.behaviours.remove(this._db);
};

dream.behaviour.KeyboardZoomable = KeyboardZoomable;

})(window);