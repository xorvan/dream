
(function(){
		
/**
* @constructor
 * @extends dream.VisualAsset
 */
var Graphic = function(left, top){	
	this.a = 1;
	this._z = 0;
	
	this.anchor = new dream.Point();
	this.origin = new dream.Point(left, top);
	this.boundary = new dream.Rect(left, top);
	this.rect = new dream.Rect(0, 0, 0, 0, new dream.transform.Generic(left, top));
	 
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
	
	this.behaviours = new dream.collection.Dict();
	this.behaviours.onAdd.add(function(behaviour){
		behaviour.obj = graphic;
		behaviour.enable();
	});
	
	this.behaviours.onRemove.add(function(behaviour){
		behaviour.disable();
	});
	
	graphic.filters = new dream.visual.filter.FilterList;
	
}.inherits(dream.VisualAsset);

var $ = Graphic.prototype;

dream.event.create($, "onImageChange");
dream.event.create($, "onBoundaryChange");
dream.event.create($, "onZChange");

$.selectionThreshold = 4;

$.translate = function(point){
	this.left = point.left;
	this.top = point.top;
};

$.paintFromBuffer = function(ctx, origin, renderRect){
	// TODO apply renderRect
	var buf = this.buffer, ba = buf.anchor;
	ctx.drawImage(buf.canvas, origin.left + ba.left, origin.top + ba.top);
};

$.render = function(ctx, origin, renderRect) {
	ctx.save();	
	if(this.a != 1) ctx.globalAlpha = this.alpha;
//	var m = this.rect.transformation.matrix;
//	ctx.transform(m.x0, m.y0, m.x1, m.y1, m.dx|0, m.dy |0);
	var o = this.rect.transformation.apply(ctx, origin);
//	o.left |= 0, o.top |= 0;
	if (this.buffer)
		this.paintFromBuffer(ctx, o);
	else{
		if(this.filters.length)
			ctx.drawImage(this.filters.apply(this.imageData), o.left + this.rect.left, o.top + this.rect.top);
		else
			this.paint(ctx, o, renderRect);	
	}
	ctx.restore();
};

$.step = function (){
	
	if (this.dynamics.isPlaying) this.dynamics.step();

	var oldBoundary = this.boundary;
	if(this.isBoundaryChanged){
		this.boundary = this.rect.boundary;
		
		if(this.isImageChanged){
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(oldBoundary) ? [this.boundary.add(oldBoundary)] : [this.boundary, oldBoundary]);
			this.isImageChanged = false;
		}
		
		if(!this.boundary.isEqualWith(oldBoundary)){
			dream.event.dispatch(this, "onBoundaryChange", oldBoundary);
			oldBoundary = this.boundary.clone();
		}
		
		this.isBoundaryChanged = false;
	}else if(this.isPositionChanged){
		this.boundary = this.rect.boundary;
		if(!this.boundary.isEqualWith(oldBoundary)){
			dream.event.dispatch(this, "onBoundaryChange", oldBoundary);
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(oldBoundary) ? [this.boundary.add(oldBoundary)] : [this.boundary, oldBoundary]);
			oldBoundary = this.boundary.clone();
		}else if(this.isImageChanged){
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(oldBoundary) ? [this.boundary.add(oldBoundary)] : [this.boundary, oldBoundary]);
		}
		this.isPositionChanged = false;
		this.isImageChanged = false;
		
	}else if(this.isImageChanged){
		dream.event.dispatch(this, "onImageChange", [this.boundary]);
		this.isImageChanged = false;
	}
	
}; 

$.checkHover = function (event){
	var pl;
	if(event.position.isIn(this.boundary) && (pl = event.localPosition, this.imageData.data[ (((pl.top|0) - this.rect.top) * this.rect.width + ( pl.left|0) - this.rect.left)*4 + 3 ] > this.selectionThreshold)){
		if(!this.isHovered) dream.event.dispatch(this, "onMouseEnter", event);
		this.isHovered = true;
		return true;
	}else{
		return false;
	}
};

Object.defineProperty($, "useBuffer", {
	get : function() {
		return !!this.buffer;
	},
	set:function(v){
		if(buffer && !v){
			this.onImageChange.removeByOwner(this.buffer);
			this.buffer = null; 
		}
		else if(!buffer && v){
			this._updateBuffer();
		}
	}
});

