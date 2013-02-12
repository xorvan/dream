(function(window){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.dynamic.interpolator,
	Tween = dream.dynamic.Tween,
	Provider = dream.provider.Provider,
	List = dream.collection.List,
	Text = dream.visual.drawing.Text,
	Dynamic = dream.dynamic.Dynamic;

width = 640;

init = function(){
	
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), width, 400, width, 1200);
	
	jumper = new Jumper();
	jumper.behaviours.add(new dream.behaviour.LeftBounded(0 + jumper.radius, width - jumper.radius), "leftBounded");
	gameScene = null;
	
	menuScene = gameScreen.scenes.add(new MenuScene);
	gameScreen.scenes.current = menuScene;
	
	//startGame();
	
};


startGame = function(){
	
	gameScene = gameScreen.scenes.current = new GameScene(jumper, gameScreen);
	gameScene.onGameOver.add(function(){
		console.log("Game Over!");
		menuScene.score.text = "Score: " + gameScene.score.text;
		gameScreen.scenes.current = menuScene;
		
	});
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

GameScene = function(jumper, gameScreen){
	dream.scenery.Scene.call(this);

	this.rate = 50000;
	
	this.top = gameScreen.height;
	this.onResize.add(function(){
		this.top = gameScreen.height;
	});
	jumper.top = 0;
	jumper.left = 320;
	jumper.step();
	this.assets.add(jumper, "jumper");
	jumper.jump();
	
	this.score = this.assets.add(new Text(30, -30, "0"));
	this.score.fontSize = 30;
	this.score.z = 5;
	//this.score.fillStyle = "#000";
	
	this.providers.add(new BarProvider, "bars");
	
	this.bars = new List;
	
	var scene = this;
	this.pool.onAdd.add(function(obj){
		if(obj instanceof Bar)
			scene.bars.add(obj);
	});

	this.pool.onRemove.add(function(obj){
		scene.bars.remove(obj);
	});
	
	this.dynamics.add(new Dynamic(function(){
		if(!jumper.stat){
			for(var i=0, bar; bar = this.bars[i]; i++){
				if(jumper.boundary.right > bar.boundary.left && jumper.boundary.left < bar.boundary.right && Math.abs(bar.boundary.top - jumper.boundary.bottom) < 10){
					var t;
					if(t = bar.hit(jumper.origin)){
						jumper.top = bar.top;
						jumper.jump(t);
						break;
					}
				}			
			}
			if(jumper.boundary.top > this.anchorY){
				console.log("go")
				dream.event.dispatch(this, "onGameOver");
			}
		}else{
			var y = jumper.top + 400;
			if(y < this.anchorY){
				this.score.top = y - 30;
				var s = -y|0;
				this.score.text = s;
				this.anchorY = y;
				this.providers.bars.difficulty = 1-(this.rate-s)/this.rate;
			}
		}
	})).play();
	
}.inherits(dream.scenery.Scene);
var $ = GameScene.prototype;

dream.event.create($, "onGameOver");


var BarProvider = function(){
	Provider.call(this);
	this.lastArea = new dream.Rect;
	this.lastH = 0;
	
	this.difficulty = 0;
	
}.inherits(Provider);
	
var $ = BarProvider.prototype;

$.provide = function(area){

	var step = 50,
		jumpHeight = 200;
	
	var y = area.bottom,
		c = area.height / step;
	
	for(var i=0; i<=c; i++){
		var h = y - i*step;
		if (h < this.lastArea.top){
			if(this.lastH - h > jumpHeight || Math.random() > this.difficulty){
				this.lastH = h;
				if(Math.random() > 0.9){
					this.pool.add(new ElasticBar(Math.random()*540, h));
				}else{
					this.pool.add(new Bar(Math.random()*540, h));
				}
			}else{
				if(Math.random() > 0.5)
					this.pool.add(new BreakableBar(Math.random()*540, h));
			}
			
		}
		
	}
	this.lastArea = area;
};


})(window);