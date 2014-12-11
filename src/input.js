/**
 * 
 */
(function(window){
	
/**
 * @constructor
 */
var InputEvent = function(){
	
};

var $ = InputEvent.prototype;

$.stopPropagation = function(){
	this._isPropagationStopped = true;
};

$.preventDefault = function(){
	this._isDefaultPrevented = true;
};

/**
 * @constructor
 */
var MouseEvent = function(domEvent, screenPosition, local){
	InputEvent.call(this);
	
	this.screenPosition = screenPosition || new dream.geometry.Point; 
	this.position = this.screenPosition;
	
	this.local = local;
	this.domEvent = domEvent;
	
	this._parentStack = [];
	this._localStack = [];
	
}.inherits(InputEvent);

var $ = MouseEvent.prototype;

$.toLocal = function(local){
	this._localStack.push(this.local);
	this._parentStack.push(this.position);
	
	this.position = this.localPosition;
	this.local = local;
	
	return this;
};

$.restore = function(){
	this.position = this._parentStack.pop();
	this.local = this._localStack.pop();
	
	return this;
};

Object.defineProperty($, "localPosition", {
	get : function() {
		return this.local.rect.transformation.unproject(this.position);
	}
});

Object.defineProperty($, "buttons", {
	get : function() {
		return this.domEvent.buttons;
	}
});

Object.defineProperty($, "ctrlKey", {
	get : function() {
		return this.domEvent.ctrlKey;
	}
});

Object.defineProperty($, "shiftKey", {
	get : function() {
		return this.domEvent.shiftKey;
	}
});

Object.defineProperty($, "altKey", {
	get : function() {
		return this.domEvent.altKey;
	}
});

Object.defineProperty($, "metaKey", {
	get : function() {
		return this.domEvent.metaKey;
	}
});

/**
 * @param {dream.Screen} screen The Screen to handle input.
 * @constructor
 */
var InputHandler = function(screen){
	this.mouse = {
			position: new dream.geometry.Point,
			isDown: false
	};
	
	this.screen = screen;
	
	this.interval = 1;
	
	var input = this;
	window.addEventListener("mousemove",function(e){
		var x = e.clientX, y = e.clientY;
		
		input.mouse.position.left = x - input.screen.canvas.offsetLeft + (window.scrollX || document.body.scrollLeft);
		input.mouse.position.top = y - input.screen.canvas.offsetTop + (window.scrollY || document.body.scrollTop);

		screen.raiseMouseMove(new MouseEvent(e, input.mouse.position, screen), new MouseEvent(e, input.mouse.position, screen));

	}, false);
	
	screen.canvas.addEventListener("mousedown",function(e){
		input.mouse.isDown = true;
		screen.raiseMouseDown(new MouseEvent(e, input.mouse.position, screen));
	}, false);

	screen.canvas.addEventListener("mouseout",function(e){
		screen.raiseMouseLeave(new MouseEvent(e, input.mouse.position, screen));
	}, false);

	screen.canvas.addEventListener("mouseover",function(e){
		screen.isHovered = true;
	}, false);

	window.addEventListener("mouseup",function(e){
		input.mouse.isDown = false;
		screen.raiseMouseUp(new MouseEvent(e, input.mouse.position, screen), new MouseEvent(e, input.mouse.position, screen), screen.isDragging ? new MouseEvent(e, input.mouse.position, screen) : false );
		screen.raiseDragStop(new MouseEvent(e, input.mouse.position, screen));
	}, false);

	
};

var Key = {
	'LEFT' : 37,
	'TAB': 9,
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

var KeyMap = {
	37 : 'LEFT',
	9 : 'TAB',
	38 : 'UP',
	39 : 'RIGHT',
	40 : 'DOWN',
	13 : 'ENTER',
	16 : 'SHIFT',
	17 : 'CTRL',
	18 : 'ALT',
	19 : 'PAUSE',
	27 : 'ESC',
	32 : 'SPACE',
	48 : 'NUM0',
	49 : 'NUM1',
	50 : 'NUM2',
	51 : 'NUM3',
	52 : 'NUM4',
	53 : 'NUM5',
	54 : 'NUM6',
	55 : 'NUM7',
	56 : 'NUM8',
	57 : 'NUM9',
	107 : 'PLUS',
	109 : 'MINUS',
	106 : 'ASTERISK',
	111 : 'SLASH',
	65 : 'A',
	66 : 'B',
	67 : 'C',
	68 : 'D',
	69 : 'E',
	70 : 'F',
	71 : 'G',
	72 : 'H',
	73 : 'I',
	74 : 'J',
	75 : 'K',
	76 : 'L',
	77 : 'M',
	78 : 'N',
	79 : 'O',
	80 : 'P',
	81 : 'Q',
	82 : 'R',
	83 : 'S',
	84 : 'T',
	85 : 'U',
	86 : 'V',
	87 : 'W',
	88 : 'X',
	89 : 'Y',
	90 : 'Z'
};

dream.input = {
		InputEvent: InputEvent,
		MouseEvent: MouseEvent,
		InputHandler: InputHandler,
		Key: Key,
		KeySate: {},
};

dream.event.create(dream.input, "onKeyDown");
dream.event.create(dream.input, "onKeyPress");
dream.event.create(dream.input, "onKeyUp");
dream.event.create(dream.input, "onWheel");
dream.event.create(dream.input, "onDeviceMotion");

window.addEventListener("keydown",function(e){
	dream.event.dispatch(dream.input, "onKeyDown", e);
	dream.input.KeySate[KeyMap[e.keyCode]] = true;
}, false);

window.addEventListener("keypress",function(e){
	dream.event.dispatch(dream.input, "onKeyPress", e);
}, false);

window.addEventListener("keyup",function(e){
	dream.event.dispatch(dream.input, "onKeyUp", e);
	dream.input.KeySate[KeyMap[e.keyCode]] = false;
}, false);

window.addEventListener(window.onwheel ? "wheel" : "mousewheel",function(e){
	dream.event.dispatch(dream.input, "onWheel", e);
}, false);

if (window.DeviceMotionEvent){
	window.addEventListener("devicemotion",function(e){
		dream.event.dispatch(dream.input, "onDeviceMotion", e);
	}, false);
}

Object.defineProperty(dream.input, "deviceOrientation", {
	get : function() {
		return window.orientation;
	}
});

})(window);