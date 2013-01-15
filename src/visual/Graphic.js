/**
 * @constructor
 * @extends dream.VisualAsset
 */
dream.visual.Graphic = function(left, top){	
	this.a = 1;
	this._z = 0;
	
	this.anchor = new dream.Point();
	this.origin = new dream.Point(left, top);
	this.boundary = new dream.Rect(left, top);
	this.rect = new dream.Rect(0, 0, 0, 0, new dream.transform.Generic(left, top));
	this.oldBoundary = this.boundary.clone();
	 
	var graphic = this;
	
	this.rect.transformation.onChange.add(function(){
		graphic.isImageChanged = true;
		graphic.isBoundaryChanged = true;
	});

	this.rect.transformation.onPositionChange.add(function(){
		graphic.isPositionChanged = true;
	});
	
	this.visible = true;
	
	this.isImageChanged = true;
	this.isBoundaryChanged = true;
	
	this.dynamics = new dream.dynamic.DynamicList(this);
	
	this.dynamics.onAdd.add(function(dyn){
		dyn.init(graphic);
	});
	
	this.behaviours = new dream.util.ArrayList();
	this.behaviours.onAdd.add(function(behaviour){
		behaviour.obj = graphic;
		behaviour.enable();
	});
	
	this.behaviours.onRemove.add(function(behaviour){
		behaviour.disable();
	});
	
	//this.buffer = null;
	
}.inherits(dream.VisualAsset);

dream.event.create(dream.visual.Graphic.prototype, "onImageChange");
dream.event.create(dream.visual.Graphic.prototype, "onBoundaryChange");
dream.event.create(dream.visual.Graphic.prototype, "onZChange");

dream.visual.Graphic.prototype.selectionThreshold = 4;

dream.visual.Graphic.prototype.draw = function(ctx, origin, drawRect) {
	ctx.save();	
	if(this.a != 1) ctx.globalAlpha = this.alpha;
//	var m = this.rect.transformation.matrix;
//	ctx.transform(m.x0, m.y0, m.x1, m.y1, m.dx|0, m.dy |0);
	var o = this.rect.transformation.apply(ctx, origin);
//	o.left |= 0, o.top |= 0;
	this.drawImage(ctx, o, drawRect);
	ctx.restore();
};

dream.visual.Graphic.prototype.step = function (){
	
	if (this.dynamics.isPlaying) this.dynamics.step();

	if(this.isBoundaryChanged){
		this.boundary = this.rect.boundary;
		
		if(this.isImageChanged){
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(this.oldBoundary) ? [this.boundary.add(this.oldBoundary)] : [this.boundary, this.oldBoundary]);
			this.isImageChanged = false;
		}
		
		if(!this.boundary.isEqualWith(this.oldBoundary)){
			dream.event.dispatch(this, "onBoundaryChange", this.oldBoundary);
			this.oldBoundary = this.boundary.clone();
		}
		
		this.isBoundaryChanged = false;
	}else if(this.isPositionChanged){
		this.boundary = this.rect.boundary;
		if(!this.boundary.isEqualWith(this.oldBoundary)){
			dream.event.dispatch(this, "onBoundaryChange", this.oldBoundary);
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(this.oldBoundary) ? [this.boundary.add(this.oldBoundary)] : [this.boundary, this.oldBoundary]);
			this.oldBoundary = this.boundary.clone();
		}else if(this.isImageChanged){
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(this.oldBoundary) ? [this.boundary.add(this.oldBoundary)] : [this.boundary, this.oldBoundary]);
		}
		this.isPositionChanged = false;
		this.isImageChanged = false;
		
	}else if(this.isImageChanged){
		dream.event.dispatch(this, "onImageChange", [this.boundary]);
		this.isImageChanged = false;
	}
	
}; 

dream.visual.Graphic.prototype.checkHover = function (event){
	var pl;
	if(event.position.isIn(this.boundary) && (pl = event.localPosition, this.image.data[ (((pl.top|0) - this.rect.top) * this.rect.width + ( pl.left|0) - this.rect.left)*4 + 3 ] > this.selectionThreshold)){
		if(!this.isHovered) dream.event.dispatch(this, "onMouseEnter", event);
		this.isHovered = true;
		return true;
	}else{
		return false;
	}
};

dream.visual.Graphic.prototype.dropBuffer = function(){
	this.buffer = null; 
	if(this._oldDrawImage) this.drawImage = this._oldDrawImage;
};

