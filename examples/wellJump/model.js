(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.dynamic.interpolator,
	behaviour = dream.behaviour,
	Dynamic = dream.dynamic.Dynamic,
	Timeline = dream.dynamic.Timeline,
	Tween = dream.dynamic.Tween;

Jumper = function(left, top){
	drawing.Circle.call(this, left, top, 40);
	
	this.anchorY = 40;
	this.fillStyle = new dream.visual.drawing.RadialGradient([new dream.visual.drawing.ColorStop(0, "#fe4532"), new dream.visual.drawing.ColorStop(1, "#de3623")], .3, .3, 0, .5, .5, .5);
	this.z = 10;
	this.updateBuffer();
	
	var jumper = this;
	
	this.behaviours.add(new behaviour.Moving, "moving");
	
	dream.input.onDeviceMotion.add(function(event){
		var a = dream.input.deviceOrientation ? event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
		jumper.behaviours.moving.vx = a * 3;
	});

	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.RIGHT, function(i){jumper.left += Math.min(i,10);}));
	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.LEFT, function(i){jumper.left -= Math.min(i,10);}));

	
	var startTween = this.dynamics.add(new Tween({scaleY:0.5}, new interpolator.Sine(1/2), 10), "startTween");
	startTween.onEnd.add(function(){
		jumper.dynamics.upTween.init().play();
	});
	
	var upTween = this.dynamics.add(new Tween({$top:-300}, new interpolator.PowerOut(2), 30), "upTween");
	upTween.onEnd.add(function(){
		jumper.stat = 0;
		jumper.dynamics.downTween.init().rewind().play();
	});
	
	var downTween = this.dynamics.add(new Tween({$top:+1200}, new interpolator.PowerIn(2), 100), "downTween");
	downTween.onEnd.add(function(){
		console.log("Game Over");
	});


			
}.inherits(drawing.Circle);
var $ = Jumper.prototype;

$.jump = function(){
	this.stat = 1;
	this.dynamics.upTween.pause();
	this.dynamics.downTween.pause();
	this.dynamics.startTween.play();
};

Bar = function(left, top){
	drawing.Rect.call(this, left, top, 100, 20);
	
	this.fillStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0, "#68aefe"), new dream.visual.drawing.ColorStop(1, "#3657de")], 0, 0, 0, 1);
//	this.fillStyle = "#3657de"; 
	this.behaviours.add(new dream.behaviour.Draggable);
	this.updateBuffer();
}.inherits(drawing.Rect);

})();