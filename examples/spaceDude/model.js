(function(){

//importing packages
var drawing = dream.visual.drawing,
	visual = dream.visual,
	interpolator = dream.behavior.animation.interpolator,
	behavior = dream.behavior,
	Composite = dream.visual.Composite,
	Tween = dream.behavior.animation.Tween,
	bt = dream.behavior,
	rad = (Math.PI/180)
;


fireSprite =  new visual.SequentialSpriteSheet("res/burning.png", {"main":{left:0, top:0, width:13, height:13, count:2, col:1}});

Dude = function(top, left){
	visual.Composite.call(this, top, left)

	// this.rect.width = 100;
	// this.rect.height = 100;

	var body = this.body = new visual.Bitmap(0, 0, "res/sprites.xml#dude")
	this.assets.add(body)

	var fire = new visual.Bitmap(-1, 21, "res/fire.png")
	this.assets.add(fire)


	var burning = {}//new visual.Bitmap(-1, 21, new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/sprites.xml#fire*"), 8));//"res/fire.png")
	//fire.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite(fireSprite.textures), 8), "burning");

	this.assets.add(burning)

	this.behaviors.add(new behavior.Motion("top", 0, .05, function(motion){
		// if(motion.velocity > 20){
		// 	motion.velocity = 20;
		// 	motion.acceleration = 0;
		// } else 	if(motion.velocity < -20){
		// 	motion.velocity = -20;
		// 	motion.acceleration = 0;
		// }
		burning.visible = motion.acceleration < 0;
		fire.visible = motion.velocity < 0;

	}), "motionY");

	this.engineOn = false;

	var self = this;

	// var main =  fire.behavior.actions.add(new behavior.selector.Priority);
	// var goingUpSeq = main.actions.add(new behavior.selector.Sequence)
	// goingUpSeq.actions.add(new behavior.Action(function(){
	// 	return self.behaviors.motionY.acceleration < 0;
	// }))
	// goingUpSeq.actions.add(fire.behaviors.burning);


}.inherits(visual.Composite);

Dude.prototype.start = function(){
	this.behavior.actions.add(this.behaviors.motionY);
	this.behavior.actions.add(new behavior.Motion("left", 4, 0), "motionX");
}

Rocket = function(top, left, rotation){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left, "res/gigli.xml#blue-motion")
	this.rotation = rotation;
	this.lifeTime = 0;

	this.behaviors.add(new behavior.Motion("left", 30 * Math.cos(rotation * rad), 0), "motionX");
	this.behaviors.add(new behavior.Motion("top", 30 * Math.sin(rotation * rad), 0), "motionY");

	this.behavior.actions.add(this.behaviors.motionX);
	this.behavior.actions.add(this.behaviors.motionY);

}.inherits(visual.Bitmap);

GigliGreen = function(top, left){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left )
	this.anchorX = this.anchorY = 40;
	this.behaviors.add(new behavior.animation.Tween({$left:100, $top: 100}, 10, new dream.behavior.animation.interpolator.PowerInOut(3)), "move");
	this.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/gigli.xml#green-motion*"), 6), "motion");
	this.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/gigli.xml#green-idle*"), 6), "idle");

	this.behaviors.add(new behavior.animation.Timeline( Math.round(Math.random() * 100 + 50)), "main");
	this.behaviors.main.addAt(30, this.behaviors.move);
	this.behaviors.main.actions[29] = new dream.behavior.animation.FrameAction(function(ph){
		var x = Math.round(Math.random() * 150 - 75);
		this.behaviors.move.valueMap.$left = x > 0 ? x + 50 : x - 50;
		var y = Math.round(Math.random() * 150 - 75);
		this.behaviors.move.valueMap.$top = y > 0 ? y + 50 : y - 50;
		var r = Math.atan(y/x) / (Math.PI/180);
		this.behaviors.move.init();
		this.rotation = r;
	},true);


	this.behaviors.main.actions[25] = new dream.behavior.animation.FrameAction(function(ph){
		this.isMoving = true;
	},true);
	this.behaviors.main.actions[41] = new dream.behavior.animation.FrameAction(function(ph){
		this.isMoving = false;
	},true);

	this.behaviors.main.actions[40] = new dream.behavior.animation.FrameAction(function(ph){
		this.rotation = 0;
	},true);

	var s = this.behaviors.add(new behavior.selector.Priority(), "sprites");
	var m = s.actions.add(new behavior.selector.Sequence());
	m.actions.add(new behavior.Condition(function(){
		return !!this.isMoving;
	}))
	m.actions.add(this.behaviors.motion)

	s.actions.add(new bt.decorator.True(this.behaviors.idle));

	this.behavior.actions.add(this.behaviors.main);
	this.behavior.actions.add(s);

}.inherits(visual.Bitmap);

