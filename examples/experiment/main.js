var enemySprite = new dream.visual.SequentialSpriteSheet("res/enemies.png",{"main":{left:0, top:0, width:100, height:75, count:4, col:1}});


Star = function(left, top){
	dream.visual.Bitmap.call(this,"res/star.png", left, top,  58, 51);
	this.anchorX = 581 / 2;
	this.anchorY = 518 / 2;
	this.scale = 0.1;
}.inherits(dream.visual.Bitmap);

Enemy = function(left, top){
	dream.visual.Sprite.call(this, left, top, new dream.dynamic.SpriteAnimation(enemySprite.textures, true, 5));
	this.onDragStart.add(function(event){
		var lm = event.localPosition;
		this.anchorX = lm.left;
		this.anchorY = lm.top;
		this.left = event.position.left;
		this.top = event.position.top;		
		this.dynamics.add(new dream.dynamic.Dynamic(function(){this.rotation+=5;}), 'rot').play();
	});
	
	this.onDrag.add(function(event){
		var mouse = event.position;
		this.left = mouse.left;
		this.top = mouse.top;
	});
	
	this.onDragStop.add(function(mouse){
		this.dynamics.remove('rot');
	});
}.inherits(dream.visual.Sprite);

CompositeEnemy = function(left, top){
	dream.visual.Composite.call(this, left, top);
	
	this.e1 = this.assets.add(new Enemy(0,0));
	this.e2 = this.assets.add(new Enemy(20,0));
	this.s = this.assets.add(new Star(10,10));
	this.s.dynamics.add(new dream.dynamic.Tween({left:60}, new dream.dynamic.interpolator.Sine, 50, true)).play();
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
		tween1 = dynamics.add(new dream.dynamic.Tween({scale:2,left:400,top:400,alpha:0.2, rotation:360}, new dream.dynamic.interpolator.Sine, 200, true)).play();
		onMouseEnter.add(function(){console.log("me");});
		onMouseLeave.add(function(){console.log("ml");});
	}
	
	ce = world.assets.add(new CompositeEnemy(400,50));
	ce.rotation = 90;
	ce.dynamics.add(new dream.dynamic.Tween({rotation:180}, new dream.dynamic.interpolator.Sine, 100, true),"rotate").play();
	ce.dynamics.add(new dream.dynamic.Tween({alpha:0}, null, 80, true),"alpha").play();
//	ce.dynamics.alpha.actions.add(new dream.dynamic.Action(20,function(p){var x="booboo";},false));
//	ce.dynamics.alpha.onCycle.add(function(){console.log("alpha cycle ended");});
//	ce.dynamics.rotate.onCycle.add(function(){console.log("rotation cycle ended");});
	
	paper = world.assets.add(new dream.visual.Composite(-400,100));
	with(rect1 = paper.assets.add(new dream.visual.drawing.Rect(0,0,100,100))){
		//anchorX = anchorY = 50;
		fillStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0.25, "#00aaaa"), new dream.visual.drawing.ColorStop(0.75, "#aa0000")], 0, 0, 1, 1);
		rotation = 0;
		strokeStyle = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0, "#330000"), new dream.visual.drawing.ColorStop(1, "#008888")], 0, 0, 0, 1);
		tr = dynamics.add(new dream.dynamic.Tween({
		/*	width:150,
			scale:1.5,
			rotation:-15,
			alpha:0.8,*/
			"fillStyle.colorStops[0].position":.5, 
			"fillStyle.colorStops[1].position":.5
		}, new dream.dynamic.interpolator.Sine, 200, true)).play();
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

	exp.scenes.add(world, "world");	
	exp.scenes.current = world;//| exp.scenes.select("world");
	
	world.behaviours.addArray(
			[new dream.behaviour.KeyboardNavigable(),
			 new dream.behaviour.SnapAnchorToPointer(),
			 new dream.behaviour.WheelZoomable(),
			 new dream.behaviour.KeyboardZoomable(),
			 new dream.behaviour.Draggable()]);
	
	
	world.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.Q, function(i){this.rotation += i;}));
	world.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.W, function(i){this.rotation -= i;}));

	paper.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.A, function(i){this.rotation += i;}));
	paper.behaviours.add(new dream.behaviour.KeyBinding(dream.input.Key.S, function(i){this.rotation -= i;}));
	
	stats=new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';
	document.getElementById("container").appendChild(stats.getDomElement() );
	var stp=new dream.dynamic.Dynamic(function(){stats.update();});
	world.dynamics.add(stp).play();
};

