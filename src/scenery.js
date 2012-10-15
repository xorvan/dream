/**
 * 
 */
dream.scenery = {};

/**
 * @constructor
 */
dream.scenery.Scene = function(){
	var scene = this;
	this.assets = new dream.scenery.AssetLibrary();
	this.assets.onAdd.add(function(obj){
		obj.scene = scene;
		if(obj instanceof dream.visual.Graphic) scene.renderList.add(obj);
	});
	
	/**
	 * @private
	 */
	this.renderList = new dream.util.ArrayList();
	
	this.redrawRegions = new dream.scenery.RedrawRegionList();
	this.redrawBuffer = new dream.util.BufferCanvas(0, 0);
};

dream.scenery.Scene.prototype.drawImage = function(ctx, rect) {
	var scene = this;
	var redrawCount = 0;
	var rgCount = 0;
	
	scene.renderList.items.forEach(function(g){
		g.step();
	});
	
	this.redrawRegions.items.forEach(function(rg){
		var rb = scene.redrawBuffer;
		rb.canvas.width = rg.width;
		rb.canvas.height = rg.height;		
		if(rg.hasIntersectWith(rect)){
			rgCount++;
			scene.renderList.items.forEach(function(g){
				if(rg.hasIntersectWith(g.rect)){
					g.draw(rb.context, new dream.Rect(g.rect.left - rg.left, g.rect.top - rg.top, g.rect.width, g.rect.height));
					redrawCount++;
				}
			});
			ctx.clearRect(rg.left, rg.top, rg.width, rg.height);
			ctx.drawImage(rb.canvas, 0, 0, rg.width, rg.height, rg.left, rg.top, rg.width, rg.height);
		}
		
	});
	scene.redrawRegions.clear();
	if(redrawCount) console.log(redrawCount + " objects has been redrawned in "+rgCount +" redraw regions." );
};

/**
 * @constructor
 */
dream.scenery.Asset = function(){	
	this.requiredResources = [];
};

/**
 * @constructor
 */
dream.scenery.AssetLibrary = function(){
	dream.scenery.AssetLibrary._superClass.call(this);
	
	this.loader = new dream.preload.Loader();
}.inherits(dream.util.ArrayList);

dream.scenery.AssetLibrary.prototype.prepare = function(callBack){ 	
	if(callBack) 
		this.loader.onLoad.add(function(){
			callBack();
			//remove
		});

	this.loader.load(this.requiredResources);
};

Object.defineProperty(dream.scenery.AssetLibrary.prototype, "requiredResources", {
	get : function () {
		var r = [];
		for(var i=0,asset; asset=this.items[i]; i++ )
			r = r.concat(asset.requiredResources);
		return r;
	}
});

dream.scenery.RedrawRegionList = function(){
	dream.util.ArrayList.call(this);
}.inherits(dream.util.ArrayList);

dream.scenery.RedrawRegionList.prototype.add = function(rect){
	var list = this;
	for(var i = 0, r; r = this.items[i]; i++){
		if(rect.hasIntersectWith(r)){
			return list.replace(r, r.add(rect));
		}
	}
	return dream.scenery.RedrawRegionList._superClass.prototype.add.call(this, rect);
};