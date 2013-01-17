(function(window){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.dynamic.interpolator,
	Tween = dream.dynamic.Tween,
	Dynamic = dream.dynamic.Dynamic;


init = function(){
	
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), 640, 400, 640, 1200);
	
	jumper = new Jumper();
	jumper.behaviours.add(new dream.behaviour.LeftBounded(0 + jumper.radius, 640 - jumper.radius), "leftBounded");
	classicScene = null;
		
	startGame();
	
};


startGame = function(){	
	classicScene = new ClassicScene(jumper, gameScreen);
	classicScene.onGameOver.add(function(){
		startGame();
	});
	
	gameScreen.scenes.current = classicScene;
	jumper.jump();
};

ClassicScene = function(jumper, gameScreen){
	dream.scenery.Scene.call(this);
	
	this.top = gameScreen.height;
	this.onResize.add(function(){
		this.top = gameScreen.height;
	});
	
	jumper.top = 0;
	jumper.left = 320;
	this.assets.add(jumper, "jumper");
	
	this.barManager = new BarManager(this);
	
	this.barManager.altitude = 0;
	
	this.dynamics.add(new Dynamic(function(){
		if(!jumper.stat){
			for(var i=0, bar; bar = this.barManager.bars[i]; i++){
				if(jumper.boundary.right > bar.boundary.left && jumper.boundary.left < bar.boundary.right && Math.abs(bar.boundary.top - jumper.boundary.bottom) < 10){
					jumper.top = bar.top;
					jumper.jump();
					break;
				}			
			}
			if(jumper.top - jumper.rect.height > this.anchorY) dream.event.dispatch(this, "onGameOver");
		}else{
			var y = jumper.top + 400;
			if(y < this.anchorY){
				this.anchorY = y;
				this.barManager.altitude = -y;
			}
		}
	})).play();
	
}.inherits(dream.scenery.Scene);
var $ = ClassicScene.prototype;

dream.event.create($, "onGameOver");

BarManager = function(scene){
	this.bars = [];
	this._altitude = 0;
	this.area = -1;
	this.height = 1500;
	
	this.scene = scene;
};
var $ = BarManager.prototype;

$.generateBars = function(){
	var y = this.height * this.area;
	
	var c = 20;
	
	for(var i=0; i<=30; i++){
		var e = Math.random() > 0.4;
		if (e) {
			var b = new Bar(Math.random()*540, -(i*50 + y));
			this.bars.push(b);
			this.scene.assets.add(b);
		}
		
	}
};

Object.defineProperty($, "altitude", {
	get : function() {
		return this._altitude;
	},
	set : function(v) {
		var o = this._altitude;
		this._altitude = v;
		
		if(v >= this.height * (this.area) ){
			this.area++;
			var bm = this;
			bm.generateBars();
		}
	}
});

})(window);