dream.visual.Graphic.prototype.updateBuffer = function(){
	if (this.buffer == null){
		this._oldDrawImage = this.drawImage;
		this.drawImage = function(ctx, origin){
			var w = this.buffer.canvas.width, h = this.buffer.canvas.height;
			ctx.drawImage(this.buffer.canvas, 0, 0, w, h, this.buffer.left + origin.left, this.buffer.top + origin.top, w, h);
		};
	}

	this.buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
	this.buffer.left = this.rect.left;
	this.buffer.top = this.rect.top;
	this.buffer.context.translate(-this.rect.left, -this.rect.top);
	
	this._oldDrawImage(this.buffer.context, new dream.Point(0, 0));
};

dream.visual.Graphic.prototype.raiseMouseDown = function(event){
	dream.event.dispatch(this, "onMouseDown$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseDown", event);
	this.isMouseDown = true;
};

dream.visual.Graphic.prototype.raiseMouseUp = function(event, clickEvent){
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp", event);
	if(this.isMouseDown){
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onClick$capture", clickEvent);
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onClick", clickEvent);
		this.isMouseDown = false;
	}
};

dream.visual.Graphic.prototype.raiseMouseMove = function(event, dragEvent){
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseMove$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseMove", event);
	if(this.isMouseDown){
		if(!this.isDragging){
			if(!event._isPropagationStopped) dream.event.dispatch(this, "onDragStart$capture", dragEvent);
			if(!event._isPropagationStopped) dream.event.dispatch(this, "onDragStart", dragEvent);
			this.isDragging = true;
		}
	}
};

dream.visual.Graphic.prototype.raiseMouseLeave = function(event){
	this.isHovered = false;
	this.hovered = null;
	dream.event.dispatch(this, "onMouseLeave", event);
};


dream.visual.Graphic.prototype.raiseDrag = function(event){
	dream.event.dispatch(this, "onDrag$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDrag", event);
};

dream.visual.Graphic.prototype.raiseDragStop = function(event){
	this.dragging = false;
	this.isDragging = false;
	this.isMouseDown = false;
	dream.event.dispatch(this, "onDragStop$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDragStop", event);
};

Object.defineProperty(dream.visual.Graphic.prototype, "left", {
	get : function() {
		return this.origin.left;
	},
	set : function(v) {
		this.origin.left = v;
		this.rect.transformation.left = v;		
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "top", {
	get : function() {
		return this.origin.top;
	},
	set : function(v) {
		this.origin.top = v;
		this.rect.transformation.top = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "rotation", {
	get : function() {
		return this.rect.transformation.rotation;
	},
	set : function(v) {
		this.rect.transformation.rotation = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "alpha", {
	get : function() {
		return this.a;
	},
	set : function(v) {
		this.a = v;
		this.isImageChanged = true;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scaleX", {
	get : function() {
		return this.rect.transformation.scaleX;
	},
	set : function(v) {
		this.rect.transformation.scaleX = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scaleY", {
	get : function() {
		return this.rect.transformation.scaleY;
	},
	set : function(v) {
		this.rect.transformation.scaleY = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scale", {
	get : function() {
		return this.rect.transformation.scaleX > this.rect.transformation.scaleY ? this.rect.transformation.scaleY : this.rect.transformation.scaleX;
	},
	set : function(v) {
		this.rect.transformation.scaleX = v;
		this.rect.transformation.scaleY = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "anchorX", {
	get : function() {
		return this.rect.transformation.anchorX;
	},
	set : function(v) {
		this.rect.transformation.anchorX = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "anchorY", {
	get : function() {
		return this.rect.transformation.anchorY;
	},
	set : function(v) {
		this.rect.transformation.anchorY = v;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "z", {
	get : function() {
		return this._z;
	},
	set : function(v) {
		dream.util.assert(v >= 0, "Z Index couldn't be negative!");
		var oldZ = this._z;  
		this._z = v|0;
		if(oldZ != v){
			this.isImageChanged = true;
			dream.event.dispatch(this, "onZChange", oldZ);
		}
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "image", {
	get: function() {
		var buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
		this.drawImage(buffer.context, new dream.Point(-this.rect.left, -this.rect.top));
		return buffer.context.getImageData(0, 0, this.rect.width, this.rect.height);
	}
});
