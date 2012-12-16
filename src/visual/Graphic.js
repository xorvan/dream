/**
 * @constructor
 * @extends dream.VisualAsset
 */
dream.visual.Graphic = function(left, top, width, height){	
	this.a = 1;
	this.r = 0;
	this.sx = 1;
	this.sy = 1;
	this.ax = 0;
	this.ay = 0;
	
	this._z = 0;
	
	this.anchor = new dream.Point();
	this.rect = new dream.Rect(left || 0, top || 0, width || 0, height || 0);
	this.viewRect = new dream.Rect(this.rect.left - this.ax | 0, this.rect.top - this.ay | 0, this.rect.width, this.rect.height);
	this.actuallRect = this.rect;
	this.oldViewRect = this.viewRect.clone();
	
	this.visible = true;
	
	this.isImageChanged = true;
	this.isViewRectChanged = true;
	
	this.steps = new dream.util.ArrayList();
	this.tweens = new dream.util.ArrayList();
	
	var graphic = this;
	this.tweens.onAdd.add(function(tween){
		tween.host = graphic; 
		graphic.steps.add(tween.step);
		tween.onEnd.add(function(){
			graphic.tweens.remove(tween);
		});
	});
	
	this.tweens.onRemove.add(function(tween){
		graphic.steps.remove(tween.step);
	});
	
	this.buffer = null;
	this.dropBuffer = function(){this.buffer = null; if (this.oldDrawImage) this.drawImage = this.oldDrawImage;};
	this.updateBuffer = function(){
		this.oldDrawImage = this.drawImage;
		if (this.buffer == null)
			this.buffer = new dream.util.BufferCanvas(this.actuallRect.width, this.actuallRect.height);
		this.oldDrawImage(this.buffer.context, new dream.Rect(0, 0, this.actuallRect.width, this.actuallRect.height), this.actuallRect.clone());
		this.drawImage = function(ctx, rect) {
			ctx.drawImage(this.buffer.canvas, rect.left, rect.top, this.actuallRect.width, this.actuallRect.height);
		};
	};
	
}.inherits(dream.VisualAsset);

dream.event.create(dream.visual.Graphic.prototype, "onImageChange");
dream.event.create(dream.visual.Graphic.prototype, "onViewRectChange");
dream.event.create(dream.visual.Graphic.prototype, "onZChange");

dream.visual.Graphic.prototype.selctionThreshold = 4;

dream.visual.Graphic.prototype.translateIn = function(p){
	var x = p.left - this.rect.left;
	var y = p.top - this.rect.top;
	
	var c = Math.cos(this.r);
	var s = Math.sin(this.r);
	var r = p.clone();
	r.left = (this.anchorX + (x * c + y * s)  / this.scaleX);// | 0;
	r.top = (this.anchorY +  (y * c - x * s) / this.scaleY);// | 0;
	return r;
};

dream.visual.Graphic.prototype.translateInRect = function(rect){
	var tps = [
	           this.translateIn(new dream.Point(rect.left, rect.top)),
	           this.translateIn(new dream.Point(rect.right, rect.top)),
	           this.translateIn(new dream.Point(rect.left, rect.bottom)),
	           this.translateIn(new dream.Point(rect.right, rect.bottom))
	           ];
	
	var tp = tps[0].clone();
	var tp1 = tps[0].clone();
	for ( var i = 0; i < 4; i++) {
		if (tps[i].left < tp.left)
			tp.left = tps[i].left;
		if (tps[i].left > tp1.left)
			tp1.left = tps[i].left;
		if (tps[i].top < tp.top)
			tp.top = tps[i].top;
		if (tps[i].top > tp1.top)
			tp1.top = tps[i].top;
	}
	
	return new dream.Rect(tp.left, tp.top, tp1.left - tp.left, tp1.top - tp.top);
};


dream.visual.Graphic.prototype._checkRs = function() {
	return !(this.r == 0 && this.sx == 1 && this.sy == 1 && this.a == 1);
};

