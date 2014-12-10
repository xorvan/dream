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
				this.texture = new dream.static.Resource(data);//new dream.visual.Texture(data);
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

	Bitmap$.resetBoundary = function(){
		var v = this._texture;
		if(!v) return false;
		this.rect.width = v.rect.width;
		this.rect.height = v.rect.height;
		this.rect.left = -v.anchorX;
		this.rect.top = -v.anchorY;

		Bitmap._superClass.prototype.resetBoundary.call(this);
	}

	Object.defineProperty(Bitmap$, "texture", {
		get : function() {
			return this._texture;
		},
		set : function(v) {
			console.log("setting ttt", v)
			if(v instanceof dream.visual.Texture){
				this._texture = v;

				if(v.img.isLoaded){
					if (this.rect.width != v.rect.width || this.rect.height != v.rect.height
							|| this.rect.left != -v.anchorX
							|| this.rect.top != -v.anchorY) {
						this.isBoundaryChanged = true;
					}
					this.isImageChanged = true;
					this.resetBoundary();
				}else{
					var self = this;
					v.img.onLoad.add(function(){
						self.isBoundaryChanged = true;
						self.isImageChanged = true;
						this.resetBoundary();
					})
				}
			}else if(v instanceof dream.static.Resource){
				if(v.isLoaded){
					this.texture = v.content;
				}else{
					var self = this;
					v.onLoad.add(function(){
						self.texture = v.content;
					})
					// v.load();
					this._reqRes = v;
				}

			}else if(v){
				this.texture = new dream.visual.Texture(v);
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
		var r = new dream.collection.Set;
		if(this.texture &&  this.texture.img instanceof dream.static.Resource) r.add(this.texture.img)
		if(this._reqRes) r.add(this._reqRes)
		for(var i=0, sa; sa = this.behaviors[i]; i++){
			if (sa instanceof dream.behavior.decorator.Decorator){
				while(sa.action) sa = sa.action;
			}

			if (sa instanceof dream.behavior.animation.Sprite){
				if(sa.sheetUri){
					r.add(new dream.static.Resource(sa.sheetUri));
				}else{
					for(var j = 0; j < sa.frames.length; j++ )
						r.add(new dream.static.Resource(sa.frames[j].url));
				}
			}
		}
		return r;
	}

});

// exports
dream.visual.Bitmap = Bitmap;

})(window);
