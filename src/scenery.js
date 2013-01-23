/**
 * 
 */
dream.scenery = {};

/**
 * @constructor
 */
dream.scenery.Scene = function(){
	dream.scenery.Scene._superClass.call(this);
	this.drawDistanceX = 0;
	this.drawDistanceY = 0;
	
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