dream.visual.Graphic.prototype.draw = function(ctx, rect, drawRect) {
	if (this._checkRs()) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		var tx = rect.left;
		var ty = rect.top;
		ctx.translate(tx, ty);
		ctx.rotate(this.r);
		ctx.scale(this.sx, this.sy);
		//if (this.buffer)
		this.drawImage(ctx, new dream.Rect(this.ax*-1, this.ay*-1, rect.width, rect.height), drawRect);
		ctx.restore();
	}else
		this.drawImage(ctx, new dream.Rect(rect.left - this.ax, rect.top - this.ay, rect.width, rect.height), drawRect);
};

dream.visual.Graphic.prototype.calcBoundary = function() {
	var rr = this.r;
	var csn = Math.cos(rr);
	var sn = Math.sin(rr);
	
	var nx = (-1 * this.ax - (this.rect.left - this.actuallRect.left)) * this.sx;
	var nx1 = (this.rect.width - this.ax + (this.actuallRect.right - this.rect.right)) * this.sx;
	var ny = (-1 * this.ay - (this.rect.top - this.actuallRect.top)) * this.sy;
	var ny1 = (this.rect.height - this.ay + (this.actuallRect.bottom - this.rect.bottom)) * this.sy;
	
	var xs = [];
	var ys = [];
	xs[0] = (nx * csn - ny * sn) | 0;
	ys[0] = (nx * sn + ny1 * csn) | 0;
	xs[1] = (nx1 * csn - ny * sn) | 0;
	ys[1] = (nx1 * sn + ny1 * csn) | 0;
	xs[2] = (nx * csn - ny1 * sn) | 0;
	ys[2] = (nx * sn + ny * csn) | 0;
	xs[3] = (nx1 * csn - ny1 * sn) | 0;
	ys[3] = (nx1 * sn + ny * csn) | 0;

	var vx = xs[0];
	var vx1 = xs[0];
	var vy = ys[0];
	var vy1 = ys[0];
	for ( var i = 0; i < 4; i++) {
		if (xs[i] < vx)
			vx = xs[i];
		if (xs[i] > vx1)
			vx1 = xs[i];
		if (ys[i] < vy)
			vy = ys[i];
		if (ys[i] > vy1)
			vy1 = ys[i];
	}
	
	var oldRect = this.viewRect.clone();
	
	this.viewRect.left = vx + this.rect.left - 1;
	this.viewRect.top = vy + this.rect.top - 1;	
	this.viewRect.width = vx1 - vx + 2;
	this.viewRect.height = vy1 - vy + 2;
	
	this.isViewRectChanged = true;
};

dream.visual.Graphic.prototype.checkHover = function (p){
	var x = p.left, y = p.top;
	
	if(p.isIn(this.viewRect) && this.image.data[ (((y|0) - this.viewRect.top) * this.viewRect.width + (x|0) - this.viewRect.left)*4 + 3 ] > this.selctionThreshold){
		 
		if(!this.isHovered) dream.event.dispatch(this, "onMouseOver");
		this.isHovered = true;
		return true;
	}else{
		return false;
	}
};

dream.visual.Graphic.prototype.raiseMouseDown = function(mouse){
	dream.event.dispatch(this, "onMouseDown", mouse);
	this.isMouseDown = true;
};

dream.visual.Graphic.prototype.raiseMouseUp = function(mouse){
	dream.event.dispatch(this, "onMouseUp", mouse);
	if(this.isMouseDown){
		dream.event.dispatch(this, "onClick", mouse);
		this.isMouseDown = false;
	}
};

dream.visual.Graphic.prototype.raiseMouseMove = function(mouse){
	dream.event.dispatch(this, "onMouseMove", mouse);
	if(this.isMouseDown){
		if(!this.isDragging){
			dream.event.dispatch(this, "onDragStart", mouse);
			this.isDragging = true;
		}
	}
};

dream.visual.Graphic.prototype.raiseMouseOut = function(mouse){
	this.isHovered = false;
	this.hovered = null;
	dream.event.dispatch(this, "onMouseOut", mouse);
};


