/**
 * 
 */
dream.scenery = {};

/**
 * @constructor
 */
dream.scenery.Scene = function(){
	dream.scenery.Scene._superClass.call(this);
	var scene = this;
	
	this.screenBoundary = new dream.geometry.Rect; 
	this.viewport = new dream.geometry.Rect; 
	
	this.renderDistanceX = 1;
	this.renderDistanceY = 1;
	
	this.areaChangeRate = .5;
	
	this.planes = [new dream.util.Plane()];

	this.postRenderQueue = [];

	this.loader = new dream.static.Loader();
	
	this.assets = new dream.util.AssetLibrary();

	this.config={};
	this.config.autoLayering = true;
	this.config.autoLayeringThreshold = 10000;

	var scene = this;
	
	this.assets.onAdd.add(function(a){
		a.__IS_PERSIST = true;
		scene.pool.add(a);
	});
	this.assets.onRemove.add(this.pool.remove.bind(this.pool));
	
	this.providers = new dream.collection.Dict;
	this.providers.onAdd.add(function(provider){
		provider.init(scene.pool);
	});
	
	this.pool.onAdd.add(function(a){
				
		scene.addToRect(a);
		// add proper z to planes
		var z = a.z || 0;
		var zPlaneExist = false
		for(var pi in scene.planes){
			var pl = scene.planes[pi];
			if(~pl.z.indexOf(z)){
				var zPlaneExist = true;
			}
		}
		if(!zPlaneExist){
			scene.planes[0].z.push(z);
		}
		a.isImageChanged = true;

		a.onImageChange.add(function(arr){
			var z = a.z || 0;
			for(var pi in scene.planes){
				var pl = scene.planes[pi];
				if(~pl.z.indexOf(z)){
					pl.redrawRegions.addArray(arr)
				}
			}
		})
		
		a.onBoundaryChange.add(function(){
			scene.addToRect(this);
			scene.checkPresence(this);
		}, scene);
		
		if(!scene._isDirty)
			a.onImageChange.add(function(rects){
				scene.redrawRegions.addArray(rects);
			}, scene);
	});
	
	
	this.pool.onRemove.add(function(o){
		o.onBoundaryChange.removeByOwner(scene);
		o.onImageChange.removeByOwner(scene);
		o.onZChange.removeByOwner(scene);
		o.isPresent = false;
		if(o.isPresent) scene.renderList[o.z].splice(scene.renderList[o.z].indexOf(o),1);
	});
	
	this.area = new dream.geometry.Rect;
	this.onResize.add(this.onBoundaryChange.add(function(){
		scene.viewport = scene.rect.transformation.unprojectRect(scene.screenBoundary).boundary;
		if(scene.viewport.width == 0 && scene.viewport.height == 0) this.pool.clear();
		var area = scene.viewport.clone();
		var vpw = area.width;
		var vph = area.height;
		area.left -= area.width * scene.renderDistanceX;
		area.top -= area.height * scene.renderDistanceY;
		area.width += area.width * 2 * scene.renderDistanceX;
		area.height += area.height * 2 * scene.renderDistanceY;
		var intersection = scene.area.getIntersectWith(area);
		if(area.width - intersection.width > vpw * scene.renderDistanceX * scene.areaChangeRate ||  
				area.height - intersection.height > vph * scene.renderDistanceY * scene.areaChangeRate){
			
			scene.area = area;
			
			if(this.providers.length){
				for(var i=0; i<scene.pool.length; i++){
					var o = scene.pool[i];
					if(!o.__IS_PERSIST && !o.boundary.hasIntersectWith(area)){
						scene.pool.removeByIndex(i);
						i--;
					}
				}
				
				for(var i=0, p; p = scene.providers[i]; i++){
					p.area = area;
				}				
			}
			
		}
		
		for(var i = 0, o; o = scene.pool[i]; i++ ){
			scene.checkPresence(o);

		}

	}));
	
	this.camera = new dream.scenery.Camera(this);
}.inherits(dream.visual.Composite);

var Scene$ = dream.scenery.Scene.prototype;

dream.event.create(Scene$, "onResize");
dream.event.create(Scene$, "onCreatePlane");
dream.event.create(Scene$, "onCorrectPlane");

Scene$.checkPresence = function(o){
	var scene = this;
	if(!o.isPresent && scene.viewport.hasIntersectWith(o.boundary)){
		o.isPresent = true;
		var z = o.z;
		(scene.renderList[z] || (scene.renderList[z] = [])).push(o);
		o.onZChange.add(function(oldZ){
			var ol = scene.renderList[oldZ];
			ol.splice(ol.indexOf(this), 1);
			(scene.renderList[this.z] || (scene.renderList[this.z] = [])).push(this);
		}, scene);

	}else if(o.isPresent && !scene.viewport.hasIntersectWith(o.boundary)){
		o.isPresent = false;
		scene.renderList[o.z].splice(scene.renderList[o.z].indexOf(o),1);
		o.onZChange.removeByOwner(scene);
	}
};

Object.defineProperty(Scene$, "requiredResources", {
	get : function () {
		var r = this.assets.requiredResources;
		for(var i=0; i<this.providers.length; i++)
			r.addArray(this.providers[i].requiredResources);
		return r;
	}
});

Scene$.prepare = function(callBack){
	if(this.loader.isRequestSent){
		this.loader.abort();
	}
	this.loader.resources = this.requiredResources;
	this.loader.load(callBack);
};



