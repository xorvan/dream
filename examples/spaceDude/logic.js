(function(window){

//importing packages
var drawing = dream.visual.drawing,
	visual = dream.visual,
	dynamic = dream.dynamic,
	bt = dream.behavior,
	interpolator = dream.behavior.animation.interpolator,
	Tween = dream.behavior.animation.Tween,
	Provider = dream.provider.Provider,
	List = dream.collection.List,
	Text = dream.visual.drawing.Text,
	behavior = dream.behavior,
	Dynamic = dream.behavior.Action;

width = 960;


init = function(){
	console.log("init")
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), 960, 640, 1440, 1200);
	// gameScreen.frameRate = 400;
	// menuScene = gameScreen.scenes.add(new MenuScene);
	// gameScreen.scenes.current = menuScene;

	if(window.initStat) initStat();

	setTimeout(function(){
		startGame();
	}, 500)
};


startGame = function(){
	console.log("starting")
	rockets = [];
	gameScene = gameScreen.scenes.current = new GameScene();
	gameScene.onGameOver.add(function(){
		console.log("Game Over!");
		startGame();
	});

	var stp = new dream.behavior.Action(function(){stats.update();});
	gameScene.behavior.actions.add(stp);


};

GameScene = function(){
	dream.scenery.Scene.call(this);

	this.onResize.add(function(){
		this.top = gameScreen.height - 809;
		this.left = gameScreen.width - 960;
	});

	this.providers.add(new TreeProvider);

	this.trees = new List;


	var scene = this;
	this.pool.onAdd.add(function(obj){
		if(obj instanceof Tree)
			scene.trees.add(obj);
	});

	this.pool.onRemove.add(function(obj){
		if(obj instanceof Tree)
			scene.trees.remove(obj);
	});

	this.behaviors.add(new bt.decorator.Controller(new behavior.animation.Tween({$left:5, $top: 5}, 4, new dream.behavior.animation.interpolator.Sine)), "vibrate");

	this.behavior.actions.add(this.behaviors.vibrate);


	var sky = new visual.Bitmap(-200, 0, "res/sky.png");
	this.assets.add(sky);

	var filter = new visual.Bitmap(-200, 0, "res/filter.png");
	filter.z = 100000;
	this.assets.add(filter);

	var islands = new visual.Bitmap(0, 0, "res/islands.png");
	islands.z = 2;
	this.assets.add(islands);

	var clouds1 = new visual.Bitmap(0, 0, "res/clouds1.png");
	clouds1.z = 3;
	this.assets.add(clouds1);

	var clouds2 = new visual.Bitmap(0, 0, "res/clouds2.png");
	clouds2.z = 4;
	this.assets.add(clouds2);

	forest1 = new drawing.Rect(0, 0, 10000, 1000);
	forest1.z = 5;
	forest1.fillStyle = new drawing.Pattern(new visual.Bitmap(0, 0, "res/forest1.png"), "repeat");
	forest1.fillStyle.bitmap.useBuffer = true;
	this.assets.add(forest1);

	var forest2 = new drawing.Rect(0, 0, 10000, 1000);
	forest2.z = 6;
	forest2.fillStyle = new drawing.Pattern(new visual.Bitmap(0, 0, "res/forest2.png"), "repeat");
	forest2.fillStyle.bitmap.useBuffer = true;
	this.assets.add(forest2);

	fog = new drawing.Rect(0, 0, 10000, 1000);
	fog.z = 7;
	fog.fillStyle = new drawing.Pattern(new visual.Bitmap(0, 0, "res/fog.png"), "repeat");
	fog.fillStyle.bitmap.useBuffer = true;
	this.assets.add(fog);

	var dude = new Dude(50, 400);
	dude.z = 1000;
	this.assets.add(dude);

	rocket = new Rocket(-100, -200);
	this.assets.add(rocket);

	brokenWall = new dream.visual.Bitmap(-100,100, "res/sprites.xml#tree-broken");
	this.assets.add(brokenWall)


	var self = this;

	this.behavior.actions.add(new behavior.Action(function(){
		if(dude.top > sky.rect.bottom){
			self.onGameOver.dispatch()
		}else if(dude.top < 0){
			dude.behaviors.motionY.velocity = 0
			dude.top = 0;
		}

		self.camera.left = dude.left - 50;

		var l = dude.left - 800;

		filter.left = sky.left = l + 740 - self.left;

		islands.left = l *.99

		clouds1.left = l *.98
		clouds2.left = l *.95

		forest1.left = l *.8
		forest2.left = l *.6

		fog.left = l * .85
		// return;


		for(var j = 0; j < self.trees.length; j++){
			var w = self.trees[j];
			if(w.texture != brokenWall.texture && dude.boundary.hasIntersectWith(w.boundary)){
				self.onGameOver.dispatch();
			}
			for(var i = 0; i < rockets.length; i++){
				var r = rockets[i];
				if(w.boundary.hasIntersectWith(r.boundary)){
					w.texture = brokenWall.texture;
					self.assets.remove( (rockets.splice(i, 1))[0] );
					i--;
				}else if(!j){
					r.lifeTime ++;
				}
			}
		}
		var i = 0;
		while(rockets[i] && rockets[i].lifeTime > 30){
			self.assets.remove(rockets.shift());
			i ++;
		}
	}))

	function shot(angle){
		var rocket = new Rocket(dude.left + dude.rect.width, dude.top + 18, angle);
		rocket.z = 900
		self.assets.add(rocket)
		rockets.push(rocket)
		var snd = document.getElementById("sndShot")
		// snd.currentTime = 0
		// snd.load();
		snd.play();
		// new Audio('res/shot.wav').play();
		self.behaviors.vibrate.init().play()
	}

	var touchX, touchY;

	if(window.TSH) window.removeEventListener("touchstart", TSH);
	window.addEventListener("touchstart", dream.input.onKeyDown.add(TSH = function(e){
		if(!self.started){
			dude.start();
			self.started = true;
		}
		if(e.changedTouches){
			touchX = e.changedTouches[0].pageX;
			touchY = e.changedTouches[0].pageY;
			e.preventDefault();
		}
		// dude.behaviors.motionY.acceleration = -.7;
	}));

	if(window.TEH) window.removeEventListener("touchend", TEH);
	window.addEventListener("touchend", dream.input.onKeyUp.add(TEH = function(e){
		if(e.changedTouches){
			var dx = touchX - e.changedTouches[0].pageX,
			dy = touchY - e.changedTouches[0].pageY;
			e.preventDefault();

			if(Math.abs(dx) < 60 && Math.abs(dy) >20){
				dude.behaviors.motionY.velocity += dy * -.05;
				// dude.behaviors.motionY.acceleration = Math.abs(dy) / dy * -0.05
			}else if(dx < -60 || dy < -60 || dy > 60){
				var angle = Math.atan(dy/dx)/ (Math.PI/180);
				shot(angle)
			}
		}
		// dude.behaviors.motionY.acceleration = .5;
	}));

	// if(window.MWH) window.removeEventListener("touchstart", MWH);
	dream.input.onWheel.add(MWH = function(event){
		if(!self.started){
			dude.start();
			self.started = true;
		}
		var dy = event.wheelDeltaY;
		if(dy) dude.behaviors.motionY.velocity += dy/Math.abs(dy) * .5;
		event.preventDefault();
	});

	window.addEventListener("click", function(event){
		if(!self.started){
			dude.start();
			self.started = true;
		}

		shot();
		console.log(event)
		event.domEvent.preventDefault();
	})

}.inherits(dream.scenery.Scene);
var $ = GameScene.prototype;

