/**
 * @constructor
 */
dream.Screen = function(canvas, minWidth, minHeight, maxWidth, maxHeight, scaleMode){
	var screen = this;
	
	this.scaleMode = dream.Screen.scaleModes.SHOWALL;
	if(scaleMode != undefined) this.scaleMode = scaleMode;

	this.fc = 0;
	this._frameRate = 0;
	this.frameRate = this._frameRate;
	
	this.canvas = canvas;
	this.context = this.canvas.getContext("2d");
	
	this.minWidth = minWidth || this.canvas.width;
	this.minHeight = minHeight || this.canvas.height;
	this.maxWidth = maxWidth || this.minWidth;
	this.maxHeight = maxHeight || this.minHeight;

	this.width = this.canvas.width;
	this.height = this.canvas.height;
	
	this.redrawRegions = new dream.util.RedrawRegionList();
	this.redrawBuffer = new dream.util.BufferCanvas(0, 0);
	
	this.keyBindings = new dream.util.IndexedArrayList(["key"]);

	this.input = new dream.input.InputHandler(this);
	this.scenes = new dream.util.Selector;

	this.scenes.onSelect.add(function(scene){
		scene.rect.width = screen.width;
		scene.rect.height = screen.height;
		
		dream.event.dispatch(scene, "onResize");
		
		screen.redrawRegions.add(new dream.Rect(0,0, this.width, this.height));
		
		scene.onViewRectChange.add(function(oldRect){
			//console.log("vc");
			screen.redrawRegions.add(new dream.Rect(0,0, this.width, this.height));//screen.scenes.current.viewport);
		});
		
		scene.onImageChange.add(function(rects){
			screen.redrawRegions.addArray(rects/*.map(function(r){return r.clone();})*/);
		});

		scene.assets.prepare(function(){
			screen.render(scene);
		});
	});
	
	this.updateSize();
	
	window.addEventListener("resize", function(){
		screen.updateSize();
	},false);
		
}.inherits(dream.VisualAsset);

dream.event.create(dream.VisualAsset.prototype, "onResize");

dream.Screen.prototype.pause = function(){
	var craf = this.cancelRequestAnimationFrameFunction;
	craf(this._AFID);
};

dream.Screen.prototype.resume = function(){
	this.render();
};

dream.Screen.prototype.render = function(){
	this.fc++;
	dream.fc ++;
	
	var kbs;
	for(var k in this.input.downKeys){
		if(kbs = this.keyBindings.index.key[k])
			for(var i=0, kb; kb = kbs[i]; i++)
				kb.fn(this.input.downKeys[k]);
		this.input.downKeys[k]++;
	}

	//this.scenes.current.draw(this.context, this.scenes.current.rect, this.scenes.current.viewport);
	this.drawImage(this.context, this.scenes.current.rect, new dream.Rect(0,0, this.width, this.height));
	
	this.checkHover(this.input.mouse);
	
	var screen = this, raf = this.requestAnimationFrameFunction; 
	this._AFID = raf(function(){screen.render();});
};

dream.Screen.prototype.drawImageWithoutRedrawRegion = function(ctx, rect, drawRect) {
	var scene = this.scenes.current;
	scene.step();
	ctx.clearRect(0,0,drawRect.width, drawRect.height);
	scene.draw(ctx, new dream.Rect(scene.rect.left, scene.rect.top, scene.rect.width, scene.rect.height), scene.translateInRect(drawRect));
};

dream.Screen.prototype.drawImageWithClippingRedrawRegion = function(ctx, rect, drawRect) {
	var rgCount = 0;
	
	var scene = this.scenes.current;
	scene.step();
	
	var rg;
	this.redrawRegions.forEach(function(rr){
		if(rg = rr.getIntersectWith(drawRect)){
			ctx.save();
			ctx.beginPath();
			ctx.rect(rg.left, rg.top, rg.width, rg.height);
			ctx.clip();
			ctx.closePath();
			rgCount++;
			ctx.clearRect(rg.left, rg.top, rg.width, rg.height);
			scene.draw(ctx, new dream.Rect(scene.rect.left, scene.rect.top, scene.rect.width, scene.rect.height), scene.translateInRect(rg));
			ctx.restore();
			//console.log(rr+"");
		}
	}, this);
	this.redrawRegions.clear();
	//if(rgCount) console.log(rgCount +" redraw regions." );
};

