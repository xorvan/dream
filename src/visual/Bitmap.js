(function() {

	/**
	 * @constructor
	 */
	var Bitmap = function(left, top, data) {
		Bitmap._superClass.call(this, left, top);
		
		if(data)
			if (data instanceof dream.behavior.Action){
				this.behavior.actions.add(this.behaviors.add(data, "main"));
			}else if(typeof data == "string"){
				this.texture = new dream.visual.Texture(data);
			}else if(data instanceof ImageData){
				var buff = new dream.util.BufferCanvas(data.width, data.height);
				buff.context.putImageData(data,0 ,0);
				this.texture = new dream.visual.Texture(buff.canvas);
			}else if(data instanceof dream.visual.Texture){
				this.texture = data;
			}else{
				this.behaviors.addJson(data);
			}
		
	}.inherits(dream.visual.Graphic);

	var Bitmap$ = Bitmap.prototype;

	Object.defineProperty(Bitmap$, "texture", {
		get : function() {
			return this._texture;
		},
		set : function(v) {
			if(v instanceof dream.visual.Texture){
				this._texture = v;
				if(v.img.isLoaded){
					if (this.rect.width != v.rect.width || this.rect.height != v.rect.height
							|| this.rect.left != -v.anchorX
							|| this.rect.top != -v.anchorY) {
						this.rect.width = v.rect.width;
						this.rect.height = v.rect.height;
						this.rect.left = -v.anchorX;
						this.rect.top = -v.anchorY;
						this.isBoundaryChanged = true;
					}
					this.isImageChanged = true;				
				}else{
					var self = this;
					v.img.onLoad.add(function(){
						self.rect.width = v.rect.width;
						self.rect.height = v.rect.height;
						self.rect.left = -v.anchorX;
						self.rect.top = -v.anchorY;
						self.isBoundaryChanged = true;
						self.isImageChanged = true;
					})
				}
			}
				
			}
	});

	Bitmap$.paint = function(ctx, origin, renderRect) {
		//TODO consider renderRect
		var f, content;
		if(f = this.texture)
			if(content = f.img.content){
				ctx.drawImage(content, f.rect.left, f.rect.top,
						f.rect.width, f.rect.height, (origin.left - f.anchorX),
						(origin.top - f.anchorY), f.rect.width, f.rect.height);
			}
		};
		
Object.defineProperty(Bitmap$, "requiredResources", {
	get : function () {
		var r = new dream.collection.List;
		if(this.texture &&  this.texture.img instanceof dream.static.Resource) r.add(this.texture.img)
		for(var i=0, sa; sa = this.behaviors[i]; i++){
			if (sa instanceof dream.behavior.decorator.Decorator){
				while(sa.action) sa = sa.action;
			}
		
			if (sa instanceof dream.behavior.animation.Sprite){
				for(var j = 0; j < sa.frames.length; j++ )
					r.add(new dream.static.Resource(sa.frames[j].url));
			}
		}
		return r;
	}
	
});

// exports
dream.visual.Bitmap = Bitmap;

})(window);
