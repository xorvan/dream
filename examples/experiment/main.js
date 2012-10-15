Boat = function(){
	
}.inherits(dream.visual.Graphic);

Star = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/star.png", 0, 0, 581, 518), left, top, 58, 51);
}.inherits(dream.visual.Sprite);

Enemy = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4), left, top, 100, 75);
}.inherits(dream.visual.Sprite);

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
		var s = world.assets.add(new Star(i*30, i*30), "star"+i);
		s.alpha = 0.3;
		s.rotation = Math.random()*360 | 0;
	}
	
	enemy = world.assets.add(new Enemy(50,50));
	enemy.steps.add(new dream.visual.animation.Step(function(){this.rotation+=10;}));
	
	//enemy = world.assets.add(new dream.visual.Sprite(new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4), 50, 50, 100, 75));
	
	
	exp.scenes.add(world, "world");	
	exp.scenes.current = world;//| exp.scenes.select("world");
};