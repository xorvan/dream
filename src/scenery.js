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
	
	this.drawDistanceX = 1;
	this.drawDistanceY = 1;
	
	this.areaChangeRate = .5;
	
	this.providers = new dream.util.ArrayList;
	this.providers.add(new dream.provider.StaticProvider(this.renderList), "static");
	
	this.assets = this.providers.static.assets;
	
	var scene = this;
	this.renderList.onAdd.add(function(a){
		scene.addToRect(a);
		
		a.isImageChanged = true;
		
		a.onBoundaryChange.add(function(){
			scene.addToRect(this);
		}, scene);
		
		if(!scene._isDirty)
			a.onImageChange.add(function(rects){
				scene.redrawRegions.addArray(rects);
			}, scene);
				
	});
	
	this.area = new dream.Rect;
	this.onResize.add(this.onBoundaryChange.add(function(){
		var area = scene.rect.transformation.unprojectRect(scene.screenBoundary).boundary.clone();
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
			console.log("Area changed!!");
			for(var i=0, p; p = scene.providers[i]; i++){
				p.area = area;
			}
			
			for(var i=0, o; o = scene.renderList[i]; i++){
				if(!o.boundary.hasIntersectWith(area)){
					scene.renderList.removeByIndex(i);
				}
			}
		}
	}));
	
	this.camera = new dream.scenery.Camera(this);
}.inherits(dream.visual.Composite);

dream.event.create(dream.scenery.Scene.prototype, "onResize");


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