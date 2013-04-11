(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.dynamic.interpolator,
	behaviour = dream.behaviour,
	Dynamic = dream.dynamic.Dynamic,
	Timeline = dream.dynamic.Timeline,
	Composite = dream.visual.Composite,
	Tween = dream.dynamic.Tween;

Jumper = function(left, top){
	drawing.Circle.call(this, left, top, 30);
	
	this.anchorY = 30;
	this.fillStyle = new dream.visual.drawing.RadialGradient([new dream.visual.drawing.ColorStop(0, "#fe4532"), new dream.visual.drawing.ColorStop(1, "#de3623")], .3, .3, 0, .5, .5, .5);
	this.z = 10;
	//this.useBuffer = true;
	
	var jumper = this;
	
	this.behaviours.add(new behaviour.Moving, "moving");
	
	dream.input.onDeviceMotion.add(function(event){
		var a = dream.input.deviceOrientation ? event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
		jumper.behaviours.moving.vx = a * 3;
	});

	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.RIGHT, function(i){jumper.left += Math.min(i,10);}));
	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.LEFT, function(i){jumper.left -= Math.min(i,10);}));
	
//	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.RIGHT, function(i){jumper.behaviours.moving.vx += Math.min(i,5)*.2;}));
//	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.LEFT, function(i){jumper.behaviours.moving.vx -= Math.min(i,5)*.2;}));

//	var startTween = this.dynamics.add(new Tween({scaleY:0.5}, new interpolator.Sine(1/2), 10), "startTween");
//	startTween.onEnd.add(function(){
//		jumper.dynamics.upTween.init().play();
//	});
//	
//	var upTween = this.dynamics.add(new Tween({$top:-300}, new interpolator.PowerOut(2), 25), "upTween");
//	upTween.onEnd.add(function(){
//		console.log("s0");
//		jumper.stat = 0;
//		jumper.dynamics.downTween.init().rewind().play();
//	});
//	
//	var downTween = this.dynamics.add(new Tween({$top:+1200}, new interpolator.PowerIn(2), 90), "downTween");
//	downTween.onEnd.add(function(){
//		console.log("Game Over");
//	});
	
	this.dynamics.add(new dream.dynamic.Motion("top", 0, 1), "motionY").play();


			
}.inherits(drawing.Circle);
var $ = Jumper.prototype;

$.jump = function(type){
	this.dynamics.motionY.velocity = type == 2 ? -40 : -20;
};

Bar = function(left, top){
	drawing.Rect.call(this, left, top, 75, 12);
	
	this.fillStyle = new drawing.LinearGradient([new drawing.ColorStop(0, "#68aefe"), new drawing.ColorStop(1, "#3657de")], 0, 0, 0, 1);
	this.behaviours.add(new dream.behaviour.Draggable);
	//this.useBuffer = true;
}.inherits(drawing.Rect);

Bar.prototype.hit = function(){
	return 1;
};


BreakableBar = function(left, top){
	Bar.call(this, left, top);
	
	this.fillStyle = new drawing.LinearGradient([new drawing.ColorStop(0, "#AA4455"), new drawing.ColorStop(1, "#330011")], 0, 0, 0, 1);
	this.dynamics.add(new Tween({rotation:120, alpha:50}, new interpolator.Sine(1/2), 15), "breakTween");
	this.dynamics.add(new Tween({rotation:-120, alpha:50}, new interpolator.Sine(1/2), 15), "breakLeftTween");
	//this.updateBuffer();
}.inherits(Bar);

BreakableBar.prototype.hit = function(point){
	var left = this.rect.transformation.unproject(point).left
	if(left < this.width/2){
		if(!this.anchorX){
			this.anchorX = this.width;
			this.left += this.width;
		}
		this.dynamics.breakLeftTween.play();			
	}else{
		if(this.anchorX){
			this.anchorX = 0;
			this.left -= this.width;
		}
		this.dynamics.breakTween.play();
	}
	return false;
};

ElasticBar = function(left, top){
	Bar.call(this, left, top);
	
	this.fillStyle = new drawing.LinearGradient([new drawing.ColorStop(0, "#449955"), new drawing.ColorStop(1, "#227711")], 0, 0, 0, 1);
	this.dynamics.add(new Tween({$top:5}, new dream.dynamic.interpolator.Sine, 10), "elasticTween");
	//this.updateBuffer();
}.inherits(Bar);

ElasticBar.prototype.hit = function(){
	this.dynamics.elasticTween.play();
	return 2;
};


StartGameButton = function(left, top){
	Composite.call(this, left, top);
	
	this.border = this.assets.add(new drawing.Rect(0,0,200,70));
	this.border.strokeStyle = "#666";
	this.border.fillStyle = "#eee";
	
	this.caption = this.assets.add(new drawing.Text(55, 50, "Start"));
	this.caption.fontSize = 40;
}.inherits(Composite);

})();