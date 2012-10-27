/**
 * 
 */
dream.visual = {};

/**
 * @constructor
 * @extends dream.scenery.Asset
 */
dream.visual.Graphic = function(left, top, width, height){	
	this.a = 1;
	this.r = 0;
	this.sx = 1;
	this.sy = 1;
	this.ax = 0;
	this.ay = 0;
	
	this.anchor = new dream.Point();
	this.rect = new dream.Rect(left || 0, top || 0, width || 0, height || 0);
	this.viewRect = new dream.Rect(this.rect.left - this.ax | 0, this.rect.top - this.ay | 0, this.rect.width, this.rect.height);
	
	this.visible = true;
	
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
	
}.inherits(dream.scenery.Asset);

dream.event.create(dream.visual.Graphic.prototype, "onImageChange");
dream.event.create(dream.visual.Graphic.prototype, "onViewRectChange");

dream.visual.Graphic.prototype._checkRs = function() {
	return !(this.r == 0 && this.sx == 1 && this.sy == 1 && this.a == 1);
};

dream.visual.Graphic.prototype.draw = function(ctx, rect) {
	if (this._checkRs()) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		var tx = rect.left;
		var ty = rect.top;
		ctx.translate(tx, ty);
		ctx.rotate(this.r);
		ctx.scale(this.sx, this.sy);
		this.drawImage(ctx, new dream.Rect(this.ax*-1, this.ay*-1, rect.width, rect.height));
		ctx.restore();
	}else
		this.drawImage(ctx, new dream.Rect(rect.left - this.ax, rect.top - this.ay, rect.width, rect.height));
};

dream.visual.Graphic.prototype.calcBoundary = function() {
	var rr = this.r;
	var csn = Math.cos(rr);
	var sn = Math.sin(rr);
	
	var nx = -1 * this.ax * this.sx;
	var nx1 = (this.rect.width - this.ax) * this.sx;
	var ny = -1 * this.ay  * this.sy;
	var ny1 = (this.rect.height - this.ay) * this.sy;
	
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

	this.viewRect.left = vx + this.rect.left - 1;
	this.viewRect.top = vy + this.rect.top - 1;	
	this.viewRect.width = vx1 - vx + 2;
	this.viewRect.height = vy1 - vy + 2;
};

