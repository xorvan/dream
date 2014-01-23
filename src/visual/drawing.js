/**
 * @module drawing
 * @namespace dream.visual.drawing
 */
(function(){

/**
 * the super class for creating *Shapes*, an instance of *Shape* could not be drawn to screen.
 * any subclass of *Shape* should implement a draw function which receives context and origin *Point* as argument
 * @class Shape
 * @param {Number} left
 * @param {Number} top
 * @extends dream.visual.Graphic
 */
var Shape = function(left, top){
	Shape._superClass.call(this, left, top);
	
	this.strokeOffset = 1;
}.inherits(dream.visual.Graphic);

var Shape$ = Shape.prototype;

/**
 * setter/getter property, it's value is/should be an instance of *Style* (and it's subclasses like *Color* or *Gradient*)
 * or it should be color string like #222 or #b2a3c4
 * @property fillStyle
 * @type Object
 */
Object.defineProperty(Shape$, "fillStyle", {
	get: function() {
		return this._fs;
	},
	set: function(v){
		if(this._fs instanceof Gradient)
			this._fs.onChange.removeByOwner(this);

		this._fs = v;
		dream.event.dispatch(this, "onImageChange", [this.boundary.clone()]);
		
		if(this._fs instanceof Style){
			this._fs.onChange.propagateFlagged(this, "isImageChanged");
		}
	}
});

/**
 * setter/getter property, it's value is/should be an instance of *Style* (and it's subclasses like *Color* or *Gradient*)
 * or it should be color string like #222 or #b2a3c4
 * @property strokeStyle
 * @type Object
 */
Object.defineProperty(Shape$, "strokeStyle", {
	get: function() {
		return this._ss;
	},
	set: function(v){
		if(this._ss instanceof Style)
			this._ss.onChange.removeByOwner(this);
		
		this._ss = v;
		dream.event.dispatch(this, "onImageChange", [this.boundary.clone()]);
		
		if(this._ss instanceof Style)
			this._ss.onChange.propagateFlagged(this, "isImageChanged");
	}
});

Shape$._setStrokeOffset = function(w){
	var d = (((w + 1) / 2) | 0) - this.strokeOffset;
	this.strokeOffset += d;
	if(d){
		this.rect.left -= d;
		this.rect.top -= d;
		this.rect.width += d * 2;
		this.rect.height += d * 2;
		this.isBoundaryChanged = true;
	}	
};

/**
 * setter/getters property, it's value is/should be an instance of *LineStyle*
 * @property lineStyle
 * @type Object
 */
Object.defineProperty(Shape$, "lineStyle", {
	get: function() {
		return this._ls;
	},
	set: function(v){
		dream.util.assert(v instanceof LineStyle, "lineStyle must be instanceof LineStyle!");
		this._ls = v;
		this.isImageChanged = true;
		
		this._setStrokeOffset(v.width);
		var shape = this;
		this._ls.onChange.add(function(){
			shape._setStrokeOffset(v.width);
			shape.isImageChanged = true;
		});
	}
});




Shape$.paint = function(context, origin){
	this.draw(context, origin);
	
	var r = this.rect;
	if(this._ls){
		context.lineWidth=this._ls._width;
		context.lineCap=this._ls._cap;
		context.lineJoin=this._ls._join;
		if (this._ls._join == LineStyle.Join.MITER)
			context.miterLimit= this._ls._miterLimit;
		}
	if(this._fs) {
		context.fillStyle = this._fs instanceof Style ? this._fs.createStyle(context, new dream.geometry.Rect(r.left + origin.left, r.top + origin.top, r.width, r.height)) : this._fs;
		context.fill();
	}
	if(this._ss){
		context.strokeStyle = this._ss instanceof Style ? this._ss.createStyle(context, new dream.geometry.Rect(r.left + origin.left, r.top + origin.top, r.width, r.height)) : this._ss;
		context.stroke();
	}
};



/**
 * this class creates a Rectangular shape based on four arguments given to it.
 * @class Rect
 * @param {Number} left
 * @param {Number} top
 * @param {Number} width
 * @param {Number} height
 * @constructor
 * @extends dream.visual.drawing.Shape 
 */
var Rect = function(left, top, width, height){
	Shape.call(this, left, top);
	this._width = 0;
	this._height = 0;
	this.width = width;
	this.height = height;
	
}.inherits(Shape);

var Rect$ = Rect.prototype;

Rect$.draw = function(context, origin){
	context.beginPath();
	context.rect(origin.left, origin.top, this.width, this.height);
	context.closePath();
}

//$.paint = function(context, origin){
//	Shape.prototype.paint.call(this, context, origin);
//	if(this.fillStyle) context.fillRect(origin.left, origin.top, this.width, this.height);
//	if(this.strokeStyle) context.strokeRect(origin.left, origin.top, this.width, this.height);
//};

/**
 * setter/getter property for width of *Rect*
 * @property width
 * @type {Number}
 */
Object.defineProperty(Rect$, "width", {
	get: function() {
		return this._width;
	},
	set: function(v){
		this.rect.left = -this.strokeOffset;
		this.rect.width = v + this.strokeOffset*2;
		this._width = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
	}
});

/**
 * setter/getter property for height of *Rect*
 * @property height
 * @type {Number}
 */
Object.defineProperty(Rect$, "height", {
	get: function() {
		return this._height;
	},
	set: function(v){
		this.rect.top = -this.strokeOffset;
		this.rect.height = v + this.strokeOffset*2;
		this._height = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
	}
});

/**
 * the super class for creating circular *Shapes*, any class that inherits from *CircularShape* should implement 
 * draw method and also it has a radius property as well
 * @class CircularShape
 * @param {Number} left
 * @param {Number} top
 * @param {Number} radius
 * @extends dream.visual.drawing.Shape
 */
var CircularShape = function(left, top, radius){
	Shape.call(this, left, top);
	this.radius = radius;
}.inherits(Shape);

var CircularShape$ = CircularShape.prototype;

/**
 * setter/getter property for radius of any *CircularShape*, like circle, Star, Poly etc.
 * @property radius
 * @type {Number}
 */
Object.defineProperty(CircularShape$, "radius", {
	get: function() {
		return this._radius;
	},
	set: function(v){
		this._radius = v;
		this.rect.width = this.rect.height = v*2 + this.strokeOffset*2;
		this.rect.left = this.rect.top = - v - this.strokeOffset;
		this.isBoundaryChanged=true;
		this.isImageChanged=true;
	}
});

/**
 * create a circle with given parameters
 * @class Circle
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} radius
 * @extends dream.visual.drawing.CircularShape
 */
var Circle = function(left, top, radius){
	CircularShape.call(this, left, top, radius);
}.inherits(CircularShape);

Circle.prototype.draw = function(context, origin){
	context.beginPath();
	context.arc(origin.left, origin.top, this._radius, 0, Math.PI * 2, true);
	context.closePath();
};

/**
 * create a Ellipse with given parameters
 * @class Ellipse
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} radiusX
 * @param {Number} radiusY
 * @extends dream.visual.drawing.CircularShape
 */

var Ellipse = function(left, top, radiusX, radiusY){
	Shape.call(this, left, top);	
	this.radiusX = radiusX;
	this.radiusY = radiusY;
	
}.inherits(Shape);

var Ellipse$ = Ellipse.prototype;

Ellipse$.draw = function(context, origin){
	context.scale(1, this._radiusY / this._radiusX);
	context.beginPath();
	context.arc(origin.left, origin.top * this._radiusX / this._radiusY, this._radiusX, 0, Math.PI * 2, true);
	context.closePath();
}; 

/**
 * setter/getter property for radiusX which determines radius of *Ellipse* in X direction
 * @property radiusX
 * @type {Number}
 */
Object.defineProperty(Ellipse$, "radiusX", {
	get: function() {
		return this._radiusX;
	},
	set: function(v){
		this._radiusX = v;
		this.rect.left = -v - this.strokeOffset;
		this.rect.width = (v + this.strokeOffset) * 2;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
	}
});

/**
 * setter/getter property for radiusX which determines radius of *Ellipse* in Y direction
 * @property radiusY
 * @type {Number}
 */
Object.defineProperty(Ellipse$, "radiusY", {
	get: function() {
		return this._radiusY;
	},
	set: function(v){
		this._radiusY = v;
		this.rect.top = -v - this.strokeOffset;
		this.rect.height = (v + this.strokeOffset) * 2;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
	}
});


/**
 * create a slice of a circle, the angle parameter determines the degree at which circle should be cut, it starts 
 * at degree 0 (center right of a circle) and grows clockwise,
 *  (if you need another starting degree you can rotate the shape(
 * @class CircleSlice
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} radius
 * @param {Number} angle
 * @extends dream.visual.drawing.CircularShape
 */
var CircleSlice = function(left, top, radius, angle){
	CircularShape.call(this, left, top, radius);
	this._angle = angle;
}.inherits(CircularShape);

var CircleSlice$ = CircleSlice.prototype;

/**
 * setter/getter property for angle of *CircleSlice*
 * @property angle
 * @type {Number}
 */
dream.util.createFlagProperty(CircleSlice$,"angle","isImageChanged");

CircleSlice$.draw = function(context, origin){
	context.translate(origin.left, origin.top);
	context.beginPath();
	var angs = this._angle * Math.PI / 180;
	context.lineTo(this._radius, 0);
	context.moveTo(0, 0);
	context.arc(0, 0, this._radius, 0, angs, false);
	context.rotate(angs);
	context.closePath();
};

/**
 * create a Polygon with given parameters. the sides parameter/property sets the number of sides in te *Poly*,
 * for example 3 sides create a triangle, 4 creates a rectangle and so on.
 * @class Poly
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} radius
 * @param {Number} sides
 * @extends dream.visual.drawing.CircularShape
 */
var Poly = function (left, top, radius, sides){
	CircularShape.call(this, left, top, radius);
	this._sides = sides;
}.inherits(CircularShape);
var Poly$ = Poly.prototype;

/**
 * setter/getter property for sides of *Poly*
 * @property sides
 * @type {Number}
 */
dream.util.createFlagProperty(Poly$,"sides","isImageChanged");

Poly$.draw = function(context, origin){
	context.translate(origin.left, origin.top);
	var ang = 2  * Math.PI / this.sides;
	context.rotate(Math.PI / -2);
	context.beginPath();
	var s = Math.abs(this.sides) + 0.5 | 0;
	for (var i=0; i < s; i++){
		context.rotate(ang);
		context.lineTo(this.radius, 0);
	}
	context.closePath();
};

/**
 * create a star with given parameters. radius determines external radius of the star and
 *  radius 2 determines internal radius, points parameter determines the number of rays of *Star*
 * @class Star
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} radius
 * @param {Number} sides
 * @extends dream.visual.drawing.CircularShape
 */
var Star=function (left, top, radius, radius2, points){
	Shape.call(this, left, top);
	this.radius = radius;
	this.radius2 = radius2;
	this.points = points;
}.inherits(Shape);

var Star$ = Star.prototype;

Object.defineProperty(Star$, "radius", {
	get: function() {
		return this._radius;
	},
	set: function(v){
		this._radius = v;
		if(this._radius > this._radius2){
			this.rect.width = this.rect.height = v*2 + this.strokeOffset*2;
			this.rect.left = this.rect.top = -v - this.strokeOffset;
			this.isBoundaryChanged = true;
		}
		this.isImageChanged=true;
	}
});

/**
 * setter/getter property for points of *Star*
 * @property radius2
 * @type {Number}
 */
Object.defineProperty(Star$, "radius2", {
	get: function() {
		return this._radius2;
	},
	set: function(v){
		this._radius2 = v;
		if(this.radius2 > this._radius){
			this.rect.width = this.rect.height = v*2 + this.strokeOffset*2;
			this.rect.left = this.rect.top = -v - this.strokeOffset;
			this.isBoundaryChanged = true;
		}
		this.isImageChanged=true;
	}
});

/**
 * setter/getter property for points of *Star*
 * @property points
 * @type {Number}
 */
dream.util.createFlagProperty(Star$,"points","isImageChanged");

Star$.draw = function(context, origin){
	var ang = Math.PI/(this.points);
	context.translate(origin.left, origin.top);
	context.rotate(Math.PI/-2);
	context.beginPath();
	var s = 2 * Math.abs(this.points |0);
	for (var i=0; i < s; i++){
		context.rotate(ang);
		if (i % 2 == 0){
			context.lineTo(this.radius, 0);
		}else context.lineTo(this.radius2, 0);
	} // end for
	context.closePath();
};

/**
 * @constructor
 */

var Text = function(left, top, text, font, dir){
	Shape.call(this, left, top);
	this.text = text;
	this.font = font;
	this._updateRect();
	this.heightFactor = 1.4;
	this._baseline = "alphabetic";
	this._align = "start";
	this.direction = dir || "ltr";

}.inherits(Shape);

var Text$ = Text.prototype;

Object.defineProperty(Text$, "text", {
	get: function() {
		return this._text;
	},
	set: function(v){
		this._text = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
		this._updateRect();
	}
});

Object.defineProperty(Text$, "direction", {
	get: function() {
		return this._dir;
	},
	set: function(v){
		this._dir = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
		this._updateRect();
	}
});
Object.defineProperty(Text$, "font", {
	get: function() {
		return this._font;
	},
	set: function(v){
		this._font = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
		this._updateRect();
	}
});
Object.defineProperty(Text$, "fontSize", {
	get: function() {
		return this._font ? parseInt(this._font.split('px')[0]):10;
	},
	set: function(v){
		if (this._font)
			this._font = v+"px"+this._font.split('px')[1];
		else
			this._font = v+"px arial";
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
		this._updateRect();
	}
});
Object.defineProperty(Text$, "fontFace", {
	get: function() {
		return this._font ? this._font.split('px')[1].trim():"arial";
	},
	set: function(v){
		if (this._font)
			this._font = this._font.split('px')[0]+"px "+v;
		else
			this._font = "10px "+v;
		this.isImageChanged = true;
		this._updateRect();
	}
});
Object.defineProperty(Text$, "align", {
	get: function() {
		return this._align;
	},
	set: function(v){
		if(v=="start" || v=="end" || v=="left" || v=="right" || v=="center"){
			this._align = v;
			this.isImageChanged = true;
			this._updateRect();
		}else{
			console.error("Wrong align property!");
		}
	}
});
Object.defineProperty(Text$, "baseline", {
	get: function() {
		return this._baseline;
	},
	set: function(v){
		if(v=="top" || v=="middle" || v=="bottom" || v=="alphabetic" || v=="hanging" || v=="ideographic"){
			this._baseline = v;
			this.isImageChanged = true;
			this.isBoundaryChanged = true;
			this._updateRect();
		}else{
			console.error("Wrong baseline value");
			
			}
		}
});

Text$._updateRect = function(){
	ctx = this.image.getContext('2d')
	var fontSize = parseInt(ctx.font.split('px')[0])
	var m = ctx.measureText(this._text);
	this.rect.width = m.width;
	this.rect.height = fontSize * this.heightFactor;
	switch(this._baseline){
		case "top":
			this.rect.top = (this.heightFactor - 1) * this.fontSize * -0.5;
			break;
		case "bottom":
			this.rect.top = (1 + (this.heightFactor - 1)/2) * this.fontSize * -1;
			break;
		case "alphabetic":
			this.rect.top = (1 + (this.heightFactor - 1)/2) * this.fontSize * -0.8;
			break;
		case "middle":
			this.rect.top = this.heightFactor * this.fontSize * -0.5;
			break;
		case "hanging":
			this.rect.top = ((this.heightFactor - 1)/3 + 0.1) * this.fontSize * -1;
			break;
		case "ideographic":
			this.rect.top = (1 + (this.heightFactor - 1)/2) * this.fontSize * -0.92;
			break;	
	}
	switch(this._align){
		case "center":
			this.rect.left = m.width / -2;
			break;
		case "right":
			this.rect.left = m.width * -1;	 
			break;
		case "end":
			if(this._dir == "ltr"){
				this.rect.left = m.width * -1;
			}else{
				this.rect.left = 0;
			}
			break;
		case "start":
			if(this._dir == "ltr"){
				this.rect.left = 0;
			}else{
				this.rect.left = m.width * -1;
			}
			break;	
		default:
			this.rect.left = 0;
			break;
	}
	//this._update = false;
	this.isBoundaryChanged = true;
};

Text$.draw = function(context, origin){
	context.font = this._font;
	context.textAlign = this._align;
	context.textBaseline = this._baseline;
	// if (this._update)
	// 	this.updateRect(context);
	
	
	//context.restore();
};

Text$.paint = function(context, origin){

	var dirTemp = context.canvas.style.direction;
	context.canvas.style.direction = this._dir;
	this.draw(context, origin);
	
	var r = this.rect;
	if(this._ls){
		context.lineWidth=this._ls._width;
		context.lineCap=this._ls._cap;
		context.lineJoin=this._ls._join;
		if (this._ls._join == LineStyle.Join.MITER)
			context.miterLimit= this._ls._miterLimit;
		}
	if(this._fs) {
		context.fillStyle = this._fs instanceof Style ? this._fs.createStyle(context, new dream.geometry.Rect(r.left + origin.left, r.top + origin.top, r.width, r.height)) : this._fs;
		context.fillText(this._text, origin.left, origin.top);
	}
	if(this._ss){
		context.strokeStyle = this._ss instanceof Style ? this._ss.createStyle(context, new dream.geometry.Rect(r.left + origin.left, r.top + origin.top, r.width, r.height)) : this._ss;
		context.strokeText(this._text, origin.left, origin.top);
	}
	context.canvas.style.direction = this.dirTemp;
};

/**
 * draws the given  {{#crossLink "dream.geometry.Path"}}Path{{/crossLink}} in given position
 * @class Freehand
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Object} path
 * @extends dream.visual.drawing.Shape
 */
var Freehand = function(left, top, path){
	Shape.call(this, left, top);
	this.path = path;
}.inherits(Shape);

var Freehand$ = Freehand.prototype;

Freehand$.draw = function(context, origin){
	context.translate(origin.left, origin.top);
	this.path.draw(context, origin);
};

/**
 * setter/getter property for path to be drawn, note you can change the path or segments of path and everything will
 * be reflected on screen
 * @property path
 * @type {Object}
 */
Object.defineProperty(Freehand$, "path", {
	get: function() {
		return this._path;
	},
	set: function(v){
		var fh = this;
		if(this._path) this._path.onChange.removeByOwner(fh);
		this._path = v;
		this._path.onChange.add(function(obj){
			//console.log("fhcc")
			fh.rect.left = v.rect.left;
			fh.rect.top = v.rect.top;
			fh.rect.width = v.rect.width;
			fh.rect.height = v.rect.height;
			fh.isBoundaryChanged = true;
			fh.isImageChanged = true;
		})();
	}
});

//       definig styles it may become another file alltoghether


/**
 * super class for any style class 
 * @class Style
 */
var Style = function(){
	
};

/**
 * *onChange* event will raise whenever something is changed in a style like changing color or colorstops of 
 * a gradient.
 * @event onChange
 */
dream.event.create(Style.prototype,"onChange");


/**
 * creates a *Color* object which could be used as fillStyle or strokeStyle of shapes,
 *  or could be used in colorStops of *Gradient*s. you can set *Color* both with RGBA and HSB values
 *  or change between them, or even change individual parts of *Color* object with them
 * @class Color
 * @constructor
 * @param  SR 
 * this parameter should be color string, either 3 digit color like "#222" or 6 digit color like "#2a2b3c"
 * or it will be a number between 0 and 255 which is represented as red value of the color
 * constructor determine it based on type of this parameter
 * @param {Number} G 
 * the green value of color
 * @param {Number} B 
 * the blue vlue of color
 * @param {Number} A 
 * the alpha value of color between 0 and 1, default is 1
 * @extends dream.visual.drawing.Style
 * @example
 * var col = new dream.drawing.Color("#333",null,null, 0.5);
 * @example
 * var col = new dream.drawing.Color(120,120,35, 0.6);    
 * var H = col.hue;    
 * col.saturation = 0.5;
 * @example
 * var col = new dream.drawing.Color(0,0,0,1).setHSB(210, 0.6, 0.8)
 */
var Color = function(sr,g,b,a){
	this._hue = 0;
	this._saturation = 0;
	this._brightness = 0;
	this._red = 0;
	this._green = 0;
	this._blue= 0;
	this._alpha = 1;
	if(sr) this.setRGBA.call(this, sr, g, b, a);
}.inherits(Style);

var Color$ = Color.prototype;

Color$.createStyle = function(){
	return 'rgba('+(this.red | 0)+','+(this.green | 0)+','+(this.blue | 0)+','+this.alpha+')';
};

/**
 * this function setup the color object with r,g,b,a parameters. it is like constructor but
 * when you want to change the color from HSB space back to RGB it will be usefull.
 * @method setRGBA
 * @param  SR 
 * this parameter should be color string, either 3 digit color like "#222" or 6 digit color like "#2a2b3c"
 * or it will be a number between 0 and 255 which is represented as red value of the color
 * constructor determine it based on type of this paraeter
 * @param {Number} G 
 * the green value of color
 * @param {Number} B 
 * the blue value of color
 * @param {Number} A 
 * the alpha value of color between 0 and 1, default is 1
 */
Color$.setRGBA = function(sr,g,b,a){
	var red, green, blue;
	if (typeof sr == 'string'){
		if (sr.length == 4){
			red=parseInt('0x'+sr[1])*16;
			green=parseInt('0x'+sr[2])*16;
			blue=parseInt('0x'+sr[3])*16;
			this._alpha=1;
		} else if (sr.length == 7){
			red=parseInt('0x'+sr[1]+sr[2]);
			green=parseInt('0x'+sr[3]+sr[4]);
			blue=parseInt('0x'+sr[5]+sr[6]);
			this._alpha= 1;
		}
	}// end of string parsing
	else {
		red = sr;
		green = g;
		blue = b;
		alpha = a == undefined ? 1:a;
	}
	this._red = red;
	this._green = green;
	this._blue = blue;
	this._rgbChanged = true;
};

/**
 * this method setups *Color* object with HSB values.
 * @method setHSB
 * @param  H 
 * the hue value of color
 * @param {Number} S 
 * the saturation value of color
 * @param {Number} B 
 * the brightness value of color
 */
Color$.setHSB = function(h, s, b){
	this._hue = h;
	this._saturation = s;
	this._brightness = b;
	this._hsbChanged = true;
};

Color$.updateRGB = function(){
	var arr = this.HSB2RGB(this._hue, this._saturation, this._brightness);
	this._red = arr[0];
	this._green = arr[1];
	this._blue = arr[2];
	this._hsbChanged = false;
};
Color$.updateHSB = function(){
	var arr = this.RGB2HSB(this._red, this._green, this._blue);
	this._hue = arr[0];
	this._saturation = arr[1];
	this._brightness = arr[2];
	this._rgbChanged = false;
};

/**
 * this is a helper method that takes RGB values and returns equivalent HSB of it
 * it's a utility function and does not have direct aplication.
 * @method RGB2HSB
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b 
 * @returns {Array} HSB
 */
Color$.RGB2HSB = function (r, g, b){
	var r = r / 255;
	var g = g / 255;
	var bl = b / 255;
    var max = Math.max(r, g, bl), min = Math.min(r, g, bl);
    var h, s, b;
   var delta = max - min;
   
   if (max == 0) return 0, -1, 0;
   
   b = max;
   s = delta/ max;
   // hue calc
   if (r == max) h = (g - bl)/ delta;
   else if (g == max) h= 2 + (bl - r)/ delta;
   else h= 4 + (r - g)/ delta;
   h *= 60;
   if (h < 0) h += 360;
   this.bufferHSB = [h,s,b];
   
    return [h, s, b];
};

/**
 * this is a helper method that takes HSB values and returns equivalent RGB of it
 * it's a utility function and does not have direct aplication.
 * @method HSB2RGB
 * @param {Number} h 
 * @param {Number} s 
 * @param {Number} b 
 * @returns {Array} RGB
 */
Color$.HSB2RGB = function(hue, saturation, brightness){
	var h = hue;
	var s = saturation;
	var l = brightness;
	var r, g, b;
	var f, p, q, t;
	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        h /= 60;
	        var i = Math.floor(h);
	        f = h - i;
	        p = l * ( 1 - s );
	    	q = l * ( 1 - s * f );
	    	t = l * ( 1 - s * ( 1 - f ) );
	    	switch( i ) {
			case 0:
				r = l;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = l;
				b = p;
				break;
			case 2:
				r = p;
				g = l;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = l;
				break;
			case 4:
				r = t;
				g = p;
				b = l;
				break;
			default:		// case 5:
				r = l;
				g = p;
				b = q;
				break;
		} // end switch
	    	
	    }
	    return  [r * 255, g * 255, b * 255];	
};

/**
 * sets/gets hue value of *Color*
 * @property hue
 * @type {Number}
 */
Object.defineProperty(Color$, "hue", {
	get: function() {
		if (this._rgbChanged)
			this.updateHSB();
		return this._hue;
	},
	set: function(v){ 
		this._hue = v;
		this._hsbChanged = true;
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets saturation value of *Color*
 * @property saturation
 * @type {Number}
 */
Object.defineProperty(Color$, "saturation", {
	get: function() {
		if (this._rgbChanged)
			this.updateHSB();
		return this._saturation;
	},
	set: function(v){ 
		this._saturation = v;
		this._hsbChanged = true;
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets brightness value of *Color*
 * @property brightness
 * @type {Number}
 */
Object.defineProperty(Color$, "brightness", {
	get: function() {
		if (this._rgbChanged)
			this.updateHSB();
		return this._brightness;
	},
	set: function(v){ 
		this._brightness = v;
		this._hsbChanged = true;
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets red value of *Color*
 * @property red
 * @type {Number}
 */
Object.defineProperty(Color$, "red", {
	get: function() {
		if (this._hsbChanged)
			this.updateRGB();
		return this._red;
	},
	set: function(v){ 
		this._red = v;
		this._rgbChanged = true;
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets green value of *Color*
 * @property green
 * @type {Number}
 */
Object.defineProperty(Color$, "green", {
	get: function() {
		if (this._hsbChanged)
			this.updateRGB();
		return this._green;
	},
	set: function(v){ 
		this._green = v;
		this._rgbChanged = true;
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets blue value of *Color*
 * @property blue
 * @type {Number}
 */
Object.defineProperty(Color$, "blue", {
	get: function() {
		if (this._hsbChanged)
			this.updateRGB();
		return this._blue;
	},
	set: function(v){ 
		this._blue = v;
		this._rgbChanged = true;
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets alpha value of *Color*
 * @property alpha
 * @type {Number}
 */
dream.util.createEventProperty(Color$,"alpha","onChange");


var Shadow = function(color, offsetX, offsetY, blur){
	this._offsetX = offsetX || 0;
	this._offsetY = offsetY || 0;
	this._blur = blur;
	this.color = color || "#000";
}

var Shadow$ = Shadow.prototype;

dream.event.create(Shadow$, "onChange");

dream.util.createEventProperty(Shadow$,"offsetX","onChange");
dream.util.createEventProperty(Shadow$,"offsetY","onChange");
dream.util.createEventProperty(Shadow$,"blur","onChange");

Object.defineProperty(Shadow$, "color", {
	get: function() {
		return this._color;
	},
	set: function(v){ 
		var shd = this;
		if(v != this._color){
			this._color.onChange.removeByOwner(this);
		}
		if(v instanceof Color){
			v.onChange.add(function(){
				shd.colorValue = v.createStyle();
			})
			this.colorValue = v.createStyle();
		}else if(typeof v == "string"){
			this.colorValue = v;
		}else{
			throw(new Error("color should be string or instance of dream.visual.drawing.Color"))
		}
		this._color = v;
		dream.event.dispatch(this, "onChange");
	}
});


/**
 * creates a *LineStyle* object which could be used as lineStyle of shapes,
 * @class LineStyle
 * @constructor
 * @param  {Number} width 
 * determines width of Line
 * @param {Object} cap 
 * determines Line capping could be one of the values in the dream.visual.drawing.LineStyle.Cap
 * Enumeration which includes: BUTT, ROUND or SQUARE
 * @param {Object} join 
 * determines how Lines will join toghether could be one of the values in the
 *  dream.visual.drawing.LineStyle.Join Enumeration which includes: ROUND, BEVEL or MITER
 * @param {Number} miterLimit 
 * is only useful when the join property of *LineStyle* is set to MITER, default is 10
 */
var LineStyle = function(width, cap, join, miterLimit){
	this._width = width || 1;
	this._cap = cap || dream.visual.drawing.LineStyle.Cap.BUTT;
	this._join = join || dream.visual.drawing.LineStyle.Join.MITER;
	this._miterLimit = miterLimit || 10;
	
};

var LineStyle$ = LineStyle.prototype;

/**
 * *onChange* event will raise whenever something is changed in a *LineStyle* like join or width properties
 * @event onChange
 */
dream.event.create(LineStyle$, "onChange");

/**
 * sets/gets width value of *LineStyle*
 * @property width 
 * @type {Number}
 */
dream.util.createEventProperty(LineStyle$,"width","onChange");
/**
 * sets/gets cap value of *LineStyle*
 * @property cap 
 * @type {Object}
 */
dream.util.createEventProperty(LineStyle$,"cap","onChange");
/**
 * sets/gets join value of *LineStyle*
 * @property join 
 * @type {Object}
 */
dream.util.createEventProperty(LineStyle$,"join","onChange");
/**
 * sets/gets miterLimit value of *LineStyle*
 * @property miterLimit 
 * @type {Number}
 */
dream.util.createEventProperty(LineStyle$,"miterLimit","onChange");


LineStyle.Cap = {
	BUTT: "butt",
	ROUND: "round",
	SQUARE: "square"
};

LineStyle.Join = {
	ROUND: "round",
	BEVEL: "bevel",
	MITER: "miter"
};

/**
 * creates a *ColorStop* object which could be used in composing Gradients.
 * a *ColorStop* has a position and color properties which defines it
 * @class ColorStop
 * @constructor
 * @param  {Number} position 
 * position of *ColorStop* between 0 and 1
 * @param {Object} color 
 * is an instance of *Color*
 * @example
 * var cs = new dream.visual.drawing.ColorStop(0.1, new  dream.visual.drawing.Color("#222"))
 */
var ColorStop = function(position, color){
	this._position = position;
	this._color = color;
};

var ColorStop$ = ColorStop.prototype;

/**
 * *onChange* event will raise whenever something is changed in a *ColorStop* like position or Color
 * @event onChange
 */
dream.event.create(ColorStop$, "onChange");

/**
 * sets/gets position value of *ColorStop*
 * @property position
 * @type {Number}
 */
Object.defineProperty(ColorStop$, "position", {
	get: function() {
		return this._position;
	},
	set: function(v){ 
		this._position = v > 1 ? 1 : (v < 0 ? 0 : v);	
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets color value of *ColorStop*
 * @property color
 * @type {Object}
 */
Object.defineProperty(ColorStop$, "color", {
	get: function() {
		return this._color;
	},
	set: function(v){
		if (this._color instanceof Color) 
			this._color.onChange.removeByOwner(this);
		this._color = v;
		if (this._color instanceof Color) 
			this._color.onChange.propagate(this);
		dream.event.dispatch(this, "onChange");
	}
});


/**
 * the super class for LinearGradient and RadialGradient. any Gradient is defined with a colorStops 
 * {{#crossLink "dream.collection.List"}}List{{/crossLink}} and it's start/end positions.
 *  any {{#crossLink "dream.visual.drawing.ColorStop"}}colorstop{{/crossLink}} can be added to it 
 *  or removed from it or changed in runtime to change the *Gradient* 
 * @class ColorStop
 * @param {Array<dream.visual.drawing.ColorStop>} colorStops
 */
var Gradient = function(colorStops){
	this.colorStops = new dream.collection.List;
	
	this.colorStops.onAdd.propagate(this, "onChange");
	this.colorStops.onRemove.propagate(this, "onChange");
	
	var gradient = this;
	this.colorStops.onAdd.add(function(cs){
		cs.onChange.propagate(gradient);
	});
	this.colorStops.onRemove.add(function(cs){
		cs.onChange.removeByOwner(gradient);
	});
	
	this.colorStops.addArray(colorStops);
}.inherits(Style);

/**
 * this class instances are LinearGradients that could be used in fillStyle and strokeStyle of any *Shape*
 * @class LinearGradient
 * @constructor
 * @extends dream.visual.drawing.Gradient
 * @param {Array<dream.visual.drawing.ColorStop>} colorStops
 * the color stops that define the look and composition of Gradient
 * @param {Number} startX 
 * the start position of Gradient in x axis, between 0 and 1
 * @param {Number} startY 
 * the ending position of Gradient in Y axis, between 0 and 1
 * @param {Number} endX 
 * the start position of Gradient in x axis, between 0 and 1
 * @param {Number} endY 
 * the ending position of Gradient in y axis, between 0 and 1
 * @example
 * var colorstop = dream.visual.drawing.ColorStop;    
 * var color = dream.visual.drawing.Color;    
 * var lg = new dream.visual.drawing.LinearGradient(null, 0, 0, 0, 1);    
 * lg.colorStops.add(new colorstop(0.1 , new color("#222"));    
 * lg.colorStops.add(new colorstop(0.5 , new color("#444"));    
 * lg.colorStops.add(new colorstop(1 , new color("#aaa"));    
 * lg.colorStops[0].position = 0.2;    
 */
var LinearGradient = function(colorStops, startX, startY, endX, endY){
	Gradient.call(this, colorStops);
	
	this.startX = startX;
	this.startY = startY;
	this.endX = endX;
	this.endY = endY;
	
}.inherits(Gradient);

LinearGradient.prototype.createStyle = function(context, rect){
	var gr = context.createLinearGradient(rect.left + rect.width * this.startX, rect.top + rect.height * this.startY, rect.left + rect.width * this.endX, rect.top + rect.height * this.endY);
	for ( var i = 0, cs; cs = this.colorStops[i]; i++)
		gr.addColorStop(cs.position, cs.color instanceof Color ? cs.color.createStyle():cs.color);
	return gr;
};

/**
 * this class instances are *RadialGradients* that could be used in fillStyle and strokeStyle of any *Shape*
 * @class RadialGradient
 * @constructor
 * @extends dream.visual.drawing.Gradient
 * @param {Array<dream.visual.drawing.ColorStop>} colorStops
 * the color stops that define the look and composition of Gradient
 * @param {Number} startX 
 * the start position of Gradient in x axis, between 0 and 1
 * @param {Number} startY 
 * the ending position of Gradient in Y axis, between 0 and 1
 * @param {Number} startR 
 * the radius of inner Circle of *RadialGradient*, between 0 and 1
 * @param {Number} endX 
 * the start position of Gradient in x axis, between 0 and 1
 * @param {Number} endY 
 * the ending position of Gradient in y axis, between 0 and 1
 * @param {Number} endR 
 * the radius of outer Circle of *RadialGradient*, between 0 and 1
 */
var RadialGradient = function(colorStops, startX, startY, startR, endX, endY, endR){
	Gradient.call(this, colorStops);
	
	this.startX = startX;
	this.startY = startY;
	this.startR = startR;
	this.endX = endX;
	this.endY = endY;
	this.endR = endR;
	
}.inherits(Gradient);

RadialGradient.prototype.createStyle = function(context, rect){
	var d = rect.width > rect.height ? rect.width : rect.height;
	var gr = context.createRadialGradient(rect.left + rect.width * this.startX, rect.top + rect.height * this.startY, d * this.startR, rect.left + rect.width * this.endX, rect.top + rect.height * this.endY, d * this.endR);
	for ( var i = 0, cs; cs = this.colorStops[i]; i++)
		gr.addColorStop(cs.position, cs.color instanceof Color ? cs.color.createStyle():cs.color);
	return gr;
};

/**
 * class for creating Pattern Style, in which you give an image url and the repeat type of
 * it to be used as fillStyle or strokeStyle of a *Shape* 
 * @class Pattern
 * @param {String} ImageUrl
 * the url of image with which pattern should be built
 * @param {Object} repeatType
 * one of values in dream.visual.drawing.Pattern.repeatTypes which are REPEAT, REPEAT-X, REPEAT-Y and NO_REPEAT
 * @example 
 * var pattern = dream.visual.drawing.Pattern;    
 * var fs = new pattern("../img/example1.png", pattern.REPEAT); 
 */
var Pattern = function(img, type){
	this.bitmap = img
	this.repeatType = type || "repeat";
	
}.inherits(Style);

Pattern$ = Pattern.prototype;


Pattern.repeatType = {
		'REPEAT': "repeat",
		'REPEAT-X': "repeat-x",
		'REPEAT-Y': "repeat-y",
		'NO-REPEAT': "no-repeat"
	};


/**
 * sets/gets repeatType value of *Pattern*, you can change repeatType property of *Pattern* in tun time by
 * setting it again.
 * @property repeatType
 * @type {Object}
 */
Object.defineProperty(Pattern$, "repeatType", {
	get: function() {
		return this._repeatType;
	},
	set: function(v){
		if (v == 'repeat' || v == 'repeat-x' || v =='repeat-y' || v == 'no-repeat'){
			this._repeatType = v;
		}else{
			console.log("Invalid Repeat Type");
		}
		dream.event.dispatch(this, "onChange");
	}
});

/**
 * sets/gets source value of *Pattern*, you can change the image of pattern on runtime by setting source property
 * of *Pattern* to an instance of dream.static.Resource, make sure the resourec is loaded before setting it.
 * note source is diffrent than the imageUrl you pass to constructor for creating a *Pattern*. the url
 * is used to create an instance of dream.static.Resource and engine will automaticaly loads it for you
 * when loading a scene, however you can create such instance and load it manually.
 * @property source
 * @type {Object}
 */
Object.defineProperty(Pattern$, "bitmap", {
	get: function() {
		return this._bitmap;
	},
	set: function(v){
		if (v instanceof dream.visual.Bitmap){
			this._bitmap = v;
		}else{
			console.log("Invalid source for Pattern Style, it should be instance of Bitmap");
		}
		dream.event.dispatch(this, "onChange");
	}
});

Pattern$.createStyle = function(context, rect){
	return context.createPattern(this._bitmap.image, this._repeatType);
};


// exports
dream.visual.drawing = {
		Shape:Shape,
		Rect:Rect,
		CircularShape:CircularShape,
		Circle:Circle,
		CircleSlice:CircleSlice,
		Ellipse:Ellipse,
		Star:Star,
		Poly:Poly,
		Freehand : Freehand,
		Text:Text,
		Align: {
			LEFT: "left",
			CENTER: "center",
			RIGHT: " right"
		},
		Style:Style,
		Color:Color,
		LineStyle:LineStyle,
		ColorStop:ColorStop,
		Gradient:Gradient,
		LinearGradient:LinearGradient,
		RadialGradient:RadialGradient,
		Pattern:Pattern,
		Shadow: Shadow
		
};

})();