dream.event.create($, "onGameOver");

var TreeProvider = function(){
	Provider.call(this);
	this.lastArea = new dream.geometry.Rect;

	this.distance = 800;
	this.height = 800;

}.inherits(Provider);

var $ = TreeProvider.prototype;

$.provide = function(area){

	var l = this.lastArea.right + this.distance - (this.lastArea.right % this.distance);
	while(l < area.right){

		for(var j = 0; j < 4; j++){
			var wall = new Tree(l, 208 * j + 130 );
			wall.z = 900;
			this.pool.add(wall);
		}

		for(var j = 0; j < 2; j++){
			var gigli = new GigliGreen(Math.round( l - Math.random() * this.distance), Math.round( Math.random() * this.height));
			gigli.z = 800
			this.pool.add(gigli);
		}

		for(var j = 0; j < 2; j++){
			var gigli = new GigliRed(Math.round( l - Math.random() * this.distance), Math.round( Math.random() * this.height));
			gigli.z = 800
			this.pool.add(gigli);
		}

		for(var j = 0; j < 2; j++){
			var gigli = new GigliBlue(Math.round( l - Math.random() * this.distance), Math.round( Math.random() * this.height));
			gigli.z = 800
			this.pool.add(gigli);
		}

		l += this.distance;
	}

	this.lastArea = area;
};

Object.defineProperty($, "requiredResources", {
	get: function () {
		var r = new dream.collection.Set;
		var tree = new Tree, gigliGreen = new GigliGreen, gigliRed = new GigliRed;
		r.addArray(tree.requiredResources);
		r.addArray(gigliGreen.requiredResources)
		r.addArray(gigliRed.requiredResources)
		return r;
	}
});

})(window);
