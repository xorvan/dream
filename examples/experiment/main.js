Boat = function(){
	
}.inherits(dream.visual.Graphic);

Star = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/star.png", 0, 0, 581, 518), left, top, 58, 51);
	this.anchorX = 581 / 2;
	this.anchorY = 518 / 2;
	this.scale = 0.1;
}.inherits(dream.visual.Sprite);

Enemy = function(left, top){
	dream.visual.Sprite.call(this, new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4, 1,[0,1,2,3,2,3,2,1,2,1,0,1]), left, top, 100, 75);
	//this.anchorX = this.anchorY = 50;
	this.onDragStart.add(function(event){
		var lm = event.localPosition;
		this.anchorX = lm.left;
		this.anchorY = lm.top;
		this.left = event.position.left;
		this.top = event.position.top;		
		this.steps.add(new dream.visual.animation.Step(function(){this.rotation+=5;}), 'main');
	});
	
	this.onDrag.add(function(event){
		var mouse = event.position;
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
	this.s.tweens.add(new dream.visual.animation.Tween({left:60}, 50, new dream.visual.animation.interpolator.Sine, true));
}.inherits(dream.visual.Composite);


function init(){
	exp = new dream.Screen(document.getElementById("mainCanvas"), 320, 240, 1600, 1200, dream.Screen.ScaleMode.SHOW_ALL );
	
	world = new dream.scenery.Scene();
	
	world.left = exp.width/2;
	world.top = exp.height/2;		
	
	world.assets.loader.onProgress.add(function(){
		console.log(world.assets.loader.loadedCount + "/" + world.assets.loader.resources.length);
	});

	
	worldMap = new dream.visual.Map("res/world.tmx");
	//world.assets.add(worldMap, "worldMap");
	
	boat1 = new Boat;
	//world.assets.add(boat1, "boat1");
	
	
	for(var i=1; i<=2; i++){
		var s = world.assets.add(new Enemy(Math.random() * 500 | 0, Math.random() * 500 | 0), "enemy" + i);
		//s.steps.add(new dream.visual.animation.Step(function(){this.rotation += 5;}));
	}
	
//	for(var i=0; i<=15; i++){
//		with(world.assets.add(new Star(i*90, i*60), "star" + i)){
//			alpha = 0.8;
//			rotation = Math.random()*360 | 0;
//			steps.add(new dream.visual.animation.Step(function(){this.rotation+=2;}));
//		}
//	}
	
	p= world.assets.add(new dream.visual.Bitmap("res/star.png", 0, 0));
	enemy = world.assets.add(new Enemy(100,10));
	//|enemy = world.assets.add(new dream.visual.Sprite(new dream.visual.SpriteFrameSet("res/enemies.png", 0, 0, 100, 75, 4), 50, 50, 100, 75));
	with(enemy){
		//anchorX = width /2; 
		//anchorY = height /2;
		//left = top = 200;
		tween1 = tweens.add(new dream.visual.animation.Tween({scale:2,left:400,top:400,alpha:0.2, rotation:360}, 200, new dream.visual.animation.interpolator.Sine, true));
		onMouseEnter.add(function(){console.log("me");});
		onMouseLeave.add(function(){console.log("ml");});
	}
	
	ce = world.assets.add(new CompositeEnemy(400,50));
	ce.rotation = 90;
	ce.tweens.add(new dream.visual.animation.Tween({rotation:180}, 100, new dream.visual.animation.interpolator.Sine, true));
	
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
		}, 200, new dream.visual.animation.interpolator.Sine, true));
		onMouseLeave.add(function(){console.log("r1ml");});
		onMouseEnter.add(function(){console.log("r1me");});
		onMouseDown.add(function(){console.log("r1md");});
		onMouseUp.add(function(){console.log("r1mu");});
		onClick.add(function(){console.log("r1mc");});
		onMouseDown$capture.add(function(){console.log("C r1md");});
		onMouseUp$capture.add(function(){console.log("C r1mu");});
		onClick$capture.add(function(){console.log("C r1mc");});
	}
	
	rect2 = paper.assets.add(new dream.visual.drawing.Rect(0,0,20,20));
	rect2.fillStyle = "#ff0000";
	rect2.strokeStyle = "#00ff00";
	rect2.onMouseEnter.add(function(){console.log("r2me");});
	rect2.onMouseLeave.add(function(){console.log("r2ml");});
	
	//paper.scale = 2;
	paper.onMouseEnter.add(function(){console.log("pme");});
	paper.onMouseLeave.add(function(){console.log("pml");});
	paper.onMouseMove.add(function(){console.log("pmm");});
	paper.onMouseDown.add(function(){console.log("pmd");});
	paper.onMouseUp.add(function(){console.log("pmu");});
	paper.onClick.add(function(){console.log("pmc");});
	paper.onMouseDown$capture.add(function(){console.log("C pmd");});
	paper.onMouseUp$capture.add(function(){console.log("C pmu");});
	paper.onClick$capture.add(function(){console.log("C pmc");});
	
	paper.onDrop.add(function(){console.log("pdrop");});
	paper.onDrop$capture.add(function(){console.log("C pdrop");});

	world.onMouseMove.add(function(event){
		var m = event.localPosition;
		this.anchorX = m.left;
		this.anchorY = m.top;
		
		this.left = event.position.left;
		this.top = event.position.top;
	});
	
	exp.scenes.add(world, "world");	
	exp.scenes.current = world;//| exp.scenes.select("world");
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorX += Math.min(i,10);}, dream.input.Key.RIGHT));
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorX -= Math.min(i,10);}, dream.input.Key.LEFT));
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorY -= Math.min(i,10);}, dream.input.Key.UP));
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.anchorY += Math.min(i,10);}, dream.input.Key.DOWN));
//	
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.rotation += Math.min(i,5);}, dream.input.Key.SLASH));
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.rotation -= Math.min(i,5);}, dream.input.Key.ASTERISK));
//	
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.scale += i/100;}, dream.input.Key.PLUS));
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){world.camera.scale -= i/100;}, dream.input.Key.MINUS));
//	
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){paper.rotation += i;}, dream.input.Key.Q));
//	exp.keyBindings.add(new dream.input.KeyBinding(function(i){paper.rotation -= i;}, dream.input.Key.W));

	
	stats=new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';
	document.getElementById("container").appendChild(stats.getDomElement() );
	var stp=new dream.visual.animation.Step(function(){stats.update();});
	world.steps.add(stp);
};

