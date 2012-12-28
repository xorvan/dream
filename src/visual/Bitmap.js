(function (){
var Bitmap = function(img, left, top, width, height){
	dream.visual.Bitmap._superClass.call(this, left, top);
	this._width = width;
	this._height = height;
	this.rect.width = width;
	this.rect.height = height;
	this.setUp(img);
}.inherits(dream.visual.Graphic);

var $ = Bitmap.prototype;

$.setUp = function(img){
	if (typeof img == "string"){
		this.source = null;
		this.requiredResources = [new dream.preload.ImageResource(img)];
		this.url = img;
		this.type = "Picture";
	}
	else if (img instanceof ImageData){
		var buff = new dream.util.BufferCanvas(img.width, img.height);
		this.source = buff.canvas;
		if (! this._width)
			this._width = this.rect.width = this.source.width;
		if (! this._height)
			this._height = this.rect.height = this.source.height;
		buff.context.putImageData(img, 0, 0);
		this.type = "ImageData";
	}
	else 
		console.log("invalid input argument");
};

Object.defineProperty($, "img", {
	set : function(v) {
		this.setUp(v);
		this.isImageChanged = true;
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

$.drawImage = function(ctx, origin){
	if (! this.source){
		this.source = dream.preload.cache[this.url].content;
		if (! this._width)
			this._width = this.rect.width = this.source.width;
		if (! this._height)
			this._height = this.rect.height = this.source.height;
		this.isBoundaryChanged = true;
	}
	ctx.drawImage(this.source, 0, 0, this.source.width, this.source.height, origin.left|0, origin.top|0, this._width, this._height);
};





// exports
dream.visual.Bitmap = Bitmap;

})();