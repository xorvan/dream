Aj = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/aj.png", 270, 0, 88, 160, 3, 15), left, top, 90, 160);
	this.frameSets.add(new dream.visual.SpriteFrameSet("res/aj.png", 6, 180, 112, 130, 6, 9), "run");
	
	ajSpriteSHEET = new Spritesheet({walking_0: new Texture("aj.png", 0,0,100,150), walking_1:new Texture()});
	
	ajSpriteSHEET = new SequentialSpritesheet("aj.png", {
		walking: {left:0, top:0, width:100, height:10, count:9, col:5},
		running: {}
	})
	
	dream.visual.Sprite.call(this,left, top, {
		"default": new SpriteAnimation(ajSpritesheet.getTextures("walking", [1,2,3,2]), 2),
		"running": new SpriteAnimation(ajSpritesheet.textures.startsWith("running"), 2),
		"running": new SpriteAnimation("aj.xml#running*", 2),
		"running": new SpriteAnimation("aj.png#animation&left=10&top=20&width=200&count=13&col=10", 2)
	});
	new Bitmap("aj.xml#running01");
	new TiledLayer("map.tmx#layer1;mime-type=");
	new Bitmap("aj.png#left=10&top=20&width=100&height=100");
	
}.inherits(dream.visual.Sprite);


Fire = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/fire.png", 0, 0, 64, 64, 16, 4), left, top, 64, 64);
}.inherits(dream.visual.Sprite);

Cube = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/cube.png", 0, 0, 60, 60, 30, 3), left, top, 60, 60);
}.inherits(dream.visual.Sprite);

Poly1 = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/poly1.png", 0, 0, 489, 454), left, top, 150, 150);
}.inherits(dream.visual.Sprite);

Star1 = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/star1.xml#running*;mime-type:text/atlas-texture", 0, 0, 581, 518), left, top, 80, 80);
	this.anchorX = this.anchorY = 40;
	this.steps.add(new dream.visual.animation.Step(function(){this.rotation += 5;}));
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
	
	c2.tweens.add(new dream.visual.animation.Tween({left:20, top:20, scale:1.3, rotation:360}, 200, new dream.visual.animation.interpolator.Sine, true));
	//c2.steps.add(new dream.visual.animation.Step(function(){this.rotation += 10;},-1,2));
	
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
	
	tc3.tweens.add(new dream.visual.animation.Tween({scale:1.5}, 20, new dream.visual.animation.interpolator.Sine, true));
	
	r.fillStyle = "#f0f";
	
	this.tweens.add(new dream.visual.animation.Tween({rotation:90, scale:1.5, left:left+200}, 90, new dream.visual.animation.interpolator.Sine, true));
	
}.inherits(dream.visual.Composite);

Enemy = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4, 5), left, top, 100, 75);
	this.onDragStart.add(function(mouse){
		var lm = this.rect.transformation.unproject(mouse);
		this.anchorX = lm.left;
		this.anchorY = lm.top;	
		this.steps.add(new dream.visual.animation.Step(function(){this.rotation+=5;}), 'main');
	});
	
	this.onDrag.add(function(mouse){
		this.left = mouse.left;
		this.top = mouse.top;
	});
	
	this.onDragStop.add(function(mouse){
		this.steps.remove('main');
	});
}.inherits(dream.visual.Sprite);


Paper1 = function(left, top){
	var rect1
	with(rect1 = this.assets.add(new dream.visual.drawing.Rect(left,top,150,150))){

		fillStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0.25, "#00aaaa"), new dream.visual.drawing.ColorStop(0.75, "#aa0000")], 0, 0, 1, 1);
		rotation = 0;
		strokeStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0, "#330000"), new dream.visual.drawing.ColorStop(1, "#008888")], 0, 0, 0, 1);
		tr = tweens.add(new dream.visual.animation.Tween({
			"fillStyle.colorStops[0].position":.5, 
			"fillStyle.colorStops[1].position":.5
		}, 200, new dream.visual.animation.interpolator.Sine, true));

	};
	
	
}.inherits(dream.visual.Composite);


Paper2 = function(left, top){
	dream.visual.Composite.call(this, left, top);
	this.assets.add(new Paper1(0, 0));
	this.assets.add(new Star1(0,0));
	this.assets.add(new Star1(0,150));
	this.assets.add(new Star1(150,0));
	this.assets.add(new Star1(150,150));
	
}.inherits(dream.visual.Composite);
