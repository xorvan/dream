/**
 * 
 */
(function(){
	
/**
 * @constructor
 */
dream.behaviour.LeftBounded  = function(minLeft, maxLeft){
	this.minLeft = minLeft;
	this.maxLeft = maxLeft;
	
}.inherits(dream.Behaviour);
var $ = dream.behaviour.LeftBounded.prototype;

$.enable = function(){
	var b = this;
	this.obj.__LEFTBOUNDED_OLD_LEFT_SETTER = this.obj.__lookupSetter__("left");
	this.obj.__defineGetter__("left", this.obj.__lookupGetter__("left"));
	this.obj.__defineSetter__("left", function(v){
		var x = v < b.minLeft ? b.minLeft : v;
		if(x > b.maxLeft) x = b.maxLeft;
		this.__LEFTBOUNDED_OLD_LEFT_SETTER(x);
	});
};

$.disable = function(){
	this.obj.__defineSetter__("left", this.obj.__LEFTBOUNDED_OLD_LEFT_SETTER);
	delete this.obj.__LEFTBOUNDED_OLD_LEFT_SETTER;
};

})();
