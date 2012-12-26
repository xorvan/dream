/**
 * 
 */
dream.input = {};

dream.input.MouseState = function(){
	dream.Point.call(this);
	
	this.clientX =  0;
	this.clientY =  0;
	this.isDown =  false;
	
}.inherits(dream.Point);

dream.input.MouseState.prototype.clone = function(){
	var r = new dream.input.MouseState();
	for(var i in this){
		r[i] = this[i];
	}
	return r;
};

/**
 * @param {dream.Screen} screen The Screen to handle input.
 * @constructor
 */
dream.input.InputHandler = function(screen){
	this.mouse =  new dream.input.MouseState();
	
	this.downKeys = {};
	
	this.screen = screen;
	
	var input = this;
	window.addEventListener("mousemove",function(e){
		var x = e.clientX, y = e.clientY;
		
		input.mouse.clientX = x;
		input.mouse.clientX = y;
		
		input.mouse.left = x - input.screen.canvas.offsetLeft + scrollX;
		input.mouse.top = y - input.screen.canvas.offsetTop + scrollY;
		
		screen.raiseMouseMove(input.mouse);
		if(input.mouse.isDown) screen.raiseDrag(input.mouse);
	}, false);
	
	screen.canvas.addEventListener("mousedown",function(e){
		input.mouse.isDown = true;
		screen.raiseMouseDown(input.mouse);
	}, false);

	screen.canvas.addEventListener("mouseout",function(e){
		screen.raiseMouseOut(input.mouse);
	}, false);
	
	window.addEventListener("mouseup",function(e){
		input.mouse.isDown = false;
		screen.raiseMouseUp(input.mouse);
		screen.raiseDragStop(input.mouse);
	}, false);

	window.addEventListener("keydown",function(e, keyCode){
		var kc = keyCode || e.keyCode || e.which;
		console.log(kc);
		if(!input.downKeys[kc]) input.downKeys[kc] = 1;
		dream.event.dispatch(screen, "onKeyDown");
	}, false);

	window.addEventListener("keyup",function(e, keyCode){
		var kc = keyCode || e.keyCode || e.which;
		delete input.downKeys[kc];
		dream.event.dispatch(screen, "onKeyUp");
	}, false);
	
	if (window.DeviceMotionEvent){
		window.addEventListener("devicemotion",function(e){
			dream.event.dispatch(screen, "onDeviceMotion", e);
		}, false);
	}
	
};

dream.input.InputHandler.prototype = {
 
		
};


/**
 * @constructor
 */
dream.input.KeyBinding = function(fn, key){
	this.fn = fn;
	this.key = key;
};

dream.input.Key = {
	'LEFT' : 37,
	'TAB':9,
	'UP' : 38,
	'RIGHT' : 39,
	'DOWN' : 40,
	'ENTER' : 13,
	'SHIFT' : 16,
	'CTRL' : 17,
	'ALT' : 18,
	'PAUSE' : 19,
	'ESC' : 27,
	'SPACE' : 32,
	'NUM0' : 48,
	'NUM1' : 49,
	'NUM2' : 50,
	'NUM3' : 51,
	'NUM4' : 52,
	'NUM5' : 53,
	'NUM6' : 54,
	'NUM7' : 55,
	'NUM8' : 56,
	'NUM9' : 57,
	'PLUS' : 107,
	'MINUS' : 109,
	'ASTERISK' : 106,
	'SLASH' : 111,
	'A' : 65,
	'B' : 66,
	'C' : 67,
	'D' : 68,
	'E' : 69,
	'F' : 70,
	'G' : 71,
	'H' : 72,
	'I' : 73,
	'J' : 74,
	'K' : 75,
	'L' : 76,
	'M' : 77,
	'N' : 78,
	'O' : 79,
	'P' : 80,
	'Q' : 81,
	'R' : 82,
	'S' : 83,
	'T' : 84,
	'U' : 85,
	'V' : 86,
	'W' : 87,
	'X' : 88,
	'Y' : 89,
	'Z' : 90
};