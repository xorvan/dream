/**
 * 
 */
(function(window){

/**
 * @constructor
 */
var SnapAnchorToPointer = function(multiplier){
	this.multiplier = multiplier || 1/1200;
	
}.inherits(dream.Behaviour);
var $ = SnapAnchorToPointer.prototype;

$.enable = function(){
	var b = this;
	
	this._mme = this.obj.onMouseMove.add(function(event){
		if(this.isDragging) return false;
		var m = event.localPosition;
		this.anchorX = m.left;
		this.anchorY = m.top;
		
		this.left = event.position.left;
		this.top = event.position.top;
	});
};

$.disable = function(){
	this.obj.onMouseMove(this._mme);
};

dream.behaviour.SnapAnchorToPointer = SnapAnchorToPointer;

})(window);