/**
 * 
 */
dream.input = {
	key: {
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
		},
	keys: {
			37:'LEFT',
			9:'TAB',
			38:'UP',
			39:'RIGHT',
			40:'DOWN',
			13:'ENTER',
			16:'SHIFT',
			17:'CTRL',
			18:'ALT',
			19:'PAUSE',
			27:'ESC',
			32:'SPACE',
			48:'NUM0',
			49:'NUM1',
			50:'NUM2',
			51:'NUM3',
			52:'NUM4',
			53:'NUM5',
			54:'NUM6',
			55:'NUM7',
			56:'NUM8',
			57:'NUM9',
			65:'A' ,
			66:'B',
			67:'C',
			68:'D',
			69:'E',
			70:'F',
			71:'G',
			72:'H',
			73:'I',
			74:'J',
			75:'K',
			76:'L',
			77:'M',
			78:'N',
			79:'O',
			80:'P',
			81:'Q',
			82:'R',
			83:'S',
			84:'T',
			85:'U',
			86:'V',
			87:'W',
			88:'X',
			89:'Y',
			90:'Z'
		}
};

/**
 * @param {dream.Screen} screen The Screen to handle input.
 * @constructor
 */
dream.input.InputHandler = function(screen){
	this.mouse =  {
			x: 0, 
			y: 0,
			clientX: 0,
			clientY: 0,
			isDown: false
	};
	
	this.keystatus = {};
	this.keylocks = {};
	
	this.screen = screen;
	
	var input = this;
	this.screen.canvas.addEventListener("mousemove",function(e){
		var x = e.clientX, y = e.clientY;
		
		input.mouse.clientX = x; 
		input.mouse.clientX = y; 
		
		input.mouse.x = x - input.screen.canvas.offsetLeft + scrollX;
		input.mouse.y = y - input.screen.canvas.offsetTop + scrollY;
	},false);
};



dream.input.InputHandler.prototype = {
 
		
};
		
/*
function Mmov(e){
	if (eng.settings.handlehover) 
		eng.select.handlehover(input.mx, input.my);
	if(g._draggingObj && g._draggingObj.draggable){
		if(!g._dragging){
			g._dragging = true;
			g._draggingObj.ondragstart && g._draggingObj.ondragstart();
		}
		g._draggingObj.ondrag();
	};

};

function Mdown(e){
	if (eng.settings.handleclick) if(g._selected=eng.select.getobject(input.mx,input.my)) g._draggingObj = g._selected; 
}

function Mup(e){
	if(g._dragging){
		var obj = eng.select.getobject(input.mx,input.my);
		if(obj) obj.ondrop && obj.ondrop(g._draggingObj);
		g._draggingObj && g._draggingObj.ondragstop && g._draggingObj.ondragstop();  
		g._dragging = false;
		g._draggingObj = undefined;		
	}else{
		g._draggingObj = undefined;		
		var obj = eng.select.getobject(input.mx,input.my);
		if (eng.settings.handleclick && g._selected && (g._selected==obj) ) g._selected.onclick();
	}
};

input.keystatus={};input.keypress={};
input.onkeypress=function (k,fn){if (k in input.key) input.keypress[k]=fn;};

// context managment on input
input.keycontext=null;
input.usecontext=false;

function Kdown(e,keyCode){
	kc=keyCode || e.keyCode || e.which;
	kk=input.keys[kc];
	if (kk) input.keystatus[kk]=true;
	// handle key press
	if (kk in input.keypress) input.keypress[kk]();
}

function Kup(e,keyCode){
	kc=keyCode || e.keyCode || e.which;
	kk=input.keys[kc];
	if (kk) input.keystatus[kk]=false;};

input.keyfuncs={};
input.bind=function (k,fn){input.keyfuncs[k]=[fn];};
input.addbind=function(k,fn){if (input.keyfuncs[k]) input.keyfuncs[k].push(fn); else input.keyfuncs[k]=[fn];};

input.execbinds=function(){
 for (k in input.keyfuncs) if (input.keystatus[k] && input.keyfuncs[k]){
 fns=input.keyfuncs[k];
 for (i=0; i < fns.length; i++) fns[i]();
 };}; // end exec binds

eng.input=input;*/