dream.Screen.prototype.drawImageWithBufferdRedrawRegion = function(ctx, rect, drawRect) {
	var rgCount = 0;
	
	var scene = this.scenes.current;
	scene.step();
		
	var rg;
	this.redrawRegions.forEach(function(rr){
		if(rg = rr.getIntersectWith(drawRect)){
			var rb = this.redrawBuffer;
			rb.canvas.width = rg.width;
			rb.canvas.height = rg.height;
			rgCount++;
			ctx.clearRect(rg.left, rg.top, rg.width, rg.height);
			scene.draw(rb.context, new dream.Rect(scene.rect.left - rg.left, scene.rect.top - rg.top, scene.rect.width, scene.rect.height), scene.translateInRect(rg));
			ctx.drawImage(rb.canvas, 0, 0, rg.width, rg.height, rg.left, rg.top, rg.width, rg.height);
			//console.log(rr+"");
		}
	}, this);
	this.redrawRegions.clear();
	//if(rgCount) console.log(rgCount +" redraw regions." );
};

dream.Screen.prototype.drawImage = dream.Screen.prototype.drawImageWithClippingRedrawRegion;
//dream.Screen.prototype.drawImage = dream.Screen.prototype.drawImageWithBufferdRedrawRegion;
//dream.Screen.prototype.drawImage = dream.Screen.prototype.drawImageWithoutRedrawRegion;

dream.Screen.prototype.checkHover = function (p){
	if( p.isIn(new dream.Rect(0, 0, this.canvas.offsetWidth-1, this.canvas.offsetHeight-1)) ){
		if(!this.hovered){
			this.isHovered = true;
			this.hovered = this.scenes.current;
			dream.event.dispatch(this, "onMouseOver");
		}
		
		this.hovered.checkHover(this.translateIn(p));
	}
};

dream.Screen.prototype.updateSize = function() {
	var ow = this.canvas.offsetWidth;
	var oh = this.canvas.offsetHeight;
	
	if(ow < this.minWidth)
		this.width = this.minWidth;
	else if (ow > this.maxWidth)
		this.width = this.maxWidth;
	else
		this.width = ow;
	
	if(oh < this.minHeight)
		this.height = this.minHeight;
	else if (oh > this.maxHeight)
		this.height = this.maxHeight;
	else
		this.height = oh;
	
	
	this.scaleX = this.canvas.offsetWidth / this.width;
	this.scaleY = this.canvas.offsetHeight / this.height;
	
	if(this.scaleMode && this.scaleX != this.scaleY){
		if(this.scaleMode == dream.Screen.scaleModes.SHOWALL){
			if(this.scaleX < this.scaleY){
				this.height = this.canvas.offsetHeight / this.scaleX; 
			}else{
				this.width = this.canvas.offsetWidth / this.scaleY;
			}
		}else{
			if(this.scaleX > this.scaleY){
				this.height = this.canvas.offsetHeight / this.scaleX; 
			}else{
				this.width = this.canvas.offsetWidth / this.scaleY;
			}
		}
		
		this.scaleX = this.canvas.offsetWidth / this.width;
		this.scaleY = this.canvas.offsetHeight / this.height;
	}
	
	this.canvas.width = this.width = this.width | 0;
	this.canvas.height = this.height = this.height | 0;
	
	if(this.scenes.current){
		this.scenes.current.rect.width = this.width;
		this.scenes.current.rect.height = this.height;
		dream.event.dispatch(this.scenes.current, "onResize");
	}

	dream.event.dispatch(this, "onResize");
};

dream.Screen.prototype.translateIn = function(p){
	var r = p.clone();
	r.left = (p.left / this.scaleX) | 0;
	r.top = (p.top / this.scaleY) | 0;
	return r;
};


dream.Screen.prototype.highlite = function(rect) {
	this.context.setStrokeColor(0xff0000);this.context.strokeRect(rect.left, rect.top, rect.width, rect.height);
};

Object.defineProperty(dream.Screen.prototype, "frameRate", {
	get : function() {
		return this._frameRate;
	},
	set : function(v) {
		this.requestAnimationFrameFunction = dream.util.getRequestAnimationFrame(v);
		this.cancelRequestAnimationFrameFunction = dream.util.getCancelRequestAnimationFrame(v);
		this._frameRate = v;
	}
});

dream.Screen.scaleModes = {
	EXACTFIT: 0,
	SHOWALL: 1,
	NOBORDER: 2,
};