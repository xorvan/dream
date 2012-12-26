(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.visual.animation.interpolator,
	Tween = dream.visual.animation.Tween,
	Step = dream.visual.animation.Step;


init = function(){
	
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), 640, 400, 640, 1200);
	
	gameScreen.keyBindings.add(new dream.input.KeyBinding(function(i){jumper.left += Math.min(i,10);}, dream.input.Key.RIGHT));
	gameScreen.keyBindings.add(new dream.input.KeyBinding(function(i){jumper.left -= Math.min(i,10);}, dream.input.Key.LEFT));
	
	jumper = new Jumper();
	jumper.behaviours.add(new dream.behaviour.LeftBounded(0+jumper.radius,640-jumper.radius));
	classicScene = null;
	
	gameScreen.onDeviceMotion.add(function(event){
		var a = this.orientation ? event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
		jumper.behaviours.moving.vx = a * 3;
	});
	
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
	
	jumper.tweens.clear();
	jumper.top = 0;
	jumper.left = 320;
	this.assets.add(jumper, "jumper");
	
	this.barManager = new BarManager(this);
	
	this.barManager.altitude = 0;
	
	this.steps.add(new Step(function(){
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
	}));
	
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
			this.generateBars();			
		}
	}
});

})();