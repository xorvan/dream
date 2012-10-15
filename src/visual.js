/**
 * 
 */
dream.visual = {};

/**
 * @constructor
 * @extends dream.scenery.Asset
 */
dream.visual.Graphic = function(left, top, width, height){
	this.rect = new dream.Rect(left || 0, top || 0, width || 0, height || 0);
	
	this.a = 1;
	this.r = 0;
	this.sx = 1;
	this.sy = 1;
	
	this.viewRect = new dream.Rect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);
	
	this.visible = true;
	
	this.steps = new dream.util.ArrayList();
	
}.inherits(dream.scenery.Asset);

dream.visual.Graphic.prototype._checkRs = function() {
	return !(this.r == 0 && this.sx == 1 && this.sy == 1 && this.a == 1);
};


dream.visual.Graphic.prototype.draw = function(ctx, rect) {
	if (this._checkRs()) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		var tx = rect.left + rect.width / 2;
		var ty = rect.top + rect.height / 2;
		ctx.translate(tx, ty);
		ctx.rotate(this.r);
		// ctx.scale(this.sx,this.sy);
		this.drawImage(ctx, new dream.Rect(rect.left - tx, rect.top - ty, rect.width, rect.height));
		ctx.restore();
	} // end draw

	else
		this.drawImage(ctx, rect);
};

dream.visual.Graphic.prototype.calcBoundary = function() {
	var rr = -1 * this.r;
	var csn = Math.cos(rr);
	var sn = Math.sin(rr);
	var hw = this.rect.width / 2;
	var hh = this.rect.height / 2;
	var xcenter = this.rect.left + this.rect.width / 2;
	var ycenter = this.rect.top + this.rect.height / 2;
	var xs = [];
	var ys = [];
	xs[0] = ((-1 * hw * csn - hh * sn) + xcenter) | 0;
	ys[0] = (ycenter - (-1 * hw * sn + hh * csn)) | 0;
	xs[1] = ((hw * csn - hh * sn) + xcenter) | 0;
	ys[1] = (ycenter - (hw * sn + hh * csn)) | 0;
	xs[2] = ((-1 * hw * csn + hh * sn) + xcenter) | 0;
	ys[2] = (ycenter - (-1 * hw * sn - hh * csn)) | 0;
	xs[3] = ((hw * csn + hh * sn) + xcenter) | 0;
	ys[3] = (ycenter - (hw * sn - hh * csn)) | 0;

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

	this.viewRect.left = vx;
	this.viewRect.top = vy;	
	this.viewRect.width = vx1 - vx;
	this.viewRect.height = vy1 - vy;
};

dream.visual.Graphic.prototype.step = function (){
	for(var i = 0, step; step = this.steps.items[i]; i++){
		if (step.endFrame == dream.fc && step.isPlaying){
			dream.event.dispatch(step, onEnd);
			this.steps.remove(step);
		}else if(step.isPlaying){
			step.fn.call(this);
		}
	}
}; 

Object.defineProperty(dream.visual.Graphic.prototype, "left", {
	get : function() {
		return this.rect.left;
	},
	set : function(v) {
		var d = v - this.rect.left;
		this.rect.left = v;
		this.viewRect.left += d;
		this.viewRect.left1 += d;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "top", {
	get : function() {
		return this.rect.top;
	},
	set : function(v) {
		var d = v - this.rect.top;
		this.rect.top = v;
		this.viewRect.top += d;
		this.viewRect.top1 += d;
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "rotation", {
	get : function() {
		return this.r * 180 / Math.PI;
	},
	set : function(v) {
		if(this.scene) this.scene.redrawRegions.add(this.viewRect);
		this.r = Math.PI / 180 * v;
		this.calcBoundary();
		if(this.scene) this.scene.redrawRegions.add(this.viewRect);
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "width", {
	get : function() {
		return this.rect.width;
	},
	set : function(v) {
		this.rect.width = v;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "height", {
	get : function() {
		return this.rect.height;
	},
	set : function(v) {
		this.rect.height = v;
		this.calcBoundary();
	}
});

Object.defineProperty(dream.visual.Graphic.prototype, "alpha", {
	get : function() {
		return this.a;
	},
	set : function(v) {
		this.a = v;
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
dream.visual.Sprite = function(frameSet, left, top, width, height){
	dream.visual.Sprite._superClass.call(this, left, top, width, height);
	
	this.frameSets = new dream.util.Selector();
	if(frameSet){
		this.frameSets.add(frameSet, "default");
		this.frameSets.select("default");
	}
}.inherits(dream.visual.Graphic);

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
dream.visual.SpriteFrameSet = function(spriteSheetUrl,left, top, width, height, count){
	var x = left || 0;
	var y = top || 0;
	var w = width || 0;
	var h = height || 0;
	
	this.spriteSheetUrl = spriteSheetUrl;
	this.frames = new dream.util.Selector();
	
	var c = count || 1;
	for(var i=0; i<c; i++)
		this.frames.add(new dream.Rect(w*i + x, y, w, h));
	
	this.frames.select(0);
};

/**
 * @constructor
 */
dream.visual.SpriteSheet = function(url){
	this.url = url;
};

