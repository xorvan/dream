Boat = function(){
	
}.inherits(dream.visual.Graphic);

Star = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/star.png", 0, 0, 581, 518), left, top, 58, 51);
	this.anchorX = this.width / 2;
	this.anchorY = this.width / 2;
}.inherits(dream.visual.Sprite);

Enemy = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4, 1,[0,1,2,3,2,3,2,1,2,1,0,1]), left, top, 100, 75);
	//this.anchorX = this.anchorY = 50;
	var exo, eyo;
	this.onDragStart.add(function(mouse){
		var mouse = this.translateIn(mouse);
		exo = mouse.left;
		eyo = mouse.top;
		this.anchorX = exo;
		this.anchorY = eyo;
		this.left -= exo;
		this.top -= eyo;		
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

CompositeEnemy = function(left, top){
	dream.visual.Composite.call(this, left, top);
	
	this.e1 = this.assets.add(new Enemy(0,0));
	this.e2 = this.assets.add(new Enemy(20,0));
	this.s = this.assets.add(new Star(10,10));
	this.s.tweens.add(new dream.visual.animation.Tween({left:60}, 50, dream.visual.animation.interpolators.sine, true));
}.inherits(dream.visual.Composite);

function init(){
	exp = new dream.Screen(document.getElementById("mainCanvas"), 320, 240, 800, 600, dream.Screen.scaleModes.SHOWALL );
	
	world = new dream.scenery.Scene();
	
	world.anchorX = world.anchorY = 200;
	
	world.assets.loader.onProgress.add(function(){
		console.log(world.assets.loader.loadedCount + "/" + (world.assets.loader.resources.length+world.assets.loader.loadedResources.length) );
	});

	
	worldMap = new dream.visual.Map("res/world.tmx");
	//world.assets.add(worldMap, "worldMap");
	
	boat1 = new Boat;
	//world.assets.add(boat1, "boat1");
	
	
	for(var i=1; i<=400; i++){
		var s = world.assets.add(new Enemy(Math.random() * 5000 | 0, Math.random() * 5000 | 0), "enemy" + i);
		//s.steps.add(new dream.visual.animation.Step(function(){this.rotation += 5;}));
	}
	
	for(var i=0; i<=15; i++){
		with(world.assets.add(new Star(i*90, i*60), "star" + i)){
			alpha = 0.8;
			rotation = Math.random()*360 | 0;
			steps.add(new dream.visual.animation.Step(function(){this.rotation+=2;}));
		}
	}

	enemy = world.assets.add(new Enemy(100,10));
	//|enemy = world.assets.add(new dream.visual.Sprite(new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4), 50, 50, 100, 75));
	with(enemy){
		anchorX = width /2; 
		anchorY = height /2;
		//left = top = 200;
		tween1 = tweens.add(new dream.visual.animation.Tween({scale:2,left:400,top:400,alpha:0.2, rotation:360}, 200, dream.visual.animation.interpolators.sine, true));
		onMouseOver.add(function(){console.log("mi");});
		onMouseOut.add(function(){console.log("mo");});
	}
	
	ce = world.assets.add(new CompositeEnemy(400,50));
	ce.rotation = 90;
	ce.tweens.add(new dream.visual.animation.Tween({rotation:180}, 100, dream.visual.animation.interpolators.sine, true));
	
	paper = world.assets.add(new dream.visual.Composite(-400,100));
	with(rect1 = paper.assets.add(new dream.visual.drawing.Rect(0,0,100,100))){
		//anchorX = anchorY = 50;
		fillStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0.25, "#00aaaa"), new dream.visual.drawing.ColorStop(0.75, "#aa0000")], 0, 0, 1, 1);
		rotation = 0;
		strokeStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0, "#330000"), new dream.visual.drawing.ColorStop(1, "#008888")], 0, 0, 0, 1);
		tr = tweens.add(new dream.visual.animation.Tween({
		/*	width:150,
			scale:1.5,
			rotation:-15,
			alpha:0.8,*/
			"fillStyle.colorStops[0].position":.5, 
			"fillStyle.colorStops[1].position":.5
		}, 200, dream.visual.animation.interpolators.sine, true));
		onMouseOut.add(function(){console.log("r1mo");});
		onMouseOver.add(function(){console.log("r1mi");});
		onMouseDown.add(function(){console.log("r1md");});
		onMouseUp.add(function(){console.log("r1mu");});
		onClick.add(function(){console.log("r1mc");});
	}
	
	rect2 = paper.assets.add(new dream.visual.drawing.Rect(0,0,20,20));
	rect2.fillStyle = "#ff0000";
	rect2.strokeStyle = "#00ff00";
	rect2.onMouseOver.add(function(){console.log("r2mi");});
	rect2.onMouseOut.add(function(){console.log("r2mo");});
	
	//paper.scale = 2;
	paper.onMouseOver.add(function(){console.log("pmi");});
	paper.onMouseOut.add(function(){console.log("pmo");});
	paper.onMouseDown.add(function(){console.log("pmd");});
	paper.onMouseUp.add(function(){console.log("pmu");});
	paper.onClick.add(function(){console.log("pmc");});
	paper.onMouseMove.add(function(){console.log("pmm");});

	//rp = paper.tweens.add(new dream.visual.animation.Tween({rotation:360}, 1000, false, true));
	world.onResize.add(function(){
		this.left = this.width/2;
		this.top = this.height/2;		
	});
	
	world.onMouseMove.add(function(mouse){
		var m = this.translateIn(mouse);
		this.anchorX = m.left;
		this.anchorY = m.top;
		
		this.left = mouse.left;
		this.top = mouse.top;
	});
	
	exp.scenes.add(world, "world");	
	exp.scenes.current = world;//| exp.scenes.select("world");
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorX += Math.min(i,10);}, dream.input.key.RIGHT));
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorX -= Math.min(i,10);}, dream.input.key.LEFT));
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorY -= Math.min(i,10);}, dream.input.key.UP));
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorY += Math.min(i,10);}, dream.input.key.DOWN));
	
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.rotation += Math.min(i,5);}, dream.input.key.SLASH));
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.rotation -= Math.min(i,5);}, dream.input.key.ASTERISK));
	
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.scale += i/100;}, dream.input.key.PLUS));
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.scale -= i/100;}, dream.input.key.MINUS));
	
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){paper.rotation += i;}, dream.input.key.Q));
	exp.keyBindings.add(new dream.input.KeyBinding(function(i){paper.rotation -= i;}, dream.input.key.W));

	
	stats=new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';
	document.getElementById("container").appendChild(stats.getDomElement() );
	var stp=new dream.visual.animation.Step(function(){stats.update();});
	enemy.steps.add(stp);
};

