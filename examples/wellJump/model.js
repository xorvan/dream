(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.visual.animation.interpolator,
	Tween = dream.visual.animation.Tween;

Jumper = function(left, top){
	drawing.Circle.call(this, left, top, 40);
	
	this.anchorY = 40;
	this.fillStyle = "#f00";
	this.z = 10;
		
}.inherits(drawing.Circle);
var $ = Jumper.prototype;

$.jump = function(){
	this.stat = 1;

	this.tweens.clear();
	
	var jumper = this;
	var downTween = new Tween({top:jumper.top+1200}, 100, new interpolator.PowerIn(2));
	downTween.onEnd.add(function(){
		console.log("Game Over");
	});
	
	var upTween = new Tween({top:jumper.top-300}, 30, new interpolator.PowerOut(2));
	upTween.onEnd.add(function(){
		jumper.stat = 0;
		jumper.tweens.add(downTween);
	});
	
	var startTween = this.tweens.add(new Tween({scaleY:0.5}, 10, new interpolator.Sine(1/2)));
	startTween.onEnd.add(function(){
		jumper.tweens.add(upTween);
		console.log("bb")
	});

	
};

Bar = function(left, top){
	drawing.Rect.call(this, left, top, 100, 20);
	
	this.fillStyle = "#00f";
	
}.inherits(drawing.Rect);

})();