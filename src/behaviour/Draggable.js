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
	this.obj.onDragStart.add(function(mouse){
		var lm = this.rect.transformation.unproject(mouse);
		ol = lm.left;
		ot = lm.top;	
	}, this);
	
	this.obj.onDrag.add(function(mouse){
		this.left = mouse.left - ol;
		this.top = mouse.top - ot;
	}, this);
};

$.disable = function(){
	this.obj.onDragStart.removeByOwner(this);
	this.obj.onDrag.removeByOwner(this);
};

})();
