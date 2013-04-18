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
var Sprite = function(textureArray){
	Sprite._superClass.call(this, undefined, textureArray.length);
	this.isPassive = true;
	this.frames = new dream.collection.List();
	this.frames.addArray(textureArray);	
}.inherits(Animation);

var Sprite$ = Sprite.prototype;

Sprite$.fn = function(frame, self){
	this.texture = self.frames[frame - 1];
};

//exports
dream.behavior.animation.Sprite = Sprite;
	
})(window);