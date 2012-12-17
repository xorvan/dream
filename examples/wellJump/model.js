(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.visual.animation.interpolator,
	Tween = dream.visual.animation.Tween;

Jumper = function(left, top){
	drawing.Circle.call(this, left, top, 40);
	
	this.fillStyle = "#f00";
	
}.inherits(drawing.Circle);

Bar = function(left, top){
	drawing.Rect.call(this, left, top, 100, 20);
	
	this.fillStyle = "#00f";
	
}.inherits(drawing.Rect);

})();