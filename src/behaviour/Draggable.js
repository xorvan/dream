/**
 * 
 */
(function(){
	
/**
 * @constructor
 */
dream.behaviour.Draggable = function(){
	
}.inherits(dream.Behaviour);
var $ = dream.behaviour.Draggable.prototype;

$.enable = function(){
	var ol, ot;
	this.obj.onDragStart.add(function(event){
		var lm = event.localPosition;
		ol = lm.left - this.anchorX;
		ot = lm.top - this.anchorY;	
	}, this);
	
	this.obj.onDrag.add(function(event){
		this.left = event.position.left - ol;
		this.top = event.position.top - ot;
	}, this);
};

$.disable = function(){
	this.obj.onDragStart.removeByOwner(this);
	this.obj.onDrag.removeByOwner(this);
};

})();
