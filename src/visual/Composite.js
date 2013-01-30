/**
 * @constructor
 */
dream.visual.Composite = function(left, top){
	dream.visual.Composite._superClass.call(this, left, top);
	var composite = this;
	
	//this.rect = new dream.Rect(left, top);
	this._isDirty = false;
	this._isPresent = false;
	this.assets = new dream.util.AssetLibrary();
	this.renderList = [];
	this.pool = new dream.collection.Set;
	
	this.redrawRegions = new dream.util.RedrawRegionList();
	
	this.assets.onAdd.add(function(a){
		if(a instanceof dream.visual.Graphic){
			
			composite.pool.add(a);
			var z = a.z;
			(composite.renderList[z] || (composite.renderList[z] = [])).push(a);
			a.onZChange.add(function(oldZ){
				var ol = composite.renderList[oldZ];
				ol.splice(ol.indexOf(this), 1);
				(composite.renderList[this.z] || (composite.renderList[this.z] = [])).push(this);
			}, this);
			
			
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
			a.onZChange.removeByOwner(composite);
			composite.renderList[a.z].splice(composite.renderList[a.z].indexOf(a),1);
			composite.pool.remove(a);
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

Object.defineProperty(dream.visual.Composite.prototype, "isPresent", {
	set: function(v){
		if(this._isPresent == v) return v;
		this._isPresent = v;
		for(var i=0, obj; obj = this.pool[i]; i++)
			obj.isPresent = v;
	},
	get : function () {
		return this._isPresent;
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
	
	this.pool.forEach(function(g){
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
		for(var zi in this.renderList){
			this.renderList[zi].forEach(function(g){
				g.draw(ctx, origin, this.rect);
			});		
		}		
	}else{
		for(var zi in this.renderList){
			this.renderList[zi].forEach(function(g){
				if(g.boundary.hasIntersectWith(ldr)){
					g.draw(ctx, origin, ldr);
				}
			});		
		}		
	}
};

dream.visual.Composite.prototype.checkHover = function(event){
	if(event.position.isIn(this.boundary)){
		
		var zs = [];
		for(var zi in this.renderList){
			zs.push(zi);
		}

		var l, z = this.renderList;
		while(l = z[zs.pop()])
			for(var i = l.length -1 , g; g = l[i]; i--){
				if(g.checkHover(event.toLocal(g))){
					if(this.hovered && this.hovered != g){
						this.hovered.raiseMouseLeave(event);
					}
					this.hovered = g;
					event.restore();
					if(!this.isHovered) dream.event.dispatch(this, "onMouseEnter", event);
					this.isHovered = true;
					return true;
				}else{
					event.restore();
				}
				
			}
	}
	if(this.hovered){
		this.hovered.raiseMouseLeave(event.toLocal(this.hovered));
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
dream.visual.Composite.prototype.raiseMouseLeave = dream.VisualAsset.prototype.raiseMouseLeave;
dream.visual.Composite.prototype.raiseDrag = dream.VisualAsset.prototype.raiseDrag;
dream.visual.Composite.prototype.raiseDragStop = dream.VisualAsset.prototype.raiseDragStop;
