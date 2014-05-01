/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){
	
var Animation = dream.behavior.animation.Animation;

/**
 * @class Sprite
 * @extends dream.behavior.animation.Animation
 * @constructor
 */
var Sprite = function(input){
	Sprite._superClass.call(this);
	this.isPassive = true;
	this.frames = new dream.collection.List();
	var self = this;
	if(input instanceof Array){
		this.frames.addArray(input);
		this.duration = input.length;
	}else{
		// input is spritesheet
		if(input.isLoaded){
			var textureArray = input.textures;
			this.frames.addArray(textureArray);
			this.duration = textureArray.length;
		}else{
			this.sheetUri = input.sheetUri;
			console.log("input sheet is: ", input)
			input.sheet.onLoad.add(function(){
				self.frames.addArray(input.textures);
				self.duration = input.textures.length;
			})
		}
		
	}
	
}.inherits(Animation);

var Sprite$ = Sprite.prototype;

Sprite$.fn = function(frame, self){
	this.texture = self.frames[frame - 1];
};

//exports
dream.behavior.animation.Sprite = Sprite;
	
})(window);