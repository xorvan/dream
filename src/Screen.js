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

	this.planeSurfaces = [{ctx: this.canvas.getContext("2d"), canvas: this.canvas}];
	
	this.minWidth = minWidth || this.canvas.width;
	this.minHeight = minHeight || this.canvas.height;
	this.maxWidth = maxWidth || this.minWidth;
	this.maxHeight = maxHeight || this.minHeight;

	this.width = this.canvas.width;
	this.height = this.canvas.height;
	
	this.rect = new dream.geometry.Rect(0, 0, this.width, this.height, new dream.geometry.transform.Scale);
	
	this.rerenderBuffer = new dream.util.BufferCanvas(0, 0);
	
	this.input = new dream.input.InputHandler(this);
	this.scenes = new dream.collection.Selector;

	this.scenes.onSelect.add(function(scene){
		scene.screenBoundary.width = screen.width;
		scene.screenBoundary.height = screen.height;
		for(var pi in scene.planes){
			scene.planes[pi].ctx = screen.planeSurfaces[pi].ctx;
		}

		screen.hovered = null;


		for(var pi in scene.planes){
			scene.planes[pi].redrawRegions.add(new dream.geometry.Rect(0,0, screen.width, screen.height));
		}
		scene.onBoundaryChange.add(function(oldRect){
			for(var pi in scene.planes){
				scene.planes[pi].redrawRegions.add(new dream.geometry.Rect(0,0, this.viewport.width, this.viewport.height));
			}
		}, screen);
		
		scene.onImageChange.add(function(rects){
			// console.log("rects is ", rects);
			// screen.redrawRegions.addArray(rects/*.map(function(r){return r.clone();})*/);
		}, screen);

		scene.onCorrectPlane.add(function(old, neww){
			screen.planeSurfaces[neww] = screen.planeSurfaces[old];
			delete screen.planeSurfaces[old];
		});
		scene.onCreatePlane.add(function(planeIndex, zarr, top){
			var min = zarr[0];
			var max = min;
			for(var i=1; i<zarr.length; i++){
				if(zarr[i] >= max)
					max = zarr[i]
				if(zarr[i] <= min)
					min = zarr[i];
			}
			// console.log("got a create plane: ", planeIndex, zarr, min,max, top);
			var oldcanv = screen.planeSurfaces[planeIndex].canvas;
			var parent =  oldcanv.parentElement || oldcanv.parentNode;
			var canv = document.createElement("canvas");
			canv.width = screen.width;
			canv.height = screen.height;
			
			var ind = min;
			// check if separating plane is at the bottom of old plane, if so we change the index of it.
			if(planeIndex == ind){
				var zz = scene.planes[ind].z;
				for(var k=0; k < zz.length; k++){
					if(zz[k] > max){
						scene.planes[zz[k]] = scene.planes[ind];
						screen.planeSurfaces[zz[k]]=screen.planeSurfaces[ind];
						delete scene.planes[ind];
						delete screen.planeSurfaces[ind];
						break;
					}
				}
			}

			var surface = {canvas:canv, ctx: canv.getContext('2d')};
			screen.planeSurfaces[ind] = surface
			scene.planes[ind] = new dream.util.Plane(zarr);
			scene.planes[ind].ctx = surface.ctx;
			console.info("plane created: ", ind);
			
			var oldZ = oldcanv.style.zIndex * 1;
			canv.style.zIndex = top ? oldZ+ind:oldZ-ind;
				
			// position layers
			if(!screen.DIVstacked){
				var divstack = document.createElement("span");
				parent.appendChild(divstack);
				divstack.style.position = "relative";
				divstack.style.width = oldcanv.width;
				divstack.style.height = oldcanv.height;
				divstack.appendChild(oldcanv);
				divstack.appendChild(canv);
				oldcanv.style.position = "absolute";
				canv.style.position = "absolute";
				oldcanv.style.top = oldcanv.style.left = "0px";
				canv.style.top = canv.style.left = "0px";
				screen.DIVstacked = true;
			}else{
				//parent is div stack
				canv.style.position = "absolute";
				canv.style.top = canv.style.left = "0px";
				parent.appendChild(canv);
			}

			// remove from old plane
			for(var i in zarr){
				scene.planes[planeIndex].z.splice(scene.planes[planeIndex].z.indexOf(zarr[i]),1)
				scene.planes[planeIndex].perf.rgProfile.splice(scene.planes[planeIndex].perf.rgProfile.indexOf(zarr[i]),1)
			}

			//clean profiling of ols plane
			scene.planes[planeIndex].perf.rgCount = 0;
			scene.planes[planeIndex].perf.paintCount = 0;
			for(i in scene.planes[planeIndex].perf.rgProfile)
				scene.planes[planeIndex].perf.rgProfile[i] = 0;

			// add new redraw regon for all planes
			for(var pi in scene.planes){
				scene.planes[pi].redrawRegions.add(new dream.geometry.Rect(0,0, screen.width, screen.height));
			}

				
		})

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
		for(var pl in planes){
			delete planes[pl].ctx;
		}
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

var Screen$ = dream.Screen.prototype;

dream.event.create(dream.VisualAsset.prototype, "onResize");

Screen$.pause = function(){
	var craf = this.cancelRequestAnimationFrameFunction;
	craf(this._AFID);
	this.isdrawing = false;
};

Screen$.resume = function(){
	this.render();
};

Screen$.render = function(){		
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
	
	this.paint(new dream.geometry.Point, new dream.geometry.Rect(0,0, this.width, this.height));
	
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

Screen$.paintWithoutRedrawRegion = function(ctx, rect, renderRect) {
	var scene = this.scenes.current;
	scene.step();
	ctx.clearRect(0,0,renderRect.width, renderRect.height);
	scene.render(ctx, new dream.geometry.Point, renderRect);
};

Screen$.paintWithClippingRedrawRegion = function(origin, renderRect) {
	origin.left = origin.left | 0;
	origin.top = origin.top | 0;
	var rgCount = 0;
	var scene = this.scenes.current;
	var planes = scene.planes;
	var completeRender = false;
	if(renderRect.area == this.width * this.height) completeRender = true;
	scene.step(this.fc);
	var rg, lastIter , newPlane = false;;
	for(pi in planes){
		pl = planes[pi]
		// console.log("painting pi: ", pi, pl.redrawRegions.length);
		for(var i = 0, ll = pl.redrawRegions.length; i < ll; i++){
			var rr = pl.redrawRegions[i];
			if(completeRender) rg = rr;
			else{
				rg = rr.getIntersectWith(renderRect)
				if(!rg) continue
			}		
				var l = (rg.left | 0), t = (rg.top | 0), w = (rg.width | 0) , h = (rg.height | 0);
				pl.ctx.save();
				pl.ctx.beginPath();
				pl.ctx.rect(l, t, w, h);
				pl.ctx.clip();
				pl.ctx.closePath();
				pl.ctx.clearRect(l, t, w, h);
				scene.render(pl, origin, new dream.geometry.Rect(l, t, w, h));
				pl.ctx.restore();	
		}
		pl.redrawRegions.clear();
		scene.postPlaneRender(pl);
	}
	scene.postRender();

};

Screen$.paintWithBufferdRedrawRegion = function(ctx, rect, renderRect) {
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

Screen$.paint = Screen$.paintWithClippingRedrawRegion;
//Screen$.paint = Screen$.paintWithBufferdRedrawRegion;
//Screen$.paint = Screen$.paintWithoutRedrawRegion;

Screen$.checkHover = function (event){
	if( this.isHovered ){
		if(!this.hovered){
			this.hovered = this.scenes.current;
			dream.event.dispatch(this, "onMouseEnter", event);
		}
		this.hovered.checkHover(event.toLocal(this.hovered));
	}
};

Screen$.updateSize = function() {
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
		var scene = this.scenes.current
		this.scenes.current.screenBoundary.width = this.width;
		this.scenes.current.screenBoundary.height = this.height;

		for(var pl in scene.planes){
			scene.planes[pl].redrawRegions.add(new dream.geometry.Rect(0,0, screen.width, screen.height));
		}
		dream.event.dispatch(this.scenes.current, "onResize");
	}

	dream.event.dispatch(this, "onResize");
};

Screen$.highlight = function(rect) {
	this.planes[0].ctx.strokeStyle = "#f00";this.planes[0].ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
};

Object.defineProperty(Screen$, "frameRate", {
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