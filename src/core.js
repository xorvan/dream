/**
 * Prototype Extensions
 */
(function(){
/**
 * 
 * @param base
 */
Function.prototype.inherits = function(base){
	//var b = function(){};
	//b.prototype = base.prototype;
	this.prototype = new base;
	this._superClass = base;
	this.prototype.constructor = this;
	return this;
};

})();


/**
 * @namespace This is DreamJS root package.
 */
dream = {};

dream.fc = 0;

dream.DEBUG = false;

/**
 * @constructor
 */
dream.Screen = function(canvas, width, height, frameRate){

	var screen = this;
	
	var SceneList = function(){
		dream.util.Selector.call(this);
	}.inherits(dream.util.Selector);

	
	SceneList.prototype.selectObject = function(scene){
		SceneList._superClass.prototype.selectObject.call(this, scene);
		
		scene.assets.prepare(function(){
			screen.init(scene);
		});
	};

	this.fc = 0;
	
	this.canvas = canvas;
	
	this.canvas.width = this.canvas.offsetWidth;
	this.canvas.height = this.canvas.offsetHeight;
	
	this.context = this.canvas.getContext("2d");
	
	this.viewport = new dream.Rect(0, 0, width || this.canvas.width, height || this.canvas.height);

	this.calcScaleFactor();
	
	this.buffer = new dream.util.BufferCanvas(this.viewport.width, this.viewport.height);
	
	this.input = new dream.input.InputHandler(this);
	this.scenes = new SceneList;
	
	this.requestAnimationFrameFunction = dream.util.getRequestAnimationFrame(frameRate);
	this.cancelRequestAnimationFrameFunction = dream.util.getCancelRequestAnimationFrame(frameRate);
};

dream.Screen.prototype.init = function(scene){
	scene.redrawRegions.add(this.viewport);
	this.render();
};

dream.Screen.prototype.pause = function(){
	var craf = this.cancelRequestAnimationFrameFunction;
	craf(this._AFID);
};

dream.Screen.prototype.resume = function(){
	this.render();
};

// TODO removing old render function (without redraw region) 
dream.Screen.prototype.render = function(){
	this.fc++;
	//console.log("salam:"+this.fc);

	for(var i = 0, g; g = this.scene.current.assets.items[i]; i++ )
		g.draw(this.context, new dream.Rect(g.left, g.top, g.width, g.height));
	
	var screen = this, raf = this.requestAnimationFrameFunction; 
	this._AFID = raf(function(){screen.render();});
};

dream.Screen.prototype.render = function(){
	this.fc++;
	dream.fc ++;
	//console.log("salam:"+this.fc);

	this.scenes.current.drawImage(this.context, this.viewport);
	
	var screen = this, raf = this.requestAnimationFrameFunction; 
	this._AFID = raf(function(){screen.render();});
};

dream.Screen.prototype.calcScaleFactor = function() {
	var xf = this.canvas.offsetWidth / this.viewport.width;
	var yf = this.canvas.offsetHeight / this.viewport.height;
	var sf = xf;
	if (yf < xf)
		sf = yf;
	this.scaleFactor = sf;
};

dream.Screen.prototype.highlite = function(rect) {
	this.context.setStrokeColor(0xff0000);this.context.strokeRect(rect.left, rect.top, rect.width, rect.height)
}

/**
 * @constructor
 */
dream.Point = function(left, top){
	this.left = left || 0;
	this.top = top || 0;
};

/**
 * @constructor
 */
dream.Rect = function(left, top, width, height){
	this.width = width || 0;
	this.height = height || 0;
	
	this.left = left || 0;
	this.top = top || 0;
};

Object.defineProperty(dream.Rect.prototype, "right", {
	get : function () { return this.left + this.width;}
});

Object.defineProperty(dream.Rect.prototype, "bottom", {
	get : function () { return this.top + this.height;}
});

// TODO Select one implementation
dream.Rect.prototype.hasIntersectWith = function(rect){
	return ( ((this.left>=rect.left && this.left<=rect.right) || (this.right>=rect.left && this.right<=rect.right) || (this.left<=rect.left && this.right>=rect.right)) &&
		((this.top>=rect.top && this.top<=rect.bottom) || (this.bottom>=rect.top && this.bottom<=rect.bottom) || (this.top<=rect.top && this.bottom>=rect.bottom)) );
};

dream.Rect.prototype.hasIntersectWith = function(rect){
	return !(this.left < rect.left && this.right < rect.left) && 
		!(this.right > rect.right && this.left > rect.right) && 
		!(this.top < rect.top && this.bottom < rect.top) && 
		!(this.bottom > rect.bottom && this.top > rect.bottom);
};

dream.Rect.prototype.add = function(rect){
	var r = new dream.Rect(this.left<rect.left?this.left:rect.left, this.top<rect.top?this.top:rect.top);
	r.width = (this.right>rect.right?this.right:rect.right) - r.left;
	r.height = (this.bottom>rect.bottom?this.bottom:rect.bottom) - r.top;
	return r;
};

dream.Rect.prototype.clone = function(){
	return new dream.Rect(this.left, this.top, this.width, this.height);
};