dream.visual.Graphic.prototype.step = function (){
	for(var i = 0, step; step = this.steps.items[i]; i++){
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
		dream.event.dispatch(this, "onViewRectChange", oldRect);
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
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "rotation", {
	get : function() {
		return this.r * 180 / Math.PI;
	},
	set : function(v) {
		var oldRect = this.viewRect.clone();
		this.r = (Math.PI / 180 * v) % (Math.PI * 2);
		this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "width", {
	get : function() {
		return this.rect.width;
	},
	set : function(v) {
		var v = v | 0;
		var oldRect = this.viewRect.clone();
		this.rect.width = v;
		this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "height", {
	get : function() {
		return this.rect.height;
	},
	set : function(v) {
		var v = v | 0;
		var oldRect = this.viewRect.clone();
		this.rect.height = v;
		this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "alpha", {
	get : function() {
		return this.a;
	},
	set : function(v) {
		this.a = v;
		dream.event.dispatch(this, "onImageChange");
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scaleX", {
	get : function() {
		return this.sx;
	},
	set : function(v) {
		var oldRect = this.viewRect.clone();
		this.sx = v;
		this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scaleY", {
	get : function() {
		return this.sy;
	},
	set : function(v) {
		var oldRect = this.viewRect.clone();
		this.sy = v;
		this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "scale", {
	get : function() {
		return this.sy > this.sy ? this.sy : this.sx ;
	},
	set : function(v) {
		var oldRect = this.viewRect.clone();
		this.sy = v;
		this.sx = v;
		this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "anchorX", {
	get : function() {
		return this.ax;
	},
	set : function(v) {
		var oldRect = this.viewRect.clone();
		this.ax = v;
		if(this._checkRs()) this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "anchorY", {
	get : function() {
		return this.ay;
	},
	set : function(v) {
		var oldRect = this.viewRect.clone();
		this.ay = v;
		if(this._checkRs()) this.calcBoundary();
		dream.event.dispatch(this, "onViewRectChange", oldRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "imageData", {
	get: function() {
		var buffer = new dream.util.BufferCanvas(this.viewRect.width, this.viewRect.height);

		this.draw(buffer.context, (this.viewRect.width - this.rect.width) / 2, (this.viewRect.height - this.rect.height) / 2, this.rect.width, this.rect.height);
		return buffer.context.getImageData(0, 0, this.viewRect.width, this.viewRect.height);
	}
});


/**
 * @constructor
 */
dream.visual.Composite = function(left, top){
	dream.visual.Composite._superClass.call(this, left, top);
	var composite = this;
	
	this.actualRect = new dream.Rect(left, top);
	
	var checkActualRect = function(g){
		if(g.viewRect.left < composite.actualRect.left)
			composite.actualRect.left = g.viewRect.left;
		if(g.viewRect.top < composite.actualRect.top)
			composite.actualRect.top = g.viewRect.top;
		if(g.viewRect.right > composite.actualRect.right)
			composite.actualRect.width = g.viewRect.right - composite.actualRect.width;
		if(g.viewRect.bottom > composite.actualRect.bottom)
			composite.actualRect.height = g.viewRect.bottom - composite.actualRect.height;		
	};
	
	var reCalcActualRect = function(){
		composite.actualRect.left = composite.rect.left;
		composite.actualRect.top = composite.rect.top;
		composite.children.items.forEach(checkActualRect);
	};
	
	this.children = new dream.util.ArrayList();
	this.children.onAdd.add(function(g){
		checkActualRect(g);
		g.onViewRectChange.add(reCalcActualRect);
	});
	this.children.onRemove.add(function(g){
		reCalcActualRect();
	});
}.inherits(dream.visual.Graphic);

dream.visual.Composite.prototype.drawImage = function(ctx, rect) {
	this.children.items.forEach(function(g){
		g.draw(ctx, new dream.Rect(rect.left + g.rect.left, rect.top + g.rect.top, g.rect.width, g.rect.height));
	});
};

/**
 * @constructor
 */
dream.visual.Sprite = function(frameSet, left, top, width, height){
	dream.visual.Sprite._superClass.call(this, left, top, width, height);
	
	this.frameSets = new dream.util.Selector();
	var sprite = this;
	this.frameSets.onSelect.add(function(fs){
		if(sprite.animStep){
			sprite.steps.remove(sprite.animStep);
			delete sprite.animStep;
		}
		
		if(fs.frames.items.length > 1)
			sprite.animStep = sprite.steps.add(new dream.visual.animation.Step(function(){fs.frames.next();dream.event.dispatch(sprite, "onImageChange");}, -1, fs.interval));
	});
	
	if(frameSet){
		this.frameSets.add(frameSet, "default");
		this.frameSets.select("default");
	}
}.inherits(dream.visual.Graphic);

dream.visual.Sprite.prototype.pause = function(){
	if(this.animStep) this.animStep.pause();
};

dream.visual.Sprite.prototype.resume = function(){
	if(this.animStep) this.animStep.resume();
};

dream.visual.Sprite.prototype.drawImage = function(ctx, rect) {
	var fs = this.frameSets.current;
	var f = fs.frames.current;
	ctx.drawImage(dream.preload.cache[fs.spriteSheetUrl].content, f.left, f.top, f.width, f.height, rect.left, rect.top, rect.width, rect.height);
};

Object.defineProperty(dream.visual.Sprite.prototype, "requiredResources", {
	get : function () {
		var r = [];
		for(var i=0, fs; fs = this.frameSets.items[i]; i++){
			r.push(new dream.preload.ImageResource(fs.spriteSheetUrl));
		}
		return r;
	}
});


/**
 * @constructor
 */
dream.visual.SpriteFrameSet = function(spriteSheetUrl,left, top, width, height, count, interval, orders){
	var x = left || 0;
	var y = top || 0;
	var w = width || 0;
	var h = height || 0;
	
	this.spriteSheetUrl = spriteSheetUrl;
	this.interval = interval;
	this.frames = new dream.util.Selector();
	
	if(orders){
		var fa = this.frames;
		orders.forEach(function(i){
			fa.add(new dream.Rect(w*i + x, y, w, h));
		});
	}else{
		var c = count || 1;
		for(var i=0; i<c; i++)
			this.frames.add(new dream.Rect(w*i + x, y, w, h));
	}
	
	this.frames.select(0);
};

