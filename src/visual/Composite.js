/**
 * @constructor
 */
dream.visual.Composite = function(left, top){
	dream.visual.Composite._superClass.call(this, left, top);
	var composite = this;
	
	this.actuallRect = new dream.Rect(left, top);
	
	var checkActuallRect = function(g){
		var vr = g.viewRect.clone();
		vr.left += composite.rect.left;
		vr.top += composite.rect.top;
		if(!composite.actuallRect.covers(vr)){
			composite.actuallRect = composite.actuallRect.add(vr);
			composite.calcBoundary();
		}
	};

	this.assets = new dream.util.AssetLibrary();
	this.renderList = new dream.util.IndexedArrayList({"z": "onZChange"});
	
	this.redrawRegions = new dream.util.RedrawRegionList();
	
	this.assets.onAdd.add(function(a){
		if(a instanceof dream.visual.Graphic){
			
			composite.renderList.add(a);
			checkActuallRect(a);
			a.isImageChanged = true;
			composite.calcBoundary();
			
			a.onViewRectChange.add(function(){
				checkActuallRect(this);
			}, composite);
			
			a.onImageChange.add(function(rects){
				composite.redrawRegions.addArray(rects);
			}, composite);
					
		};
	});
	this.assets.onRemove.add(function(a){
		if(a instanceof dream.visual.Graphic){
			a.onViewRectChange.removeByOwner(composite);
			a.onImageChange.removeByOwner(composite);
			composite.renderList.remove(a);
		}
	});
}.inherits(dream.visual.Graphic);

dream.visual.Composite.prototype.step = function (){
	this.renderList.forEach(function(g){
		g.step();
	});
	
	if(this.redrawRegions.length){
		dream.event.dispatch(this, "onImageChange", this.redrawRegions.map(this.translateOutRect, this) );
		this.redrawRegions.clear();
	}
	
	dream.visual.Composite._superClass.prototype.step.call(this);
}; 

dream.visual.Composite.prototype.drawImage = function(ctx, rect, drawRect) {
	for(var zi in scene.renderList.index.z){
		this.renderList.index.z[zi].forEach(function(g){
			if(g.viewRect.hasIntersectWith(drawRect))
				g.draw(ctx, new dream.Rect(rect.left + g.rect.left, rect.top + g.rect.top, g.rect.width, g.rect.height), g.translateInRect(drawRect));
		});		
	} 
};

dream.visual.Composite.prototype.translateOutRect = function(rect){
	
	if(this.rotation){
		var c = Math.cos(this.r * -1);
		var s = Math.sin(this.r * -1);
	
		var x = rect.left - this.anchorX;
		var y = rect.top - this.anchorY;
	
		var x1 = rect.right - this.anchorX;
		var y1 = rect.bottom - this.anchorY;
	
		var tps = [
		          new dream.Point((this.rect.left + (x * c + y * s)  * this.scaleX) | 0, (this.rect.top +  (y * c - x * s) * this.scaleY) | 0),
		          new dream.Point((this.rect.left + (x1 * c + y * s)  * this.scaleX) | 0, (this.rect.top +  (y * c - x1 * s) * this.scaleY) | 0),
		          new dream.Point((this.rect.left + (x * c + y1 * s)  * this.scaleX) | 0, (this.rect.top +  (y1 * c - x * s) * this.scaleY) | 0),
		          new dream.Point((this.rect.left + (x1 * c + y1 * s)  * this.scaleX) | 0, (this.rect.top +  (y1 * c - x1 * s) * this.scaleY) | 0),
		          ];
		
		var tp = tps[0].clone();
		var tp1 = tps[0].clone();
		for ( var i = 0; i < 4; i++) {
			if (tps[i].left < tp.left)
				tp.left = tps[i].left;
			if (tps[i].left > tp1.left)
				tp1.left = tps[i].left;
			if (tps[i].top < tp.top)
				tp.top = tps[i].top;
			if (tps[i].top > tp1.top)
				tp1.top = tps[i].top;
		}
		
		return new dream.Rect(tp.left, tp.top, tp1.left - tp.left, tp1.top - tp.top);
	}else if(this.scale != 1){
		return new dream.Rect(this.rect.left +((rect.left - this.anchorX) * this.scaleX) | 0, this.rect.top +((rect.top - this.anchorY) * this.scaleY) | 0, (rect.width * this.scaleX) | 0, (rect.height * this.scaleY) | 0);
	}else{
		return new dream.Rect(this.rect.left + rect.left - this.anchorX, this.rect.top + rect.top - this.anchorY, rect.width, rect.height);
	}
};

dream.visual.Composite.prototype.translateOut = function(p){
	var x = p.left - this.anchorX;
	var y = p.top - this.anchorY;
	
	var c = Math.cos(this.r * -1);
	var s = Math.sin(this.r * -1);
	var r = p.clone();
	r.left = (this.rect.left + (x * c + y * s)  * this.scaleX) | 0;
	r.top = (this.rect.top +  (y * c - x * s) * this.scaleY) | 0;
	return r;
};

//TODO: Select One Implementation
dream.visual.Composite.prototype.translateOutRectOld = function(rect){
	var tps = [
	          this.translateOut(new dream.Point(rect.left, rect.top)),
	          this.translateOut(new dream.Point(rect.right, rect.top)),
	          this.translateOut(new dream.Point(rect.left, rect.bottom)),
	          this.translateOut(new dream.Point(rect.right, rect.bottom))
	          ];
	
	var tp = tps[0].clone();
	var tp1 = tps[0].clone();
	for ( var i = 0; i < 4; i++) {
		if (tps[i].left < tp.left)
			tp.left = tps[i].left;
		if (tps[i].left > tp1.left)
			tp1.left = tps[i].left;
		if (tps[i].top < tp.top)
			tp.top = tps[i].top;
		if (tps[i].top > tp1.top)
			tp1.top = tps[i].top;
	}
	
	return new dream.Rect(tp.left, tp.top, tp1.left - tp.left, tp1.top - tp.top);
};

dream.visual.Composite.prototype.checkHover = function (p){
	if(p.isIn(this.viewRect)){
		var pr = this.translateIn(p);
		for(var i = this.renderList.length -1 , g; g = this.renderList[i]; i--){
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


dream.visual.Composite.prototype.raiseMouseDown = dream.VisualAsset.prototype.raiseMouseDown;
dream.visual.Composite.prototype.raiseMouseUp = dream.VisualAsset.prototype.raiseMouseUp;
dream.visual.Composite.prototype.raiseMouseMove = dream.VisualAsset.prototype.raiseMouseMove;
dream.visual.Composite.prototype.raiseMouseOut = dream.VisualAsset.prototype.raiseMouseOut;
dream.visual.Composite.prototype.raiseDrag = dream.VisualAsset.prototype.raiseDrag;
dream.visual.Composite.prototype.raiseDragStop = dream.VisualAsset.prototype.raiseDragStop;
