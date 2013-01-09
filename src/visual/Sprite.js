(function() {

	/**
	 * @constructor
	 */
	var Sprite = function(left, top, data) {
		Sprite._superClass.call(this, left, top);
		
		if(data)
			if (data instanceof dream.visual.animation.SpriteAnimation){
				this.animations.add(data, "main");
				this.animations.main.play();
			}else
				this.animations.addJson(data);
		
	}.inherits(dream.visual.Graphic);

	var $ = Sprite.prototype;

	Object.defineProperty($, "texture", {
		get : function() {
			return this._texture;
		},
		set : function(v) {
			if (this.rect.width != v.rect.width || this.rect.height != v.rect.height
					|| this.rect.left != -v.anchorX
					|| this.rect.top != -v.anchorY) {
				this.rect.width = v.rect.width;
				this.rect.height = v.rect.height;
				this.rect.left = -v.anchorX;
				this.rect.top = -v.anchorY;
				this.isBoundaryChanged = true;
			}
			this._texture = v;
			this.isImageChanged = true;
		}
	});

	$.drawImage = function(ctx, origin) {
		var f;
		if(f = this.texture)
		ctx.drawImage(dream.preload.cache[f.img].content, f.rect.left, f.rect.top,
				f.rect.width, f.rect.height, (origin.left - f.anchorX) | 0,
				(origin.top - f.anchorY) | 0, f.rect.width, f.rect.height);
		};

	 Object.defineProperty($, "requiredResources", {
	 get : function () {
	 var r = new dream.util.ArrayList;
	 for(var i=0, fs; fs = this.animations[i]; i++){
	 if(fs instanceof dream.visual.animation.SpriteAnimation)
		 for (var j = 0; j < fs.frames.length; j++)
		 r.add(new dream.preload.ImageResource(fs.frames[j].img));
	 }
	 return r;
	 }
	 });

	// exports
	dream.visual.Sprite = Sprite;

})();
