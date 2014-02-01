/**
 * 
 */
dream.visual = {};

(function (){

var Texture = function(img, left, top, width, height, anchorX, anchorY){
	left = left || 0;
	top = top || 0;
	if(typeof img == "string"){
		this.url = img;
		this.img = new dream.static.Resource(img);
		if(!width || !height){
			if(this.img.isLoaded){
				width = this.img.content.width;
				height = this.img.content.height;
			}else{
				var self = this;
				this.img.onLoad.add(function(){
					// console.log("setting rect size", self.img.content, self.img.content.width, self.img.content.height);
					self.rect.width = self.img.content.width;
					self.rect.height = self.img.content.height;
				})
			}
		}
		
	}else{
		this.img = {content: img};
		height = img.height;
		width = img.width;
	}
	this.anchorX = anchorX == undefined ? 0:anchorX; 
	this.anchorY = anchorY == undefined ? 0:anchorY;
	this.rect = new dream.geometry.Rect(left, top, width, height);
};
	
var SpriteSheet = function(data){
	this.textures = new dream.collection.List();
	data && this.textures.addJson(data);
};

var SpriteSheet$ = SpriteSheet.prototype;

SpriteSheet$.getTextureArray =function(name){
	var list = [];
	var len = name.length;
	for (var i = 0, texture;texture = this.textures[i]; i++)
		if (texture.name.substring(0, len) == name)
			list.push(texture);
	return list;
};


/**
 * 
 */

var SequentialSpriteSheet = function(img, data){
	SpriteSheet.call(this);
	for (name in data){
		var slice = data[name];
	var col = slice.col == undefined ? 1:slice.col;
	var cnt = 0;
	for (var j = 0; j < col; j++)
		for (var i = 0; i < slice.count; i++, cnt++)
			this.textures.add(new Texture(img, slice.left + i * slice.width, slice.top + j * slice.height, slice.width, slice.height), name+"_"+ cnt);
	}
}.inherits(SpriteSheet);

//exports
dream.visual = {
		Texture:Texture,
		SpriteSheet:SpriteSheet,
		SequentialSpriteSheet:SequentialSpriteSheet
		
		
};

})();
