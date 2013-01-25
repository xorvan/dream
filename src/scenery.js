/**
 * 
 */
dream.scenery = {};

/**
 * @constructor
 */
dream.scenery.Scene = function(){
	dream.scenery.Scene._superClass.call(this);
	
	this.screenBoundary = new dream.Rect; 
	this.viewport = new dream.Rect; 
	
	this.drawDistanceX = 1;
	this.drawDistanceY = 1;
	
	this.areaChangeRate = .5;
	
	this.providers = new dream.util.ArrayList;
	this.providers.add(new dream.provider.StaticProvider(this.pool), "static");
	
	this.assets = this.providers.static.assets;
	
	var scene = this;
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
		if(o.isPresent) scene.renderList[o.z].splice(scene.renderList[o.z].indexOf(o),1);
	});
	
	this.area = new dream.Rect;
	this.onResize.add(this.onBoundaryChange.add(function(){
		scene.viewport = scene.rect.transformation.unprojectRect(scene.screenBoundary).boundary;
		var area = scene.viewport.clone();
		var vpw = area.width;
		var vph = area.height;
		area.left -= area.width * scene.drawDistanceX;
		area.top -= area.height * scene.drawDistanceY;
		area.width += area.width * 2 * scene.drawDistanceX;
		area.height += area.height * 2 * scene.drawDistanceY;
		var intersection = scene.area.getIntersectWith(area);
		if(area.width - intersection.width > vpw * scene.drawDistanceX * scene.areaChangeRate ||  
				area.height - intersection.height > vph * scene.drawDistanceY * scene.areaChangeRate){
			
			scene.area = area;

			for(var i=0, o; o = scene.pool[i]; i++){
				if(!o.boundary.hasIntersectWith(area)){
					scene.pool.removeByIndex(i);
				}
			}
			
			console.log("Area changed!!");
			for(var i=0, p; p = scene.providers[i]; i++){
				p.area = area;
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


/**
 * @constructor
 */
dream.scenery.Camera = function(scene){
	this.scene = scene;
	
}.inherits(dream.Rect);

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