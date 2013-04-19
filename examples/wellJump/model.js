(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.behavior.animation.interpolator,
	behavior = dream.behavior,
	Composite = dream.visual.Composite,
	Tween = dream.behavior.animation.Tween;

Jumper = function(left, top){
	drawing.Circle.call(this, left, top, 30);
	
	this.anchorY = 30;
	this.fillStyle = new dream.visual.drawing.RadialGradient([new dream.visual.drawing.ColorStop(0, "#fe4532"), new dream.visual.drawing.ColorStop(1, "#de3623")], .3, .3, 0, .5, .5, .5);
	this.z = 10;
	//this.useBuffer = true;
	
	var jumper = this;
	
	this.behaviours.add(new dream.behaviour.Moving, "moving");
	
	dream.input.onDeviceMotion.add(function(event){
		var a = dream.input.deviceOrientation ? event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
		jumper.behaviours.moving.vx = a * 3;
	});

	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.RIGHT, function(i){jumper.left += Math.min(i,10);}));
	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.LEFT, function(i){jumper.left -= Math.min(i,10);}));
	
//	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.RIGHT, function(i){jumper.behaviours.moving.vx += Math.min(i,5)*.2;}));
//	this.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.LEFT, function(i){jumper.behaviours.moving.vx -= Math.min(i,5)*.2;}));

	var bounce = this.behaviors.add(new Tween({scaleY:0.5}, 10, new interpolator.Sine(1/2)), "bounce");

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
	
	this.behaviors.add(new dream.behavior.Motion("top", 0, 1), "motionY");


			
}.inherits(drawing.Circle);
var $ = Jumper.prototype;

$.jump = function(type){
	this.behaviors.motionY.velocity = type == 2 ? -40 : -20;
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
	this.behavior.actions.add(
		this.behaviors.add(
			new behavior.decorator.Controller(
				new Tween({rotation:120, alpha:.5}, 15, new interpolator.Sine(1/2))
			)
			, "breakTween"
		)
	);
	this.behavior.actions.add(
		this.behaviors.add(
			new behavior.decorator.Controller(
				new Tween({rotation:-120, alpha:.5}, 15, new interpolator.Sine(1/2))
			)
			, "breakLeftTween"
		)
	);
		

	//this.updateBuffer();
}.inherits(Bar);

BreakableBar.prototype.hit = function(point){
	var left = this.rect.transformation.unproject(point).left
	if(left < this.width/2){
		if(!this.anchorX){
			this.anchorX = this.width;
			this.left += this.width;
		}
		this.behaviors.breakLeftTween.play();			
	}else{
		if(this.anchorX){
			this.anchorX = 0;
			this.left -= this.width;
		}
		this.behaviors.breakTween.play();
	}
	return false;
};

ElasticBar = function(left, top){
	Bar.call(this, left, top);
	
	this.fillStyle = new drawing.LinearGradient([new drawing.ColorStop(0, "#449955"), new drawing.ColorStop(1, "#227711")], 0, 0, 0, 1);
	this.behavior.actions.add(
		this.behaviors.add(
			new behavior.decorator.Controller(
				new Tween({$top:5}, 10, new dream.behavior.animation.interpolator.Sine)
			)
			, "elasticTween"
		)
	);
	//this.updateBuffer();
}.inherits(Bar);

ElasticBar.prototype.hit = function(){
	this.behaviors.elasticTween.play();
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