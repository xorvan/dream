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
	
	
	this.loader = new dream.static.Loader();
	
	this.assets = new dream.util.AssetLibrary();
	
	this.assets.onAdd.add(function(o){
		o.__IS_PERSIST = true;
		scene.pool.add(o);
	});
	this.assets.onRemove.add(this.pool.remove.bind(this.pool));
	
	this.providers = new dream.collection.Dict;
	this.providers.onAdd.add(function(provider){
		provider.init(scene.pool);
	});
	
	this.pool.onAdd.add(function(a){
				
		scene.addToRect(a);
		
		a.isImageChanged = true;
		
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

dream.event.create(dream.scenery.Scene.prototype, "onResize");

dream.scenery.Scene.prototype.checkPresence = function(o){
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

Object.defineProperty(dream.scenery.Scene.prototype, "requiredResources", {
	get : function () {
		var r = this.assets.requiredResources;
		for(var i=0; i<this.providers.length; i++)
			r.addArray(this.providers[i].requiredResources);
		return r;
	}
});

dream.scenery.Scene.prototype.prepare = function(callBack){
	if(this.loader.isRequestSent){
		this.loader.abort();
	}
	this.loader.resources = this.requiredResources;
	this.loader.load(callBack);
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