(function(){

//importing packages
var drawing = dream.visual.drawing,
	interpolator = dream.visual.animation.interpolator,
	Tween = dream.visual.animation.Tween;


init = function(){
	
	gameScreen = new dream.Screen(document.getElementById("mainCanvas"), 640, 640, 640, 1200);
	
	level1 = new dream.scenery.Scene;
	
	level1.assets.add(jumper = new Jumper(100, 100), "jumper");
	
	level1.assets.add(bar1 = new Bar(100, 100));
	
	barManager = new BarManager(level1);
	
	barManager.altitude = 0;
	
	gameScreen.scenes.current = level1;
};

BarManager = function(scene){
	this.bars = [];
	this._altitude = 0;
	this.area = 0;
	this.height = 1500;
	
	this.scene = scene;
};

var $ = BarManager.prototype;

$.generateBars = function(){
	var y = this.height * this.area;
	
	var c = 20;
	
	for(var i=0; i<30; i++){
		var e = Math.random() > 0.4;
		if (e) {
			var b=new Bar(Math.random()*540, i*50 + y);
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
		
		this.generateBars();
	}
});

})();