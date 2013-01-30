(function(){

/**
 * @constructor
 */
var Shape = function(left, top){
	Shape._superClass.call(this, left, top);
	
	this.strokeOffset = 1;
}.inherits(dream.visual.Graphic);

var $ = Shape.prototype;

Object.defineProperty($, "fillStyle", {
	get: function() {
		return this._fs;
	},
	set: function(v){
		if(this._fs instanceof Gradient)
			this._fs.onChange.removeByOwner(this);

		this._fs = v;
		dream.event.dispatch(this, "onImageChange", [this.boundary.clone()]);
		
		if(this._fs instanceof Style)
			this._fs.onChange.propagateFlagged(this, "isImageChanged");
	}
});

Object.defineProperty($, "strokeStyle", {
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

$._setStrokeOffset = function(w){
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

Object.defineProperty($, "lineStyle", {
	get: function() {
		return this._ls;
	},
	set: function(v){
		dream.util.assert(v instanceof LineStyle, "lineStyle must be LineStyle!");
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


$.paint = function(context, origin){
	var r = this.rect;
	if(this._ls){
		context.lineWidth=this._ls._width;
		context.lineCap=this._ls._cap;
		context.lineJoin=this._ls._join;
		if (this._ls._join == LineStyle.Join.MITER)
			context.miterLimit= this._ls._miterLimit;
		}
	if(this._fs) {
		context.fillStyle = this._fs instanceof Style ? this._fs.createStyle(context, new dream.Rect(r.left + origin.left, r.top + origin.top, r.width, r.height)) : this._fs;
		context.fill();
	}
	if(this._ss){
		context.strokeStyle = this._ss instanceof Style ? this._ss.createStyle(context, new dream.Rect(r.left + origin.left, r.top + origin.top, r.width, r.height)) : this._ss;
		context.stroke();
	}
};

$.drawImage = function(context, origin){
	//console.log(this);
	this.applyPath(context, origin);
	Shape.prototype.paint.call(this,context, origin);
};



/**
 * @constructor
 */
var Rect = function(left, top, width, height){
	Shape.call(this, left, top);
	this._width = 0;
	this._height = 0;
	this.width = width;
	this.height = height;
	
}.inherits(Shape);

var $ = Rect.prototype;

$.applyPath = function(context, origin){
	var right = origin.left + this.width;
	var bottom = origin.top + this.height;
	context.beginPath();
	context.moveTo(origin.left, origin.top);
	context.lineTo(right, origin.top);
	context.lineTo(right, bottom);
	context.lineTo(origin.left, bottom);
	context.closePath();
}

$.drawImage = function(context, origin){
	Shape.prototype.drawImage.call(this, context, origin);
	if(this.fillStyle) context.fillRect(origin.left, origin.top, this.width, this.height);
	if(this.strokeStyle) context.strokeRect(origin.left, origin.top, this.width, this.height);
};

Object.defineProperty($, "width", {
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

Object.defineProperty($, "height", {
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
 * @constructor
 */
var CircularShape = function(left, top, radius){
	Shape.call(this, left, top);
	this.radius = radius;
}.inherits(Shape);

var $ = CircularShape.prototype;

Object.defineProperty($, "radius", {
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
 * @constructor
 */
var Circle = function(left, top, radius){
	CircularShape.call(this, left, top, radius);
}.inherits(CircularShape);

Circle.prototype.applyPath = function(context, origin){
	context.beginPath();
	context.arc(origin.left, origin.top, this._radius, 0, Math.PI * 2, true);
	context.closePath();
};

/**
 * @constructor
 */

var Ellipse = function(left, top, radiusX, radiusY){
	Shape.call(this, left, top);	
	this.radiusX = radiusX;
	this.radiusY = radiusY;
	
}.inherits(Shape);

var $ = Ellipse.prototype;

$.applyPath = function(context, origin){
	context.scale(1, this._radiusY / this._radiusX);
	context.beginPath();
	context.arc(origin.left, origin.top * this._radiusX / this._radiusY, this._radiusX, 0, Math.PI * 2, true);
	context.closePath();
}; 

Object.defineProperty($, "radiusX", {
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

Object.defineProperty($, "radiusY", {
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
 * 
 */
var CircleSlice = function(left, top, radius, angle){
	CircularShape.call(this, left, top, radius);
	this._angle = angle;
}.inherits(CircularShape);

var $ = CircleSlice.prototype;

dream.util.createFlagProperty($,"angle","isImageChanged");

$.applyPath = function(context, origin){
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
 * @constructor
 */
var Poly = function (left, top, radius, sides){
	CircularShape.call(this, left, top, radius);
	this._sides = sides;
}.inherits(CircularShape);
var $ = Poly.prototype;

dream.util.createFlagProperty($,"sides","isImageChanged");

$.applyPath = function(context, origin){
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
 * @constructor
 */
var Star=function (left, top, radius, radius2, points){
	Shape.call(this, left, top);
	this.radius = radius;
	this.radius2 = radius2;
	this.points = points;
}.inherits(Shape);

var $ = Star.prototype;

Object.defineProperty($, "radius", {
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
Object.defineProperty($, "radius2", {
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
dream.util.createFlagProperty($,"points","isImageChanged");

$.applyPath = function(context, origin){
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

var Text = function(left, top, text, font){
	Shape.call(this, left, top);
	this.text = text;
	this.font = font;
	this._calcWidth = true;
	
}.inherits(Shape);

var $ = Text.prototype;

Object.defineProperty($, "text", {
	get: function() {
		return this._text;
	},
	set: function(v){
		this._text = v;
		this.isImageChanged = true;
		this._update = true;
	}
});
Object.defineProperty($, "font", {
	get: function() {
		return this._font;
	},
	set: function(v){
		this._font = v;
		this.isImageChanged = true;
		this._update = true;
	}
});
Object.defineProperty($, "fontSize", {
	get: function() {
		return this._font ? parseInt(this._font.split('px')[0]):10;
	},
	set: function(v){
		if (this._font)
			this._font = v+"px"+this._font.split('px')[1];
		else
			this._font = v+"px arial";
		this.isImageChanged = true;
		this._update = true;
	}
});
Object.defineProperty($, "fontFace", {
	get: function() {
		return this._font ? this._font.split('px')[1].trim():"arial";
	},
	set: function(v){
		if (this._font)
			this._font = this._font.split('px')[0]+"px "+v;
		else
			this._font = "10px "+v;
		this.isImageChanged = true;
		this._update = true;
	}
});
Object.defineProperty($, "align", {
	get: function() {
		return this._align;
	},
	set: function(v){
		this._align = v;
		this.isImageChanged = true;
		this._update = true;
	}
});
Object.defineProperty($, "baseline", {
	get: function() {
		return this._baseline;
	},
	set: function(v){
		this._baseline = v;
		this.isImageChanged = true;
		this._update = true;
	}
});

$.updateRect = function(context){
	var m = context.measureText(this._text);
	this.rect.width = m.width;
	this.rect.height = parseInt(context.font.split('px')[0]);
	this._update = false;
	this.isBoundaryChanged = true;	
};

$.applyPath = function(context, origin){
	//context.save();
	context.font = this._font;
	context.textAlign = this.align;
	context.textBaseline = this.baseline;
	if (this._update)
		this.updateRect(context);
	
	context.fillText(this._text, origin.left, origin.top);
	//context.restore();
};

/**
 * @constructor
 */
var Path = function(){};

//       definig styles it may become another file alltoghether


/**
 * @constructor
 */
var Style = function(){
	
};
dream.event.create(Style.prototype,"onChange");


/**
 * @constructor
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

var $ = Color.prototype;

$.createStyle = function(){
	return 'rgba('+(this.red | 0)+','+(this.green | 0)+','+(this.blue | 0)+','+this.alpha+')';
};

$.setRGBA = function(sr,g,b,a){
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

$.setHSB = function(h, s, b){
	this._hue = h;
	this._saturation = s;
	this._brightness = b;
	this._hsbChanged = true;
};

$.updateRGB = function(){
	var arr = this.HSB2RGB(this._hue, this._saturation, this._brightness);
	this._red = arr[0];
	this._green = arr[1];
	this._blue = arr[2];
	this._hsbChanged = false;
};
$.updateHSB = function(){
	var arr = this.RGB2HSB(this._red, this._green, this._blue);
	this._hue = arr[0];
	this._saturation = arr[1];
	this._brightness = arr[2];
	this._rgbChanged = false;
};

$.RGB2HSB = function (r, g, b){
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

$.HSB2RGB = function(hue, saturation, brightness){
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


Object.defineProperty($, "hue", {
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
Object.defineProperty($, "saturation", {
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
Object.defineProperty($, "brightness", {
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

Object.defineProperty($, "red", {
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
Object.defineProperty($, "green", {
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
Object.defineProperty($, "blue", {
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

dream.util.createEventProperty($,"alpha","onChange");

/**
 * @constructor
 */
var LineStyle = function(width, cap, join, miterLimit){
	this._width = width || 1;
	this._cap = cap || dream.visual.drawing.LineStyle.Cap.BUTT;
	this._join = join || dream.visual.drawing.LineStyle.Join.MITER;
	this._miterLimit = miterLimit || 10;
	
};

var $ = LineStyle.prototype;

dream.event.create($, "onChange");

dream.util.createEventProperty($,"width","onChange");
dream.util.createEventProperty($,"cap","onChange");
dream.util.createEventProperty($,"join","onChange");
dream.util.createEventProperty($,"miterLimit","onChange");


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
 * @constructor
 */
var ColorStop = function(position, color){
	this._position = position;
	this._color = color;
};

var $ = ColorStop.prototype;

dream.event.create($, "onChange");

Object.defineProperty($, "position", {
	get: function() {
		return this._position;
	},
	set: function(v){ 
		this._position = v > 1 ? 1 : (v < 0 ? 0 : v);	
		dream.event.dispatch(this, "onChange");
	}
});

Object.defineProperty($, "color", {
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
 * @param {Array<dream.visual.drawing.ColorStop>} colorStops
 * @constructor
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
 * @constructor
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
 * @constructor
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
		Text:Text,
		Style:Style,
		Color:Color,
		LineStyle:LineStyle,
		ColorStop:ColorStop,
		Gradient:Gradient,
		LinearGradient:LinearGradient,
		RadialGradient:RadialGradient	
		
};

})();