Scene$.paint = function(plane, origin, renderRect){
	var pp = plane.perf;
	// console.log("plane is ", plane)
	if(!renderRect || renderRect.covers(this.boundary)){
		for(var zi in this.renderList){
			// console.log("plane and z check", plane, zi);
			if(!~plane.z.indexOf(zi*1)) continue;
			// console.log("plane and z", plane, zi);
			var rl = this.renderList[zi];
			for(var i = 0, l = rl.length; i < l; i++){
				this.doRender(rl[i], plane.ctx, origin, this.rect)
			}		
		}		
	}else{
		var ldr = this.rect.transformation.unprojectRect(renderRect).boundary;
		for(var zi in this.renderList){
			// console.log("checking" , plane.z, zi , plane.z.indexOf(zi));
			if(!~plane.z.indexOf(zi*1)) continue;
			var rl = this.renderList[zi];
			for(var i = 0, l = rl.length; i < l; i++){
				var g = rl[i];
				if(g.boundary.hasIntersectWith(ldr)){
					// profiling
					pp.rgCount ++;
					if(isNaN(pp.rgProfile[zi])) 
						pp.rgProfile[zi]=0;
					pp.rgProfile[zi] += 1;
					
					this.doRender(g, plane.ctx, origin, ldr);
				}
			}
		}
		pp.paintCount ++;
		// console.log("ppaint ", plane.z, pp.paintCount);

		// take useful data out of profiling
		if(pp.paintCount >= 60){
			var maxrg = 0;
			var maxrgIndex
			var layers = 0;
			for(var i in pp.rgProfile){
				pp.rgProfile[i] = (pp.rgProfile[i]*100/pp.rgCount) | 0;
				if(pp.rgProfile[i] > 0){
					layers++;
					if(pp.rgProfile[i] > maxrg){
						maxrg = pp.rgProfile[i];
						maxrgIndex = i*1;
						
					}
				}
			}
			// now the aftermath makes the decision
			// console.log("the aftermath of profiling: layers, maxrg, maxrgIndex, rgcount", layers, maxrg, maxrgIndex, pp.rgCount)
			// if(this.config.autoLayering && layers > 1 && maxrg > 20 && pp.rgCount > this.config.autoLayeringThreshold){
			if(this.config.autoLayering && layers > 1 && maxrg > 20 && pp.rgCount > 1000){
				this.postRenderQueue.push(function(){
					this.addPlane([maxrgIndex]);
				})
				
			}

			// console.log("total count of rr for plane: ",plane.z, pp.rgCount);	
			// console.log("z profle for plane: ", plane.z, pp.rgProfile);


			// cleanup
			for(var jj=0; jj < pp.rgProfile.length; jj++){
				pp.rgProfile[jj] = 0;
			}
			pp.paintCount = 0
			pp.rgCount = 0;
		}
			
	}
};

Scene$.postRender = function(){
	for(var i=0;i < this.postRenderQueue.length; i++){
		this.postRenderQueue[i].call(this);
	}
	this.postRenderQueue = [];
}


Scene$.addPlane = function(zarray){
	var scene = this;
	var min = zarray[0];
	var max = min;
	for(var i=1; i<zarray.length; i++){
		if(zarray[i] >= max){
			max = zarray[i]
		}
		if(zarray[i] <= min){
			min = zarray[i];
		}
	}
	var planeIndex = null;
	var hasPlane = false;
	var greaters = [];
	var lessers = [];
	for(var pi in scene.planes){
		var pl = scene.planes[pi];
		if(~pl.z.indexOf(min) && ~pl.z.indexOf(max)){
			hasPlane = true;
			planeIndex = pi * 1;
			console.log("z and pl.z is ", min, max , pl.z);
			for(var j in pl.z){
				if(pl.z[j] > max){
					greaters.push(pl.z[j]);
				}else if(pl.z[j] < min){
					lessers.push(pl.z[j]);
				}
			}
		}
	}
	if(!hasPlane){
		console.error("no common plane for input array");
		return false;
	}
	// //correct index of planeIndex if not correct specially in 0 plane
	// var zzz = scene.planes[planeIndex].z;
	// var correctIndex = zzz[0]
	// for(var kk=0; kk<zzz.length;kk++){
	// 	if(zzz[kk] < correctIndex)
	// 		correctIndex = zzz[kk]

	// }
	// if(correctIndex != planeIndex){
	// 	scene.planes[correctIndex] = scene.planes[planeIndex];
	// 	delete scene.planes[planeIndex];
	// 	dream.event.dispatch(scene, "onCorrectPlane", planeIndex, correctIndex);
	// 	planeIndex = correctIndex;
	// }

	// console.info("addplane result ", planeIndex, lessers, greaters );
	if(greaters.length){
		dream.event.dispatch(scene, "onCreatePlane", planeIndex, greaters, top);
	}
	if(lessers.length){
		dream.event.dispatch(scene, "onCreatePlane", planeIndex, lessers);
	}
};

/**
 * @constructor
 */
dream.scenery.Camera = function(scene){
	this.scene = scene;
	
}.inherits(dream.geometry.Rect);

Object.defineProperty(dream.scenery.Camera.prototype, "left", {
	set : function(v){this.scene.anchorX = v;},
	get : function(){ return this.scene.anchorX;}
});

Object.defineProperty(dream.scenery.Camera.prototype, "top", {
	set : function(v){this.scene.anchorY = v;},
	get : function(){ return this.scene.anchorY;}
});

Object.defineProperty(dream.scenery.Camera.prototype, "width", {
	get : function(){ return this.scene.width;}
});

Object.defineProperty(dream.scenery.Camera.prototype, "height", {
	get : function(){ return this.scene.height;}
});

Object.defineProperty(dream.scenery.Camera.prototype, "scale", {
	set : function(v){this.scene.scale = v;},
	get : function(){ return this.scene.scale;}
});

Object.defineProperty(dream.scenery.Camera.prototype, "rotation", {
	set : function(v){this.scene.rotation = v * -1;},
	get : function(){ return this.scene.rotation * -1;}
});