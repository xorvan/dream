(function(window){

//importing packages
var drawing = dream.visual.drawing,
	dynamic = dream.dynamic,
	bt = dream.behavior,
	interpolator = dream.behavior.animation.interpolator,
	Tween = dream.behavior.animation.Tween,
	Provider = dream.provider.Provider,
	List = dream.collection.List,
	Text = dream.visual.drawing.Text,
	behavior = dream.behavior,
	Dynamic = dream.behavior.Action;

width = 640;

// var rockets = [], walls = [];


init = function(){
	console.log("init")
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), width, 400, width, 1200);
		
	menuScene = gameScreen.scenes.add(new MenuScene);
	gameScreen.scenes.current = menuScene;
	
	// if(window.initStat) initStat();

	startGame();
};


startGame = function(){

	rockets = [], walls = [];
	gameScene = gameScreen.scenes.current = new GameScene();
	gameScene.onGameOver.add(function(){
		console.log("Game Over!");
		startGame();	
	});
	gameScene.isImageChanged = true;

};

MenuScene = function(jumper, gameScreen){
	dream.scenery.Scene.call(this);
	
	this.title = this.assets.add(new Text(width/2, 100, "Well Jump"));	
	this.title.fontSize = 60;
	this.title.align = drawing.Align.CENTER;

	this.score = this.assets.add(new Text(width/2, 200, ""));	
	this.score.fontSize = 40;
	this.score.align = drawing.Align.CENTER;
	
	this.startButton = this.assets.add(new StartGameButton((width - 200)/2, 400));
	this.startButton.onClick.add(function(){
		startGame();
	});
	
	
}.inherits(dream.scenery.Scene);

GameScene = function(){
	dream.scenery.Scene.call(this);
	// this.isDirty = true;
	// this.rect.height = gameScreen.height;
	// this.rect.width = gameScreen.width;

	dude = new Dude(100, 200);
	this.assets.add(dude);

	rocket = new Rocket(-100, -200);
	this.assets.add(rocket);

	var k = 0;
	for(var i = 1; i < 10; i++){
		for(var j = 0; j < 4; j++){
			var wall = walls[k] = ww=new Wall(i * 800, 165 * j);
			this.assets.add(wall);
			k++;
		}

	}

	brokenWall = new dream.visual.Bitmap(-100,100, "res/wall_broken.png");
	this.assets.add(brokenWall)


	var self = this;

	this.behavior.actions.add(new behavior.Action(function(){
		if(dude.top > gameScreen.height){
			self.onGameOver.dispatch()
		}else if(dude.top < 0){
			dude.behaviors.motionY.velocity = 0
			dude.top = 0;
		}

		self.camera.left = dude.left - 100;

		for(var j = 0; j < walls.length; j++){
			var w = walls[j];
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
		self.assets.add(rocket)	
		rockets.push(rocket)	
	}

	var touchX, touchY;

	window.addEventListener("touchstart", dream.input.onKeyDown.add(function(e){
		if(!self.started){
			dude.start();
			self.started = true;
		}
		if(e.changedTouches){
			touchX = e.changedTouches[0].pageX;
			touchY = e.changedTouches[0].pageY;
			e.preventDefault();			
		}
		dude.behaviors.motionY.acceleration = -.8;
	}));

	window.addEventListener("touchend", dream.input.onKeyUp.add(function(e){
		if(e.changedTouches){
			var dx = touchX - e.changedTouches[0].pageX,
			dy = touchY - e.changedTouches[0].pageY;
			e.preventDefault();

			if(dx < -60 || dy < -60 || dy > 60){
				var angle = Math.atan(dy/dx)/ (Math.PI/180);
				shot(angle)
			}
		}
		dude.behaviors.motionY.acceleration = .6;
	}));

	this.onClick.add(function(){
		shot();
	})

}.inherits(dream.scenery.Scene);
var $ = GameScene.prototype;

dream.event.create($, "onGameOver");


})(window);