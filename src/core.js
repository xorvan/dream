/**
 * Prototype Extensions
 */
(function(){
/**
 * 
 * @param base
 */
Function.prototype.inherits = function(base){
	//var b = function(){};
	//b.prototype = base.prototype;
	this.prototype = new base;
	this._superClass = base;
	this.prototype.constructor = this;
	return this;
};

})();


/**
 * @namespace This is DreamJS root package.
 */
if(!window.dream) dream = {};

dream.fc = 0;

dream.DEBUG = false;

dream.hiwc = 0;
/**
 * @constructor
 */
dream.Asset = function(){	
	this.requiredResources = [];
};

/**
 * @constructor
 */
dream.VisualAsset = function(){
	
}.inherits(dream.Asset);

dream.event.create(dream.VisualAsset.prototype, "onMouseOver");
dream.event.create(dream.VisualAsset.prototype, "onMouseOut");
dream.event.create(dream.VisualAsset.prototype, "onMouseMove");
dream.event.create(dream.VisualAsset.prototype, "onMouseDown");
dream.event.create(dream.VisualAsset.prototype, "onMouseUp");
dream.event.create(dream.VisualAsset.prototype, "onClick");
dream.event.create(dream.VisualAsset.prototype, "onDrag");
dream.event.create(dream.VisualAsset.prototype, "onDragStart");
dream.event.create(dream.VisualAsset.prototype, "onDragStop");
dream.event.create(dream.VisualAsset.prototype, "onDrop");
dream.event.create(dream.VisualAsset.prototype, "onKeyDown");
dream.event.create(dream.VisualAsset.prototype, "onKeyUp");

dream.VisualAsset.prototype.raiseMouseDown = function(mouse){
	if(this.hovered) this.hovered.raiseMouseDown(this.translateIn(mouse));
	dream.event.dispatch(this, "onMouseDown", mouse);
	this.isMouseDown = true;
};

dream.VisualAsset.prototype.raiseMouseUp = function(mouse){
	if(this.hovered) this.hovered.raiseMouseUp(this.translateIn(mouse));
	dream.event.dispatch(this, "onMouseUp", mouse);
	if(this.isMouseDown){
		dream.event.dispatch(this, "onClick", mouse);
		this.isMouseDown = false;
	}
};

dream.VisualAsset.prototype.raiseMouseMove = function(mouse){
	if(this.hovered) this.hovered.raiseMouseMove(this.translateIn(mouse));
	dream.event.dispatch(this, "onMouseMove", mouse);
	if(this.isMouseDown){
		if(!this.isDragging){
			dream.event.dispatch(this, "onDragStart", mouse);
			this.isDragging = true;
			if(this.hovered) this.dragging = this.hovered;
		}
		
	}
};

dream.VisualAsset.prototype.raiseMouseOut = function(mouse){
	if(this.hovered) this.hovered.raiseMouseOut(this.translateIn(mouse));
	this.isHovered = false;
	this.hovered = null;	
	dream.event.dispatch(this, "onMouseOut", mouse);
};

dream.VisualAsset.prototype.raiseDrag = function(mouse){
	if(this.dragging) this.dragging.raiseDrag(this.translateIn(mouse));
	dream.event.dispatch(this, "onDrag", mouse);
};

dream.VisualAsset.prototype.raiseDragStop = function(mouse){
	if(this.dragging) this.dragging.raiseDragStop(this.translateIn(mouse));
	this.dragging = false;
	this.isDragging = false;
	dream.event.dispatch(this, "onDragStop", mouse);
};

/**
 * @constructor
 */
dream.Point = function(left, top){
	this.left = left || 0;
	this.top = top || 0;
};

dream.Point.prototype.toString = function(){return "Point["+this.left+", "+this.top+"]";};

dream.Point.prototype.isIn = function(rect){
	return this.left >= rect.left && this.left <= rect.right && 
		this.top >= rect.top && this.top <= rect.bottom;
};

dream.Point.prototype.clone = function(){
	return new dream.Point(this.left, this.top);
};

/**
 * @constructor
 */
dream.Rect = function(left, top, width, height){
	this.width = width || 0;
	this.height = height || 0;
	
	this.left = left || 0;
	this.top = top || 0;
};

Object.defineProperty(dream.Rect.prototype, "right", {
	get : function () { return this.left + this.width;}
});

Object.defineProperty(dream.Rect.prototype, "bottom", {
	get : function () { return this.top + this.height;}
});

dream.Rect.prototype.hasIntersectWith = function(rect){
	return this.right > rect.left && 
		this.left < rect.right && 
		this.bottom > rect.top && 
		this.top < rect.bottom;
};

dream.Rect.prototype.getIntersectWith = function(rect){
	if(this.hasIntersectWith(rect)){
		var l = Math.max(rect.left, this.left);
		var t = Math.max(rect.top, this.top);
		var r = Math.min(rect.right, this.right);
		var b = Math.min(rect.bottom, this.bottom);
		
		return new dream.Rect(l, t, r - l + 1, b - t + 1);
	}else{
		return false;
	}
};

dream.Rect.prototype.covers = function(rect){
	return this.left <= rect.left && this.right >= rect.right &&
		this.top <= rect.top && this.bottom >= rect.bottom;
};

dream.Rect.prototype.add = function(rect){
	var r = new dream.Rect(this.left<rect.left?this.left:rect.left, this.top<rect.top?this.top:rect.top);
	r.width = (this.right>rect.right?this.right:rect.right) - r.left;
	r.height = (this.bottom>rect.bottom?this.bottom:rect.bottom) - r.top;
	return r;
};

dream.Rect.prototype.clone = function(){
	return new dream.Rect(this.left, this.top, this.width, this.height);
};

dream.Rect.prototype.toString = function(){return "Rect["+this.left+", "+this.top+", "+this.width+", "+this.height+"]";};


