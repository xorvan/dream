(function (){
	
var Bitmap = function(img, left, top, width, height){
	dream.visual.Bitmap._superClass.call(this, left, top);
	this._width = width;
	this._height = height;
	this.rect.width = width;
	this.rect.height = height;
	if(img)
		this.img = img;

}.inherits(dream.visual.Graphic);

var $ = Bitmap.prototype;

Object.defineProperty($, "img", {
	set : function(v) {
		var bitmap = this;
		if (typeof v == "string"){
			this.source = new dream.static.Resource(v);
			this.requiredResources = [this.source];
			this.source.load(function(){
				if (!bitmap._width)
					bitmap._width = bitmap.rect.width = this.content.width;
				if (!bitmap._height)
					bitmap._height = bitmap.rect.height = this.content.height;
				bitmap.isBoundaryChanged = true;
				bitmap.isImageChanged = true;
			});
		}else if (v instanceof ImageData){
			var buff = new dream.util.BufferCanvas(img.width, img.height);
			this.source = {content:buff.canvas};
			if (!this._width)
				this._width = this.rect.width = this.source.width;
			if (!this._height)
				this._height = this.rect.height = this.source.height;
			buff.context.putImageData(v, 0, 0);
			bitmap.isBoundaryChanged = true;
		}else if(v instanceof Object){
			this.source = {content:v};
			if (!this._width)
				this._width = this.rect.width = this.source.width;
			if (!this._height)
				this._height = this.rect.height = this.source.height;
			bitmap.isBoundaryChanged = true;
			bitmap.isImageChanged = true;
		}else 
			throw new Error("Invalid Bitmap Image!");

	}
});

Object.defineProperty($, "width", {
	get : function() {
		return this._width;
	},
	set : function(v) {
		this._width = v;
		this.rect.width = v;
		this.isBoundaryChanged = true;
		this.isImageChanged = true;
	}
});
Object.defineProperty($, "height", {
	get : function() {
		return this._height;
	},
	set : function(v) {
		this._height = v;
		this.rect.height = v;
		this.isBoundaryChanged = true;
		this.isImageChanged = true;	}
});

$.paint = function(ctx, origin, renderRect){
	//TODO to get fixed after snaptopixel issue
	var c = this.source.content;
	if( false && renderRect && !renderRect.covers(this.boundary)){
		var ldr = this.rect.transformation.unprojectRect(renderRect).boundary.getIntersectWith(this.rect);
		var xf = c.width / this.rect.width, yf = c.height / this.rect.height;
		//console.log(ldr);
		ctx.drawImage(c, ldr.left * xf, ldr.top * yf, (ldr.width -1) * xf, (ldr.height -1) * yf, (origin.left|0) + ldr.left|0, (origin.top|0) + ldr.top|0, ldr.width, ldr.height);
	}else{
		if (c) ctx.drawImage(c, 0, 0, c.width, c.height, origin.left|0, origin.top|0, this._width, this._height);
	}
	
};

// exports
dream.visual.Bitmap = Bitmap;

})();