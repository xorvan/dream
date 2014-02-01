/**
 * @constructor
 */
 (function(){



	var Mirror = function(left, top, source){
		Mirror._superClass.call(this, left, top);
		var self = this;
		this.source = source;
	
				
		this.isImageChanged = true;
		
		source.onBoundaryChange.add(function(){
			self.rect.left = source.boundary.left;
			self.rect.top = source.boundary.top;
			self.rect.width = source.boundary.width;
			self.rect.height = source.boundary.height;
			self.isBoundaryChanged = true;
		});
		
		source.onImageChange.add(function(){
			self.isImageChanged = true;
		});
				
	}.inherits(dream.visual.Graphic);

	var Mirror$ = Mirror.prototype;

	Mirror$.step = function (fc){
		if(this.fc == fc) return false;

		if (this.behavior) this.behavior.step();
		
		this.source.step(fc);

		Mirror._superClass.prototype.step.call(this, fc, true);
	}; 

	Mirror$.paint = function(ctx, origin, renderRect) {
		this.source.render(ctx, origin, renderRect);
	};

	Object.defineProperty(Mirror$, "requiredResources", {
		get : function () {
			return this.source.requiredResources;
		}
	});


	// Composite$.raiseMouseDown = dream.VisualAsset.prototype.raiseMouseDown;
	// Composite$.raiseMouseUp = dream.VisualAsset.prototype.raiseMouseUp;
	// Composite$.raiseMouseMove = dream.VisualAsset.prototype.raiseMouseMove;
	// Composite$.raiseMouseLeave = dream.VisualAsset.prototype.raiseMouseLeave;
	// Composite$.raiseDrag = dream.VisualAsset.prototype.raiseDrag;
	// Composite$.raiseDragStop = dream.VisualAsset.prototype.raiseDragStop;

	//exports
	dream.visual.Mirror = Mirror;


 })();
