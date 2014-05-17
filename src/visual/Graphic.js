/**
 * @module dream.visual
 * @namespace dream.visual
 */
(function(){

/**
 * superclass for all viewable objects on the screen. note no direct instance of *Graphic* could be displayed
 * on screen. any class that is subclassing *Graphic* should implement a *paint* method to which the context
 * and origin *Point* will be sent in render loop.
 *@class Graphic
 *@param {Number} left
 *the left position of Graphic
 *@param {Number} top
 *the top position of Graphic
 *@extends dream.VisualAsset
 */
var Graphic = function(left, top){
	this.a = 1;
	this._z = 0;

	this.anchor = new dream.geometry.Point();
	this.origin = new dream.geometry.Point(left, top);
	this.boundary = new dream.geometry.Rect(left, top);
	this.rect = new dream.geometry.Rect(0, 0, 0, 0, new dream.geometry.transform.Generic(left, top));
	this._matrix = this.rect.transformation.matrix;

	var self = this;

	this.rect.transformation.onChange.buffer();
	this.rect.transformation.onChange.propagateFlagged(this, "isBoundaryChanged");

	this.visible = true;

	this.isImageChanged = true;
	this.isBoundaryChanged = true;

	this.behavior = new dream.behavior.selector.Concurrent();
	this.behavior.init(this);

	this.behaviors = new dream.collection.Dict();
	this.behaviors.onAdd.add(function(behavior){
		behavior.init(self);
	});

	this.behaviours = new dream.collection.Dict();
	this.behaviours.onAdd.add(function(behaviour){
		behaviour.obj = self;
		behaviour.enable();
	});

	this.behaviours.onRemove.add(function(behaviour){
		behaviour.disable();
	});

	self.filters = new dream.visual.filter.FilterList;
	self.filters.onChange.add(function(){
		self.isImageChanged = true;
	});

}.inherits(dream.VisualAsset);

var Graphic$ = Graphic.prototype;

dream.event.create(Graphic$, "onImageChange");
dream.event.create(Graphic$, "onBoundaryChange");
dream.event.create(Graphic$, "onZChange");

Graphic$.selectionThreshold = 4;

Graphic$.translate = function(point){
	this.left = point.left;
	this.top = point.top;
};

Graphic$.paintFromBuffer = function(ctx, origin, renderRect){
	// TODO apply renderRect
	var buf = this.buffer, ba = buf.anchor;
	ctx.drawImage(buf.canvas, origin.left + ba.left, origin.top + ba.top);
};

Graphic$.render = function(ctx, origin, renderRect) {
	if(ctx instanceof dream.util.Plane){
		var plane = ctx
		//this is a plane of a scene not a context
		var ctx = ctx.ctx;
	}
	if(!this.visible) return 0;
	ctx.save();
	if(this.a != 1) ctx.globalAlpha = this.alpha;
//	var m = this.rect.transformation.matrix;
//	ctx.transform(m.x0, m.y0, m.x1, m.y1, m.dx|0, m.dy |0);
	var o = this.rect.transformation.apply(ctx, origin);
//	o.left |= 0, o.top |= 0;
	if(this._shadow){
		ctx.shadowOffsetX = this._shadow.offsetX;
		ctx.shadowOffsetY = this._shadow.offsetY;
		ctx.shadowBlur = this._shadow.blur;
		ctx.shadowColor = this._shadow.colorValue;
	}

	if (this.buffer)
		this.paintFromBuffer(ctx, o);
	else{
		if(this.filters.length)
			ctx.drawImage(this.filters.apply(this.imageData), (o.left | 0) + this.rect.left, (o.top | 0) + this.rect.top);
		else
			this.paint(plane ? plane:ctx, o, renderRect);
	}
	ctx.restore();
};

Graphic$.step = function (fc, post){
	// console.log(fc, this.fc);
	if(fc == this.fc) return false;
	this.fc = fc;

	var self = this;

	if (this.behavior && !post) this.behavior.step();

	this.rect.transformation.onChange.flush(function(q){
		if(!self.rect.transformation.matrix.equals(this._matrix)){
			return [q[q.length - 1]];
		}
	});

	var oldBoundary = this.boundary;
	if(this.isBoundaryChanged){
		this.resetBoundary();
		this.boundary = this.rect.boundary;

		if(!this.boundary.isEqualWith(oldBoundary)){
			dream.event.dispatch(this, "onBoundaryChange", oldBoundary);
			this.isImageChanged = true;
		}

		if(this.isImageChanged){
			dream.event.dispatch(this, "onImageChange", this.boundary.hasIntersectWith(oldBoundary) ? [this.boundary.add(oldBoundary)] : [this.boundary, oldBoundary]);
			this.isImageChanged = false;
		}

		oldBoundary = this.boundary.clone();
		this.isBoundaryChanged = false;
	}else if(this.isImageChanged){
		dream.event.dispatch(this, "onImageChange", [this.boundary]);
		this.isImageChanged = false;
	}

};

Graphic$.checkHover = function (event){
	var pl;
	if(event.position.isIn(this.boundary) && (pl = event.localPosition, this.imageData.data[ (((pl.top|0) - this.rect.top) * this.rect.width + ( pl.left|0) - this.rect.left)*4 + 3 ] > this.selectionThreshold)){
		if(!this.isHovered) dream.event.dispatch(this, "onMouseEnter", event);
		this.isHovered = true;
		return true;
	}else{
		return false;
	}
};

Object.defineProperty(Graphic$, "useBuffer", {
	get : function() {
		return !!this.buffer;
	},
	set:function(v){
		if(this.buffer && !v){
			this.onImageChange.removeByOwner(this.buffer);
			this.buffer = null;
		}
		else if(!this.buffer && v){
			this._updateBuffer();
		}
	}
});

Graphic$._updateBuffer = function(){
	if (this.buffer == null){
    this.resetBoundary();
		this.buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
		this.onImageChange.add(function(){
			this._updateBuffer();
		}, this.buffer);
	}else{
		this.buffer.canvas.width = this.rect.width;
		this.buffer.canvas.height = this.rect.height;
	}
	this.buffer.anchor = new dream.geometry.Point(this.rect.left, this.rect.top);
	this.paint(this.buffer.context, new dream.geometry.Point(-this.rect.left, -this.rect.top));
};

Graphic$.raiseMouseDown = function(event){
	dream.event.dispatch(this, "onMouseDown$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseDown", event);
	this.isMouseDown = true;
};

Graphic$.raiseMouseUp = function(event, clickEvent){
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp", event);
	if(this.isMouseDown){
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onClick$capture", clickEvent);
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onClick", clickEvent);
		this.isMouseDown = false;
	}
};

Graphic$.raiseMouseMove = function(event, dragEvent){
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

Graphic$.raiseMouseLeave = function(event){
	this.isHovered = false;
	this.hovered = null;
	dream.event.dispatch(this, "onMouseLeave", event);
};


Graphic$.raiseDrag = function(event){
	dream.event.dispatch(this, "onDrag$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDrag", event);
};

Graphic$.raiseDragStop = function(event){
	this.dragging = false;
	this.isDragging = false;
	this.isMouseDown = false;
	dream.event.dispatch(this, "onDragStop$capture", event);
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDragStop", event);
};

Object.defineProperty(Graphic$, "bitmap", {
	get : function() {
		return new dream.visual.Bitmap(this.imageData, 0, 0, this.rect.width, this.rect.height);
	}
});

Object.defineProperty(Graphic$, "left", {
	get : function() {
		return this.origin.left;
	},
	set : function(v) {
		this.origin.left = v;
		this.rect.transformation.left = v;
	}
});

Object.defineProperty(Graphic$, "top", {
	get : function() {
		return this.origin.top;
	},
	set : function(v) {
		this.origin.top = v;
		this.rect.transformation.top = v;
	}
});

Object.defineProperty(Graphic$, "rotation", {
	get : function() {
		return this.rect.transformation.rotation;
	},
	set : function(v) {
		this.rect.transformation.rotation = v;
	}
});

Object.defineProperty(Graphic$, "alpha", {
	get : function() {
		return this.a;
	},
	set : function(v) {
		this.a = v;
		this.isImageChanged = true;
	}
});

Object.defineProperty(Graphic$, "scaleX", {
	get : function() {
		return this.rect.transformation.scaleX;
	},
	set : function(v) {
		this.rect.transformation.scaleX = v;
	}
});

Object.defineProperty(Graphic$, "scaleY", {
	get : function() {
		return this.rect.transformation.scaleY;
	},
	set : function(v) {
		this.rect.transformation.scaleY = v;
	}
});

Object.defineProperty(Graphic$, "scale", {
	get : function() {
		return this.rect.transformation.scaleX > this.rect.transformation.scaleY ? this.rect.transformation.scaleY : this.rect.transformation.scaleX;
	},
	set : function(v) {
		this.rect.transformation.scaleX = v;
		this.rect.transformation.scaleY = v;
	}
});

Object.defineProperty(Graphic$, "anchorX", {
	get : function() {
		return this.rect.transformation.anchorX;
	},
	set : function(v) {
		this.rect.transformation.anchorX = v;
	}
});

Object.defineProperty(Graphic$, "anchorY", {
	get : function() {
		return this.rect.transformation.anchorY;
	},
	set : function(v) {
		this.rect.transformation.anchorY = v;
	}
});

Object.defineProperty(Graphic$, "z", {
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

Object.defineProperty(Graphic$, "image", {
	get: function() {
    if(this.buffer){
      var buffer = this.buffer;
    }else{
  		var buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
  		this.paint(buffer.context, new dream.geometry.Point(-this.rect.left, -this.rect.top));
    }

		return buffer.canvas;
	}
});

Object.defineProperty(Graphic$, "imageData", {
	get: function() {
    if(this.buffer){
      var buffer = this.buffer;
    }else{
  		var buffer = new dream.util.BufferCanvas(this.rect.width, this.rect.height);
  		this.paint(buffer.context, new dream.geometry.Point(-this.rect.left, -this.rect.top));
    }
		return buffer.context.getImageData(0, 0, this.rect.width, this.rect.height);
	}
});

Object.defineProperty(Graphic$, "mask", {
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

Graphic$.resetBoundary = function(){
	if(this._shadow){
		var rct = this.rect.clone();
		rct.width += this._shadow.blur * 2;
		rct.height += this._shadow.blur * 2;
		rct.left -+ this._shadow.blur - this._shadow.offsetX;
		rct.top -+ this._shadow.blur - this._shadow.offsetY;
		this.rect = this.rect.add(rct);
	}
}

Object.defineProperty(Graphic$, "shadow", {
	get : function() {
		return this._shadow;
	},
	set : function(v) {
		if(this._shadow  && this._shadow.onChange){
			this._shadow.onChange.removeByOwner(this)
		}
		this._shadow = v;
		var gfx = this;

		var handleChange;
		if(v){
			this._shadow.onChange.add(handleChange = function(){
				gfx.isBoundaryChanged = true;
			})
			handleChange();

		}
	}
});


// exports
dream.visual.Graphic = Graphic;

})();
