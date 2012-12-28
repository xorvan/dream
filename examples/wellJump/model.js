(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.visual.animation.interpolator,
	behaviour = dream.behaviour,
	Step = dream.visual.animation.Step,
	Tween = dream.visual.animation.Tween;

Jumper = function(left, top){
	drawing.Circle.call(this, left, top, 40);
	
	this.anchorY = 40;
	this.fillStyle = new dream.visual.drawing.RadialGradient([new dream.visual.drawing.ColorStop(0, "#fe4532"), new dream.visual.drawing.ColorStop(1, "#de3623")], .3, .3, 0, .5, .5, .5);
	this.z = 10;
	this.updateBuffer();
	
	this.behaviours.add(new behaviour.Moving, "moving");
	this.vx = 0;
	
	this.steps.add(new Step(function(){
		this.left += this.vx;
	}));
	
		
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
	});

	
};

Bar = function(left, top){
	drawing.Rect.call(this, left, top, 100, 20);
	
	this.fillStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0, "#68aefe"), new dream.visual.drawing.ColorStop(1, "#3657de")], 0, 0, 0, 1);
//	this.fillStyle = "#3657de"; 
	this.behaviours.add(new dream.behaviour.Draggable);
	this.updateBuffer();
}.inherits(drawing.Rect);

})();