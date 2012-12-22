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
	
	this.rect = new dream.Rect(0, 0, this.width, this.height, new dream.transform.Scale);
	
	this.redrawRegions = new dream.util.RedrawRegionList();
	this.redrawBuffer = new dream.util.BufferCanvas(0, 0);
	
	this.keyBindings = new dream.util.IndexedArrayList({"key": null});

	this.input = new dream.input.InputHandler(this);
	this.scenes = new dream.util.Selector;

	this.scenes.onSelect.add(function(scene){
		//TODO: scene width & height
		//scene.rect.width = screen.width;
		//scene.rect.height = screen.height;
		screen.hovered = null;
		
		dream.event.dispatch(scene, "onResize");
		
		screen.redrawRegions.add(new dream.Rect(0,0, screen.width, screen.height));
		scene.onBoundaryChange.add(function(oldRect){
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

	window.addEventListener("orientationchange ", function(){
		screen.updateSize();
	},false);
		
}.inherits(dream.VisualAsset);

dream.event.create(dream.VisualAsset.prototype, "onResize");
dream.event.create(dream.VisualAsset.prototype, "onDeviceMotion");

dream.Screen.prototype.pause = function(){
	var craf = this.cancelRequestAnimationFrameFunction;
	craf(this._AFID);
	this.isRendering = false;
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
	this.drawImage(this.context, this.scenes.current.origin, new dream.Rect(0,0, this.width, this.height));
	
	this.checkHover(this.input.mouse);
	
	if(!this.isRendering){
		this.isRendering = true;
		var screen = this, raf = this.requestAnimationFrameFunction; 
		this._AFID = raf(function(){screen.isRendering = false;screen.render();});
	}
};

dream.Screen.prototype.drawImageWithoutRedrawRegion = function(ctx, rect, drawRect) {
	var scene = this.scenes.current;
	scene.step();
	ctx.clearRect(0,0,drawRect.width, drawRect.height);
	scene.draw(ctx, new dream.Rect(scene.rect.left, scene.rect.top, scene.rect.width, scene.rect.height), scene.rect.transformation.unprojectRect(drawRect).boundary);
};

dream.Screen.prototype.drawImageWithClippingRedrawRegion = function(ctx, origin, drawRect) {
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
			scene.draw(ctx, new dream.Point(0, 0), scene.rect.transformation.unprojectRect(rg).boundary);
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
			scene.draw(rb.context, new dream.Rect(scene.rect.left - rg.left, scene.rect.top - rg.top, scene.rect.width, scene.rect.height), scene.rect.transformation.unprojectRect(rg));
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
		
		this.hovered.checkHover(this.rect.transformation.unproject(p));
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
	
	this.canvas.width = this.rect.width = this.width = this.width | 0;
	this.canvas.height = this.rect.height = this.height = this.height | 0;
	
	this.rect.transformation.x = this.scaleX;
	this.rect.transformation.y = this.scaleY;
	
	if(this.scenes.current){
		this.scenes.current.width = this.width;
		this.scenes.current.height = this.height;
		dream.event.dispatch(this.scenes.current, "onResize");
	}

	dream.event.dispatch(this, "onResize");
};

dream.Screen.prototype.highlite = function(rect) {
	this.context.strokeStyle = "#f00";this.context.strokeRect(rect.left, rect.top, rect.width, rect.height);
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

Object.defineProperty(dream.Screen.prototype, "orientation", {
	get : function() {
		return window.orientation;
	}
});

dream.Screen.scaleModes = {
	EXACTFIT: 0,
	SHOWALL: 1,
	NOBORDER: 2
};