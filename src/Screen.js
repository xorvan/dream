/**
 * @constructor
 */
dream.Screen = function(canvas, minWidth, minHeight, maxWidth, maxHeight, scaleMode){
	var screen = this;
	
	this.scaleMode = dream.Screen.ScaleMode.SHOW_ALL;
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
	
	this.rect = new dream.geometry.Rect(0, 0, this.width, this.height, new dream.geometry.transform.Scale);
	
	this.redrawRegions = new dream.util.RedrawRegionList();
	this.rerenderBuffer = new dream.util.BufferCanvas(0, 0);
	
	this.input = new dream.input.InputHandler(this);
	this.scenes = new dream.collection.Selector;

	this.scenes.onSelect.add(function(scene){
		scene.screenBoundary.width = screen.width;
		scene.screenBoundary.height = screen.height;
		screen.hovered = null;
		
		screen.redrawRegions.add(new dream.geometry.Rect(0,0, screen.width, screen.height));
		scene.onBoundaryChange.add(function(oldRect){
			screen.redrawRegions.add(new dream.geometry.Rect(0, 0, this.viewport.width, this.viewport.height));
		}, screen);
		
		scene.onImageChange.add(function(rects){
			screen.redrawRegions.addArray(rects/*.map(function(r){return r.clone();})*/);
		}, screen);

		scene.prepare(function(){
			console.log("prepared")
			screen.render(scene);
		});
		// console.log(scene.screenBoundary);
		dream.event.dispatch(scene, "onResize");
		// console.log(scene.viewport);
		
	});
	
	this.scenes.onDeselect.add(function(scene){
		scene.onBoundaryChange.removeByOwner(screen);
		scene.onImageChange.removeByOwner(screen);
		scene.screenBoundary.width = 0;
		scene.screenBoundary.height = 0;
		dream.event.dispatch(scene, "onResize");
		prevScene = scene
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

dream.Screen.prototype.pause = function(){
	var craf = this.cancelRequestAnimationFrameFunction;
	craf(this._AFID);
	this.isdrawing = false;
};

dream.Screen.prototype.resume = function(){
	this.render();
};

dream.Screen.prototype.render = function(){		
	this.fc++;
	dream.fc ++;
	
	var checkInput = this.fc % this.input.interval == 0;
	
	if(checkInput){
		var kbs;
		for(var k in this.input.downKeys){
			if(kbs = this.keyBindings.index.key[k])
				for(var i=0, kb; kb = kbs[i]; i++)
					kb.fn(this.input.downKeys[k]);
			this.input.downKeys[k]++;
		}
	}
	
	this.paint(this.context, new dream.geometry.Point, new dream.geometry.Rect(0,0, this.width, this.height));
	
	if(checkInput){
		this.checkHover(new dream.input.MouseEvent(null, this.input.mouse.position, this));
		if(this.input.mouse.isDown) this.raiseDrag(new dream.input.MouseEvent(null, this.input.mouse.position, this));
	}
	
	if(!this.isdrawing){
		this.isdrawing = true;
		var screen = this, raf = this.requestAnimationFrameFunction; 
		this._AFID = raf(function(){screen.isdrawing = false;screen.render();});
	}
};

dream.Screen.prototype.paintWithoutRedrawRegion = function(ctx, rect, renderRect) {
	var scene = this.scenes.current;
	scene.step();
	ctx.clearRect(0,0,renderRect.width, renderRect.height);
	scene.render(ctx, new dream.geometry.Point, renderRect);
};

dream.Screen.prototype.paintWithClippingRedrawRegion = function(ctx, origin, renderRect) {
	origin.left = origin.left | 0;
	origin.top = origin.top | 0;
	var rgCount = 0;
	var scene = this.scenes.current;
	scene.step(this.fc);
	var rg;
	for(var i = 0, ll = this.redrawRegions.length; i < ll; i++){
		var rr = this.redrawRegions[i];
		if(rg = rr.getIntersectWith(renderRect)){
			var l = (rg.left | 0), t = (rg.top | 0), w = (rg.width | 0) , h = (rg.height | 0);
			ctx.save();
			ctx.beginPath();
			ctx.rect(l, t, w, h);
			ctx.clip();
			ctx.closePath();
			rgCount++;
			ctx.clearRect(l, t, w, h);
			scene.render(ctx, origin, new dream.geometry.Rect(l, t, w, h));
			ctx.restore();
			//console.log(rr+"");
		}
	}
	this.redrawRegions.clear();
	//if(rgCount) console.log(rgCount +" rerender regions." );
};

dream.Screen.prototype.paintWithBufferdRedrawRegion = function(ctx, rect, renderRect) {
	var rgCount = 0;
	
	var scene = this.scenes.current;
	scene.step();
		
	var rg;
	for(var i = 0, l = this.redrawRegions.length; i < l; i++){
		var rr = this.redrawRegions[i];
		if(rg = rr.getIntersectWith(renderRect)){
			var rb = this.rerenderBuffer;
			rb.canvas.width = rg.width;
			rb.canvas.height = rg.height;
			rgCount++;
			ctx.clearRect(rg.left, rg.top, rg.width, rg.height);
			scene.render(rb.context, new dream.geometry.Point(-rg.left, -rg.top), rg);
			ctx.drawImage(rb.canvas, 0, 0, rg.width, rg.height, rg.left, rg.top, rg.width, rg.height);
			//console.log(rr+"");
		}
	}
	this.redrawRegions.clear();
	//if(rgCount) console.log(rgCount +" rerender regions." );
};

dream.Screen.prototype.paint = dream.Screen.prototype.paintWithClippingRedrawRegion;
//dream.Screen.prototype.paint = dream.Screen.prototype.paintWithBufferdRedrawRegion;
//dream.Screen.prototype.paint = dream.Screen.prototype.paintWithoutRedrawRegion;

dream.Screen.prototype.checkHover = function (event){
	if( this.isHovered ){
		if(!this.hovered){
			this.hovered = this.scenes.current;
			dream.event.dispatch(this, "onMouseEnter", event);
		}
		this.hovered.checkHover(event.toLocal(this.hovered));
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
		if(this.scaleMode == dream.Screen.ScaleMode.SHOW_ALL){
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
		this.scenes.current.screenBoundary.width = this.width;
		this.scenes.current.screenBoundary.height = this.height;
		dream.event.dispatch(this.scenes.current, "onResize");
	}
	
	this.redrawRegions.add(new dream.geometry.Rect(0,0, screen.width, screen.height));

	dream.event.dispatch(this, "onResize");
};

dream.Screen.prototype.highlight = function(rect) {
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

dream.Screen.ScaleMode = {
	EXACT_FIT: 0,
	SHOW_ALL: 1,
	NO_BORDER: 2
};