dream.visual.Graphic.prototype.raiseDrag = function(mouse){
	dream.event.dispatch(this, "onDrag", mouse);
};

dream.visual.Graphic.prototype.raiseDragStop = function(mouse){
	this.dragging = false;
	this.isDragging = false;
	this.isMouseDown = false;
	dream.event.dispatch(this, "onDragStop", mouse);
};

dream.visual.Graphic.prototype.step = function (){
	if(this.isViewRectChanged){
		if(this.isImageChanged){
			dream.event.dispatch(this, "onImageChange", this.viewRect.hasIntersectWith(this.oldViewRect) ? [this.viewRect.add(this.oldViewRect)] : [this.viewRect, this.oldViewRect]);
			this.isImageChanged = false;
		}
		dream.event.dispatch(this, "onViewRectChange", this.oldViewRect);
		this.oldViewRect = this.viewRect.clone();
		this.isViewRectChanged = false;
	}else if(this.isImageChanged){
		dream.event.dispatch(this, "onImageChange", [this.viewRect]);
		this.isImageChanged = false;
	}
	
	
	for(var i = 0, step; step = this.steps[i]; i++){
		if(step.isPlaying && !((dream.fc - step.startFrame) % step.interval) ){
			step.fn.call(this);
		}
		if (step.endFrame == dream.fc && step.isPlaying){
			dream.event.dispatch(step, "onEnd");			
			if(!step._persistent) this.steps.remove(step);
		}
	}
}; 

Object.defineProperty(dream.visual.Graphic.prototype, "left", {
	get : function() {
		return this.rect.left;
	},
	set : function(v) {
		var v = v | 0;
		var oldRect = this.viewRect.clone();
		var d = v - this.rect.left;
		this.rect.left = v;
		this.viewRect.left += d;
		
		this.isImageChanged = true;
		this.isViewRectChanged = true;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "top", {
	get : function() {
		return this.rect.top;
	},
	set : function(v) {
		var v = v | 0;
		var oldRect = this.viewRect.clone();
		var d = v - this.rect.top;
		this.rect.top = v;
		this.viewRect.top += d;
		
		this.isImageChanged = true;
		this.isViewRectChanged = true;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "rotation", {
	get : function() {
		return this.r * 180 / Math.PI;
	},
	set : function(v) {
		this.r = (Math.PI / 180 * v) % (Math.PI * 2);
		this.isImageChanged = true;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "width", {
	get : function() {
		return this.rect.width;
	},
	set : function(v) {
		var v = v | 0;
		this.rect.width = v;
		this.isImageChanged = true;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "height", {
	get : function() {
		return this.rect.height;
	},
	set : function(v) {
		var v = v | 0;
		this.rect.height = v;
		this.isImageChanged = true;
		this.calcBoundary();
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
		return this.sx;
	},
	set : function(v) {
		this.sx = v;
		this.isImageChanged = true;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scaleY", {
	get : function() {
		return this.sy;
	},
	set : function(v) {
		this.sy = v;
		this.isImageChanged = true;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scale", {
	get : function() {
		return this.sy > this.sy ? this.sy : this.sx ;
	},
	set : function(v) {
		this.sy = v;
		this.sx = v;
		this.isImageChanged = true;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "anchorX", {
	get : function() {
		return this.ax;
	},
	set : function(v) {
		this.ax = v;
		this.isImageChanged = true;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "anchorY", {
	get : function() {
		return this.ay;
	},
	set : function(v) {
		this.ay = v;
		this.isImageChanged = true;
		this.calcBoundary();
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
		var buffer = new dream.util.BufferCanvas(this.viewRect.width, this.viewRect.height);

		this.draw(buffer.context, new dream.Rect(this.actuallRect.left - this.viewRect.left, this.actuallRect.top - this.viewRect.top, this.rect.width, this.rect.height));
		return buffer.context.getImageData(0, 0, this.viewRect.width, this.viewRect.height);
	}
});
