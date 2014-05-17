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
  var loadSpriteSheet = function (input){
    if(input.isLoaded){
      var textureArray = input.textures;
      self.frames.addArray(textureArray);
      self.duration = textureArray.length;
    }else{
      self.sheetUri = input.sheetUri;
      // console.log("input sheet is: ", input)
      input.sheet.onLoad.add(function(){
        self.frames.addArray(input.textures);
        self.duration = input.textures.length;
      })
    }
  }

  if(typeof input == "string"){
    var res = new dream.static.Resource(input);
    if(res.isLoaded){
      loadSpriteSheet(res.content);
    }else{
      res.onLoad.add(function(){
        loadSpriteSheet(res.content);
      })
      // RRRR =res
      res.load();
    }
  }else if(input instanceof Array){
		this.frames.addArray(input);
		this.duration = input.length;
	}else if(input){
		// input is spritesheet
    loadSpriteSheet(input);
	}

}.inherits(Animation);

var Sprite$ = Sprite.prototype;

Sprite$.fn = function(frame, self){
	this.texture = self.frames[frame - 1];
};

//exports
dream.behavior.animation.Sprite = Sprite;

})(window);
