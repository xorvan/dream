(function(){

//importing packages
var drawing = dream.visual.drawing,
	visual = dream.visual,
	interpolator = dream.behavior.animation.interpolator,
	behavior = dream.behavior,
	Composite = dream.visual.Composite,
	Tween = dream.behavior.animation.Tween,
	rad = (Math.PI/180)
;


fireSprite =  new visual.SequentialSpriteSheet("res/burning.png", {"main":{left:0, top:0, width:13, height:13, count:2, col:1}});

Dude = function(top, left){
	visual.Composite.call(this, top, left)

	// this.rect.width = 100;
	// this.rect.height = 100;

	var body = new visual.Bitmap(0, 0, "res/space-dude.png")
	this.assets.add(body)

	var fire = new visual.Bitmap(-1, 21, "res/fire.png")
	this.assets.add(fire)

	var burning = new visual.Bitmap(-1, 21, new bt.decorator.Interval(new dream.behavior.animation.Sprite(fireSprite.textures), 8));//"res/fire.png")
	//fire.behaviors.add(new bt.decorator.Interval(new dream.behavior.animation.Sprite(fireSprite.textures), 8), "burning");

	this.assets.add(burning)

	this.behaviors.add(new behavior.Motion("top", 0, .4, function(motion){
		if(motion.velocity > 20){
			motion.velocity = 20;
			motion.acceleration = 0;
		} else 	if(motion.velocity < -20){
			motion.velocity = -20;
			motion.acceleration = 0;
		}
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
	this.behavior.actions.add(new behavior.Motion("left", 5, 0), "motionX");
}

Rocket = function(top, left, rotation){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left, "res/rocket.png")
	this.rotation = rotation;
	this.lifeTime = 0;

	this.behaviors.add(new behavior.Motion("left", 30 * Math.cos(rotation * rad), 0), "motionX");
	this.behaviors.add(new behavior.Motion("top", 30 * Math.sin(rotation * rad), 0), "motionY");

	this.behavior.actions.add(this.behaviors.motionX);
	this.behavior.actions.add(this.behaviors.motionY);

}.inherits(visual.Bitmap);

Wall = function(top, left, rotation){
	var rotation = rotation || 0;
	visual.Bitmap.call(this, top, left, "res/wall.png")
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