$._updateBuffer = function(){
	if (this.buffer == null){
		this.buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
		this.onImageChange.add(function(){
			this._updateBuffer();
		}, this.buffer);
	}else{
		this.buffer.canvas.width = this.rect.width;
		this.buffer.canvas.height = this.rect.height;
	}
	this.buffer.anchor = new dream.Point(this.rect.left, this.rect.top);
	this.paint(this.buffer.context, new dream.Point(-this.rect.left, -this.rect.top));
};

$.raiseMouseDown = function(event){
	dream.event.dispatch(this, "onMouseDown$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseDown", event);
	this.isMouseDown = true;
};

$.raiseMouseUp = function(event, clickEvent){
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp", event);
	if(this.isMouseDown){
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onClick$capture", clickEvent);
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onClick", clickEvent);
		this.isMouseDown = false;
	}
};

$.raiseMouseMove = function(event, dragEvent){
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

$.raiseMouseLeave = function(event){
	this.isHovered = false;
	this.hovered = null;
	dream.event.dispatch(this, "onMouseLeave", event);
};


$.raiseDrag = function(event){
	dream.event.dispatch(this, "onDrag$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDrag", event);
};

$.raiseDragStop = function(event){
	this.dragging = false;
	this.isDragging = false;
	this.isMouseDown = false;
	dream.event.dispatch(this, "onDragStop$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDragStop", event);
};

Object.defineProperty($, "bitmap", {
	get : function() {
		return new dream.visual.Bitmap(this.imageData, 0, 0, this.rect.width, this.rect.height);
	}
});

Object.defineProperty($, "left", {
	get : function() {
		return this.origin.left;
	},
	set : function(v) {
		this.origin.left = v;
		this.rect.transformation.left = v;		
	}
});

Object.defineProperty($, "top", {
	get : function() {
		return this.origin.top;
	},
	set : function(v) {
		this.origin.top = v;
		this.rect.transformation.top = v;
	}
});

Object.defineProperty($, "rotation", {
	get : function() {
		return this.rect.transformation.rotation;
	},
	set : function(v) {
		this.rect.transformation.rotation = v;
	}
});

Object.defineProperty($, "alpha", {
	get : function() {
		return this.a;
	},
	set : function(v) {
		this.a = v;
		this.isImageChanged = true;
	}
});

Object.defineProperty($, "scaleX", {
	get : function() {
		return this.rect.transformation.scaleX;
	},
	set : function(v) {
		this.rect.transformation.scaleX = v;
	}
});

Object.defineProperty($, "scaleY", {
	get : function() {
		return this.rect.transformation.scaleY;
	},
	set : function(v) {
		this.rect.transformation.scaleY = v;
	}
});

Object.defineProperty($, "scale", {
	get : function() {
		return this.rect.transformation.scaleX > this.rect.transformation.scaleY ? this.rect.transformation.scaleY : this.rect.transformation.scaleX;
	},
	set : function(v) {
		this.rect.transformation.scaleX = v;
		this.rect.transformation.scaleY = v;
	}
});

Object.defineProperty($, "anchorX", {
	get : function() {
		return this.rect.transformation.anchorX;
	},
	set : function(v) {
		this.rect.transformation.anchorX = v;
	}
});

Object.defineProperty($, "anchorY", {
	get : function() {
		return this.rect.transformation.anchorY;
	},
	set : function(v) {
		this.rect.transformation.anchorY = v;
	}
});

Object.defineProperty($, "z", {
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

Object.defineProperty($, "image", {
	get: function() {
		var buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
		this.paint(buffer.context, new dream.Point(-this.rect.left, -this.rect.top));
		return buffer.canvas;
	}
});

Object.defineProperty($, "imageData", {
	get: function() {
		var buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
		this.paint(buffer.context, new dream.Point(-this.rect.left, -this.rect.top));
		return buffer.context.getImageData(0, 0, this.rect.width, this.rect.height);
	}
});

Object.defineProperty($, "mask", {
	get : function() {
		return this._mask;
	},
	set : function(v) {
		if (v instanceof dream.visual.drawing.Shape){
			this._mask = v;
			this.render = function(context, origin, renderRect){
				context.save();	
				if(this.a != 1) context.globalAlpha = this.alpha;
				var o = this.rect.transformation.apply(context, origin);
// TODO change it to reverse matrix and thus reducing one save/restore after rectangology optimization
				context.save();
				var mo = v.rect.transformation.apply(context, o);
				v.draw(context, mo);
				context.restore();
				context.clip();
				this.paint(context, o, renderRect);
				context.restore();
			};
		}
		else
			console.log("mask object should be instance of Shape and have a path");
	}
});

// exports

dream.visual.Graphic = Graphic;

})();