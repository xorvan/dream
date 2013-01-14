/**
 * @constructor
 */
dream.visual.Composite = function(left, top){
	dream.visual.Composite._superClass.call(this, left, top);
	var composite = this;
	
	//this.rect = new dream.Rect(left, top);
	this._isDirty = false;
	this.assets = new dream.util.AssetLibrary();
	this.renderList = new dream.util.IndexedArrayList({"z": "onZChange"});
	
	this.redrawRegions = new dream.util.RedrawRegionList();
	
	this.assets.onAdd.add(function(a){
		if(a instanceof dream.visual.Graphic){
			
			composite.renderList.add(a);
			composite.addToRect(a);
			
			a.isImageChanged = true;
			
			a.onBoundaryChange.add(function(){
				composite.addToRect(this);
			}, composite);
			
			if(!composite._isDirty)
				a.onImageChange.add(function(rects){
					composite.redrawRegions.addArray(rects);
				}, composite);
					
		};
	});
	this.assets.onRemove.add(function(a){
		if(a instanceof dream.visual.Graphic){
			a.onBoundaryChange.removeByOwner(composite);
			a.onImageChange.removeByOwner(composite);
			composite.renderList.remove(a);
		}
	});
}.inherits(dream.visual.Graphic);

Object.defineProperty(dream.visual.Composite.prototype, "isDirty", {
	set: function(v){
		if(this._isDirty == v) return v;
		this._isDirty = v;
		if(v){
			for(var i=0, obj; obj = this.assets[i]; i++)
				obj.onImageChange.removeByOwner(this);
		}else{
			for(var i=0, obj; obj = this.assets[i]; i++)
				obj.onImageChange.add(function(rects){
					this.redrawRegions.addArray(rects);
				}, this);
		}
	},
	get : function () {
		return this._isDirty;
	}
});

dream.visual.Composite.prototype.addToRect = function(g){
	var vr = g.boundary;
	if(!this.rect.covers(vr)){
		this.rect = this.rect.add(vr);
		this.isBoundaryChanged = true;
	}
};


dream.visual.Composite.prototype.step = function (){
	dream.visual.Composite._superClass.prototype.step.call(this);
	
	this.renderList.forEach(function(g){
		g.step();
	});
	
	if(this._isDirty){
		dream.event.dispatch(this, "onImageChange", [this.boundary]);
	}else if(this.redrawRegions.length){
		dream.event.dispatch(this, "onImageChange", this.redrawRegions.map(function(r){return this.rect.transformation.projectRect(r).boundary;}, this) );
		this.redrawRegions.clear();
	}
	
}; 

dream.visual.Composite.prototype.drawImage = function(ctx, origin, drawRect) {
	var ldr;
	if(!drawRect || (ldr = this.rect.transformation.unprojectRect(drawRect).boundary, ldr.covers(this.rect))){
		for(var zi in this.renderList.index.z){
			this.renderList.index.z[zi].forEach(function(g){
				g.draw(ctx, origin, this.rect);
			});		
		}		
	}else{
		for(var zi in this.renderList.index.z){
			this.renderList.index.z[zi].forEach(function(g){
				if(g.boundary.hasIntersectWith(ldr)){
					g.draw(ctx, origin, ldr);
				}
			});		
		}		
	}
};

dream.visual.Composite.prototype.checkHover = function(p){
	if(p.isIn(this.boundary)){
		var pr = this.rect.transformation.unproject(p);
		
		var zs = [];
		for(var zi in this.renderList.index.z){
			zs.push(zi);
		}

		var l, z = this.renderList.index.z;
		while(l = z[zs.pop()])
			for(var i = l.length -1 , g; g = l[i]; i--){
				if(g.checkHover(pr)){
					if(this.hovered && this.hovered != g){
						dream.event.dispatch(this.hovered, "onMouseOut");
						this.hovered.isHovered = false;
					}
					this.hovered = g;
					if(!this.isHovered) dream.event.dispatch(this, "onMouseOver");
					this.isHovered = true;
					return true;
				}
			}
	}

	if(this.hovered){
		dream.event.dispatch(this.hovered, "onMouseOut");
		this.hovered.isHovered = false;
		this.hovered = null;
	}

	return false;
};

Object.defineProperty(dream.visual.Composite.prototype, "requiredResources", {
	get : function () {
		return this.assets.requiredResources;
	}
});

dream.visual.Composite.prototype.flat = function(){
	return new dream.visual.Bitmap(this.image, 0, 0, this.rect.width, this.rect.height);	
};


dream.visual.Composite.prototype.raiseMouseDown = dream.VisualAsset.prototype.raiseMouseDown;
dream.visual.Composite.prototype.raiseMouseUp = dream.VisualAsset.prototype.raiseMouseUp;
dream.visual.Composite.prototype.raiseMouseMove = dream.VisualAsset.prototype.raiseMouseMove;
dream.visual.Composite.prototype.raiseMouseOut = dream.VisualAsset.prototype.raiseMouseOut;
dream.visual.Composite.prototype.raiseDrag = dream.VisualAsset.prototype.raiseDrag;
dream.visual.Composite.prototype.raiseDragStop = dream.VisualAsset.prototype.raiseDragStop;
