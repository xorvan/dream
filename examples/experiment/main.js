Boat = function(){
	
}.inherits(dream.visual.Graphic);

Star = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/star.png", 0, 0, 581, 518), left, top, 58, 51);
	this.anchorX = this.width / 2;
	this.anchorY = this.width / 2;
}.inherits(dream.visual.Sprite);

Enemy = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4, 5,[0,1,2,3,2,3,2,1,2,1,0,1]), left, top, 100, 75);
}.inherits(dream.visual.Sprite);

CompositeEnemy = function(left, top){
	dream.visual.Composite.call(this, left, top);
	
	this.e1 = this.children.add(new Enemy(0,0));
	this.e2 = this.children.add(new Enemy(20,0));
	this.s = this.children.add(new Star(10,10));
}.inherits(dream.visual.Composite);

function init(){
	exp = new dream.Screen(document.getElementById("mainCanvas"));
	
	world = new dream.scenery.Scene();
	
	world.assets.loader.onProgress.add(function(){
		console.log(world.assets.loader.loadedCount + "/" + (world.assets.loader.resources.length+world.assets.loader.loadedResources.length) );
	});

	
	worldMap = new dream.visual.Map("res/world.tmx");
	//world.assets.add(worldMap, "worldMap");
	
	boat1 = new Boat;
	//world.assets.add(boat1, "boat1");
	
	for(var i=1; i<=10; i++){
		with(world.assets.add(new Star(i*30, i*30), "star" + i)){
			alpha = 0.3;
			rotation = Math.random()*360 | 0;
			steps.add(new dream.visual.animation.Step(function(){this.rotation+=2;}));
		}
	}
	
	for(var i=1; i<=10; i++){
		var s = world.assets.add(new Enemy(Math.random() * 500 | 0, Math.random() * 500 | 0), "enemy" + i);
		s.steps.add(new dream.visual.animation.Step(function(){this.rotation += 5;}));
	}
	
	enemy = world.assets.add(new Enemy(100,100));
	//|enemy = world.assets.add(new dream.visual.Sprite(new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4), 50, 50, 100, 75));
	with(enemy){
		anchorX = width /2; 
		anchorY = height /2;
		left = top = 200;
		tween1 = tweens.add(new dream.visual.animation.Tween({scale:2,left:400,top:400,alpha:0.2, rotation:360}, 200, dream.visual.animation.interpolators.sine, true));
	}
	
	ce = world.assets.add(new CompositeEnemy(300,300));
	
	
	
	exp.scenes.add(world, "world");	
	exp.scenes.current = world;//| exp.scenes.select("world");
};