(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.visual.animation.interpolator,
	Tween = dream.visual.animation.Tween,
	Step = dream.visual.animation.Step;


init = function(){
	
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), 640, 640, 640, 1200);
		
	
	gameScreen.keyBindings.add(new dream.input.KeyBinding(function(i){jumper.left += Math.min(i,10);}, dream.input.key.RIGHT));
	gameScreen.keyBindings.add(new dream.input.KeyBinding(function(i){jumper.left -= Math.min(i,10);}, dream.input.key.LEFT));
	
	if (window.DeviceMotionEvent){
		// Position Variables
		var x = 0;
		   
		// Speed - Velocity
		var vx = 0;
		  
		// Acceleration
		var ax = 0;
		   
		var delay = 10;
		var vMultiplier = 0.05;
		
		window.ondevicemotion = function(event) {
	   	 
			ax = window.orientation ? event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
		};
	 	
		setInterval(function() {
			vx = ax *3;
	 
			x = parseInt(x + vx);
			
			if (x - jumper.radius < 0) { x = jumper.radius; vx = 0; }
			if (x + jumper.radius > gameScreen.width) { x = gameScreen.width - jumper.radius; vx = 0; }
			
			jumper.left = x;
		}, delay);

//		setInterval(function() {
//		vx = vx + ax;
// 
//		x = parseInt(x + vx * vMultiplier);
//		
//		if (x - jumper.radius < 0) { x = jumper.radius; vx = 0; }
//		if (x + jumper.radius > gameScreen.width) { x = gameScreen.width - jumper.radius; vx = 0; }
//		
//		jumper.left = x;
//	}, delay);

	}
	
	startGame();
	
};


startGame = function(){
	level1 = new dream.scenery.Scene;
	level1.onResize.add(function(){
		this.top = gameScreen.height;
	});
	
	level1.assets.add(jumper = new Jumper(100, 0), "jumper");
	
	barManager = new BarManager(level1);
	
	barManager.altitude = 0;
	
	level1.steps.add(new Step(function(){
		if(!jumper.stat){
			for(var i=0, bar; bar = barManager.bars[i]; i++){
				if(jumper.boundary.right > bar.boundary.left && jumper.boundary.left < bar.boundary.right && Math.abs(bar.boundary.top - jumper.boundary.bottom) < 10){
					console.log(Math.abs(bar.boundary.top - jumper.boundary.bottom));
					jumper.top = bar.boundary.top;
					jumper.jump();
					break;
				}			
			}
			if(jumper.boundary.top > level1.anchorY) startGame();
		}else{
			var y = jumper.top + 500;
			if(y < level1.anchorY){
				level1.anchorY = y;
				barManager.altitude = -y;
			}
		}
	}));
	
	gameScreen.scenes.current = level1;
		
	jumper.jump();
};

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