GigliRed = function(top, left){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left )
	this.anchorX = this.anchorY = 40;
	this.behaviors.add(new behavior.animation.Tween({$left:200, $top: 200}, 10, new dream.behavior.animation.interpolator.PowerInOut(3)), "move");
	this.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/gigli.xml#red-motion*"), 6), "motion");
	this.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/gigli.xml#red-idle*"), 6), "idle");

	this.behaviors.add(new behavior.animation.Timeline(Math.round(Math.random() * 50 + 30)), "main");
	this.behaviors.main.addAt(30, this.behaviors.move);
	this.behaviors.main.actions[29] = new dream.behavior.animation.FrameAction(function(ph){
		var x = Math.round(Math.random() * 300 - 150);
		this.behaviors.move.valueMap.$left = x > 0 ? x + 50 : x - 50;
		var y = Math.round(Math.random() * 300 - 150);
		this.behaviors.move.valueMap.$top = y > 0 ? y + 50 : y - 50;
		var r = Math.atan(y/x) / (Math.PI/180);
		this.behaviors.move.init();
		this.rotation = r;
	},true);


	this.behaviors.main.actions[25] = new dream.behavior.animation.FrameAction(function(ph){
		this.isMoving = true;
	},true);
	this.behaviors.main.actions[41] = new dream.behavior.animation.FrameAction(function(ph){
		this.isMoving = false;
	},true);

	this.behaviors.main.actions[40] = new dream.behavior.animation.FrameAction(function(ph){
		this.rotation = 0;
	},true);

	var s = this.behaviors.add(new behavior.selector.Priority(), "sprites");
	var m = s.actions.add(new behavior.selector.Sequence());
	m.actions.add(new behavior.Condition(function(){
		return !!this.isMoving;
	}))
	m.actions.add(this.behaviors.motion)

	s.actions.add(new bt.decorator.True(this.behaviors.idle));

	this.behavior.actions.add(this.behaviors.main);
	this.behavior.actions.add(s);

}.inherits(visual.Bitmap);

GigliBlue = function(top, left){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left )
	this.anchorX = this.anchorY = 40;
	this.behaviors.add(new behavior.animation.Tween({$top: -50}, 10, new dream.behavior.animation.interpolator.PowerInOut(3)), "move");
	this.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/gigli.xml#blue-idle*"), 6), "motion");
	this.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite("res/gigli.xml#blue-idle1*"), 6), "idle");

	this.behaviors.add(new behavior.Motion("top", 1, 0), "motionY");

	this.behaviors.add(new behavior.animation.Timeline(Math.round(Math.random() * 100 + 100)), "main");
	this.behaviors.main.addAt(30, this.behaviors.move);

	this.behaviors.main.actions[29] = new dream.behavior.animation.FrameAction(function(ph){
		// var y = Math.round(Math.random() * 300 - 150);
		// this.behaviors.move.valueMap.$top = y > 0 ? y + 50 : y - 50;
		this.behaviors.move.init();
	},true);


	this.behaviors.main.actions[20] = new dream.behavior.animation.FrameAction(function(ph){
		this.isMoving = true;
	},true);

	this.behaviors.main.actions[41] = new dream.behavior.animation.FrameAction(function(ph){
		this.isMoving = false;
	},true);

	var s = this.behaviors.add(new behavior.selector.Priority(), "sprites");
	var m = s.actions.add(new behavior.selector.Sequence());
	m.actions.add(new behavior.Condition(function(){
		return !!this.isMoving;
	}))
	m.actions.add(this.behaviors.motion)

	s.actions.add(new bt.decorator.True(this.behaviors.idle));

	this.behavior.actions.add(this.behaviors.main);
	this.behavior.actions.add(this.behaviors.motionY);
	this.behavior.actions.add(s);

}.inherits(visual.Bitmap);



Tree = function(top, left, rotation){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left, "res/sprites.xml#tree")
	this.rotation = rotation;

}.inherits(visual.Bitmap);

StartGameButton = function(left, top){
	Composite.call(this, left, top);

	this.border = this.assets.add(new drawing.Rect(0,0,200,70));
	this.border.strokeStyle = "#666";
	this.border.fillStyle = "#eee";

	this.caption = this.assets.add(new drawing.Text(55, 50, "Start"));
	this.caption.fontSize = 40;
}.inherits(Composite);

})();
