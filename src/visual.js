/**
 * 
 */
dream.visual = {};

(function (){

var Texture = function(img, name, left, top, width, height, anchorX, anchorY){
	left = left || 0;
	top = top || 0;
	this.name = name || '';
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
		this.img = {content: img, isLoaded: true};
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
	var res = new SpriteSheet();
	if(this.isLoaded){
		console.log("adding current tx");
		var len = name.length;
		for (var i = 0, texture;texture = this.textures[i]; i++)
			if (texture.name.substring(0, len) == name)
				res.textures.push(texture);
	}else{
		var self = this;
		res.sheet = this.sheet;
		res.sheetUri = this.sheetUri;
		this.sheet.onLoad.add(function(){
			console.log("adding later tx");
			var len = name.length;
			for (var i = 0, texture;texture = self.textures[i]; i++)
				if (texture.name.substring(0, len) == name)
					res.textures.push(texture);
		})
	}
	
	return res;
};


/**
 * 
 */

var SequentialSpriteSheet = function(img, data){
	SpriteSheet.call(this);
	this.isLoaded = true;
	for (name in data){
		var slice = data[name];
	var col = slice.col == undefined ? 1:slice.col;
	var cnt = 0;
	for (var j = 0; j < col; j++)
		for (var i = 0; i < slice.count; i++, cnt++)
			this.textures.add(new Texture(img, name+"_"+ cnt, slice.left + i * slice.width, slice.top + j * slice.height, slice.width, slice.height));
	}
}.inherits(SpriteSheet);

var JsonSpriteSheet = function(uri){
	SpriteSheet.call(this);
	this.sheetUri = uri;
	var self = this;
	this.sheet = new dream.static.Resource(uri);
	this.sheet.onLoad.add(function(){
		self.isLoaded = true;
		self.width = self.sheet.content.meta.size.w;
		self.height = self.sheet.content.meta.size.h;
		self.imageUrl = dream.util.resolveUrl(self.sheet.content.meta.image,self.sheetUri);

		var ff = self.sheet.content.frames;
		var fr;

		for(i in ff){
			fr = ff[i].frame;
			if(ff[i].rotated){
				if(!buff){
					var buff = new dream.util.BufferCanvas(self.height, self.width);
					buff.context.translate(self.height/2, self.width/2)
					buff.context.rotate(Math.PI/-2);
				}
				var imm = new dream.static.Resource(self.imageUrl);
				if(imm.isLoaded){
					buff.context.drawImage(imm.content, 0, 0, self.width, self.height, self.width/-2, self.height/-2, self.width, self.height);
				}else{
					imm.onLoad.add(function(){
						buff.context.drawImage(imm.content, 0, 0, self.width, self.height, self.width/-2, self.height/-2, self.width, self.height);
					})
				}
				var tx = new  Texture(self.imageUrl , i.split('.')[0], fr.y, self.width - fr.x - fr.h, fr.w, fr.h);
				self.textures.add(tx)
				tx.img =  {content: buff.canvas, isLoaded: true};
				document.body.appendChild(buff.canvas)
				ccttxx = buff.canvas;
				
				
			}else{
				self.textures.add(new Texture(self.imageUrl , i.split('.')[0], fr.x, fr.y, fr.w, fr.h));
			}
		}
	})

}.inherits(SpriteSheet)

//exports
dream.visual = {
		Texture: Texture,
		SpriteSheet: SpriteSheet,
		SequentialSpriteSheet: SequentialSpriteSheet,
		JsonSpriteSheet: JsonSpriteSheet
		
		
};

})();
