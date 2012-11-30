Aj = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/aj.png", 270, 0, 88, 160, 3, 15), left, top, 90, 160);
	this.frameSets.add(new dream.visual.SpriteFrameSet("res/aj.png", 6, 180, 112, 130, 6, 9), "run");
}.inherits(dream.visual.Sprite);


Fire = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/fire.png", 230, 0, 70, 90, 3, 4), left, top, 90, 160);
}.inherits(dream.visual.Sprite);

Cube = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/cube.png", 0, 0, 60, 60, 30, 5), left, top, 60, 60);
}.inherits(dream.visual.Sprite);


RotatingCircles = function(left, top, d1, d2){
	dream.visual.Composite.call(this, left, top);
	
	var c1, c2;
	this.assets.add(c1 = new dream.visual.drawing.Circle(0, 0, d1), "c1");
	this.assets.add(c2 = new dream.visual.drawing.Circle(d1/2, d1/2, d2), "c2");
	
	c2.anchorY = d2 / 2;
	c2.anchorX = d1 / -2 + d2 / 2;
	
	c1.fillStyle = "#0f0";
	c2.fillStyle = "#00f";
	
	c2.steps.add(new dream.visual.animation.Step(function(){this.rotation += 10;},-1,2));
	
}.inherits(dream.visual.Composite);

ThreeCircles = function(left, top, d1, d2, d3){
	dream.visual.Composite.call(this, left, top);
	
	var c, rc;
	this.assets.add(c = new dream.visual.drawing.Circle(0, 0, d1), "c");
	this.assets.add(rc = new RotatingCircles(d1/2, d1/2, d2, d3), "c2");
	
	rc.anchorY = d2 / 2;
	rc.anchorX = d1 / -2 + d2 / 2;
	
	c.fillStyle = "#0ff";
	
	rc.steps.add(new dream.visual.animation.Step(function(){this.rotation += 4;},-1,2));
	
	this.anchorX = this.anchorY = d1/2;
	
}.inherits(dream.visual.Composite);

CompositeRect = function(left, top, width, height){
	dream.visual.Composite.call(this, left, top);
	
	var r, tc1, tc2, tc3, tc4;
	this.assets.add(r = new dream.visual.drawing.Rect(0, 0, width, height), "r");
	this.assets.add(tc1 = new ThreeCircles(0, 0, width/2, width/4, width/6 ), "tc1");
	this.assets.add(tc2 = new ThreeCircles(0, height, width/3, width/4, width/6 ), "tc2");
	this.assets.add(tc3 = new ThreeCircles(width, 0, width/2, width/4, width/6 ), "tc3");
	this.assets.add(tc4 = new ThreeCircles(width, height, width/3, width/4, width/6 ), "tc4");
	
	tc3.tweens.add(new dream.visual.animation.Tween({scale:1.5}, 20, dream.visual.animation.interpolators.sine, true));
	
	r.fillStyle = "#f0f";
	
	this.tweens.add(new dream.visual.animation.Tween({rotation:90}, 90, dream.visual.animation.interpolators.sine, true));
	
}.inherits(dream.visual.Composite);
