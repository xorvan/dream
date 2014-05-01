/**
 * @constructor
 */
 (function(){



	var Composite = function(left, top){
		dream.visual.Composite._superClass.call(this, left, top);
		var composite = this;
		
		//this.rect = new dream.geometry.Rect(left, top);
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
				
				a.onBoundaryChange.add(composite.addToRect.bind(composite, a), composite);
				
				if(!composite._isDirty)
					a.onImageChange.add(composite.redrawRegions.addArray.bind(composite.redrawRegions), composite);
				
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

	var Composite$ = Composite.prototype;

	Object.defineProperty(Composite$, "isDirty", {
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

	Object.defineProperty(Composite$, "isPresent", {
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

	Composite$.addToRect = function(g){
		var vr = g.boundary;
		if(!this.rect.covers(vr)){
			this.rect = this.rect.add(vr);
			this.isBoundaryChanged = true;
		}
	};


	Composite$.step = function (fc){
		// console.log(fc, this.fc);
		if(this.fc == fc) return false;

		if (this.behavior) this.behavior.step();
		
		for(var i = 0, l = this.pool.length; i < l; i++){
			this.pool[i].step(fc);
		}

		dream.visual.Composite._superClass.prototype.step.call(this, fc, true);
		
		if(this._isDirty){
			dream.event.dispatch(this, "onImageChange", [this.boundary]);
		}else if(this.redrawRegions.length){
			dream.event.dispatch(this, "onImageChange", this.redrawRegions.map(function(r){return this.rect.transformation.projectRect(r).boundary;}, this) );
			this.redrawRegions.clear();
		}
		
	}; 

	Composite$.doRender = function(g, ctx, origin, renderRect){
		var origin;
		if(g.drawDistance !== undefined){
			ctx.save();
			origin = this.rect.transformation.getMultipliedInverse(g.drawDistance).apply(ctx, origin)
			g.render(ctx, origin, renderRect);
			ctx.restore();
		}else{
			g.render(ctx, origin, renderRect);
		}
	}

	Composite$.paint = function(ctx, origin, renderRect) {
		if(!renderRect || renderRect.covers(this.boundary)){
			for(var zi in this.renderList){
				var rl = this.renderList[zi];
				for(var i = 0, l = rl.length; i < l; i++){
					this.doRender(rl[i], ctx, origin, this.rect)
				}		
			}		
		}else{
			var ldr = this.rect.transformation.unprojectRect(renderRect).boundary;
			for(var zi in this.renderList){
				var rl = this.renderList[zi];
				for(var i = 0, l = rl.length; i < l; i++){
					var g = rl[i];
					if(g.boundary.hasIntersectWith(ldr)){
						this.doRender(g, ctx, origin, ldr);
					}
				}
			}		
		}
	};

	Composite$.checkHover = function(event){
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

	Object.defineProperty(Composite$, "requiredResources", {
		get : function () {
			return this.assets.requiredResources;
		}
	});

	Composite$.destroy = function(){
		this.pool.clear();		
	};


	Composite$.raiseMouseDown = dream.VisualAsset.prototype.raiseMouseDown;
	Composite$.raiseMouseUp = dream.VisualAsset.prototype.raiseMouseUp;
	Composite$.raiseMouseMove = dream.VisualAsset.prototype.raiseMouseMove;
	Composite$.raiseMouseLeave = dream.VisualAsset.prototype.raiseMouseLeave;
	Composite$.raiseDrag = dream.VisualAsset.prototype.raiseDrag;
	Composite$.raiseDragStop = dream.VisualAsset.prototype.raiseDragStop;

	//exports
	dream.visual.Composite = Composite;


 })();
