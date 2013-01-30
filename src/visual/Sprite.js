(function() {

	/**
	 * @constructor
	 */
	var Sprite = function(left, top, data) {
		Sprite._superClass.call(this, left, top);
		
		if(data)
			if (data instanceof dream.dynamic.SpriteAnimation){
				this.dynamics.add(data, "main");
				this.dynamics.main.play();
			}else
				this.dynamics.addJson(data);
		
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
		var f, content;
		if(f = this.texture)
			if(content = this.texture.img.content)
				ctx.drawImage(content, f.rect.left, f.rect.top,
						f.rect.width, f.rect.height, (origin.left - f.anchorX) | 0,
						(origin.top - f.anchorY) | 0, f.rect.width, f.rect.height);
		};
		
Object.defineProperty($, "requiredResources", {
	get : function () {
		var r = new dream.collection.List;
		for(var i=0, sa; sa = this.dynamics[i]; i++)
			if (sa instanceof dream.dynamic.SpriteAnimation)
				for(var j = 0; j < sa.frames.length; j++ )
					r.add(new dream.static.Resource(sa.frames[j].url));
		return r;
		}
		
	
});
	// exports
	dream.visual.Sprite = Sprite;

})();
