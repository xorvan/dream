/**
 * 
 */
(function(window){

/**
 * @constructor
 */
var WheelZoomable = function(multiplier){
	this.multiplier = multiplier || 1/1200;
	
}.inherits(dream.Behaviour);
var $ = WheelZoomable.prototype;

$.enable = function(){
	var b = this;
	this._we = dream.input.onWheel.add(function(event){
		b.obj.camera.scale += event.wheelDeltaY * b.multiplier;
	});
};

$.disable = function(){
	dream.input.onWheel.remove(this._we);
};

dream.behaviour.WheelZoomable = WheelZoomable;

})(window);