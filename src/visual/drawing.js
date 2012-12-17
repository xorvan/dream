/**
 * 
 */
dream.visual.drawing = {};

/**
 * @constructor
 */
dream.visual.drawing.Shape = function(left, top, width, height){
	dream.visual.drawing.Shape._superClass.call(this, left, top, width, height);
	
}.inherits(dream.visual.Graphic);

Object.defineProperty(dream.visual.drawing.Shape.prototype, "fillStyle", {
	get: function() {
		return this._fs;
	},
	set: function(v){
		if(this._fs instanceof dream.visual.drawing.Gradient)
			this._fs.onChange.removeByOwner(this);

		this._fs = v;
		dream.event.dispatch(this, "onImageChange", [this.boundary.clone()]);
		
		if(this._fs instanceof dream.visual.drawing.Style)
			this._fs.onChange.propagate(this, "onImageChange", function(){return [this.boundary.clone()];});
	}
});

Object.defineProperty(dream.visual.drawing.Shape.prototype, "strokeStyle", {
	get: function() {
		return this._ss;
	},
	set: function(v){
		if(this._ss instanceof dream.visual.drawing.Style)
			this._ss.onChange.removeByOwner(this);
		
		this._ss = v;
		dream.event.dispatch(this, "onImageChange", [this.boundary.clone()]);
		
		if(this._ss instanceof dream.visual.drawing.Style)
			this._ss.onChange.propagate(this, "onImageChange", function(){return [this.viewRect.clone()];});
	}
});


dream.visual.drawing.Shape.prototype.drawImage = function(context, origin){
	if(this._fs) context.fillStyle = this._fs instanceof dream.visual.drawing.Style ? this._fs.createStyle(context, this.rect) : this._fs;
	if(this._ss) {
		if (this._ss instanceof dream.visual.drawing.Style){
			context.strokeStyle = this._ss.createStyle(context, this.rect);
			if (this._ss instanceof dream.visual.drawing.strokeStyle){
				context.lineWidth=this._ss._width;
				context.lineCap=this._ss._cap;
				context.lineJoin=this._ss._join;
				if (this._ss._join == "miter")
					context.miterLimit= this._ss._miterLimit;
			}}
		else context.strokeStyle = this._ss;
	}
};

/**
 * @constructor
 */
dream.visual.drawing.Rect = function(left, top, width, height){
	dream.visual.drawing.Shape._superClass.call(this, left, top);
	
	this._width = 0;
	this._height = 0;
	this.width = width;
	this.height = height;
	
}.inherits(dream.visual.drawing.Shape);

dream.visual.drawing.Rect.prototype.drawImage = function(context, origin){
	dream.visual.drawing.Rect._superClass.prototype.drawImage.call(this, context, origin);
	if(this.fillStyle) context.fillRect(origin.left, origin.top, this.width, this.height);
	if(this.strokeStyle) context.strokeRect(origin.left, origin.top, this.width, this.height);
};

Object.defineProperty(dream.visual.drawing.Shape.prototype, "width", {
	get: function() {
		return this._width;
	},
	set: function(v){
		var d = v - this._width;		
		this.rect.width += d;
		this._width = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
	}
});

Object.defineProperty(dream.visual.drawing.Shape.prototype, "height", {
	get: function() {
		return this._height;
	},
	set: function(v){
		var d = v - this._height;		
		this.rect.height += d;
		this._height = v;
		this.isImageChanged = true;
		this.isBoundaryChanged = true;
	}
});

/**
 * @constructor
 */
dream.visual.drawing.CircularShape = function(left, top, radius){
	dream.visual.drawing.CircularShape._superClass.call(this, left, top);
	this.radius = radius;
}.inherits(dream.visual.drawing.Shape);

Object.defineProperty(dream.visual.drawing.CircularShape.prototype, "radius", {
	get: function() {
		return this._radius;
	},
	set: function(v){
		this._radius = v;
		this.rect.width = this.rect.height = v*2;
		this.rect.left = this.rect.top = - v;
		this.isBoundaryChanged=true;
		this.isImageChanged=true;
	}
});


/**
 * @constructor
 */
dream.visual.drawing.Circle = function(left, top, radius){
	dream.visual.drawing.Circle._superClass.call(this, left, top, radius);
}.inherits(dream.visual.drawing.CircularShape);

dream.visual.drawing.Circle.prototype.drawImage = function(context, origin){
	dream.visual.drawing.Circle._superClass.prototype.drawImage.call(this, context, origin);
	context.beginPath();
	context.arc(origin.left, origin.top, this._radius, 0, Math.PI * 2, true);
	context.closePath();
	if(this.fillStyle) context.fill();
	if(this.strokeStyle) context.stroke();
};

/**
 * @constructor
 */
//ellipse does ot work we have to fix it after rectangology
/*
dream.visual.drawing.Ellipse = function(left, top, width, height){
	//this._width = width;
	//this._height = height;
	dream.visual.drawing.Shape._superClass.call(this, left, top, width, height);
	
}.inherits(dream.visual.drawing.Shape);

//dream.util.createFlagProperty(dream.visual.drawing.Ellipse.prototype,"width","isImageChanged");
//dream.util.createFlagProperty(dream.visual.drawing.Ellipse.prototype,"height","isImageChanged");

dream.visual.drawing.Ellipse.prototype.drawImage = function(context, rect){
	context.save();
	dream.visual.drawing.Ellipse._superClass.prototype.drawImage.call(this, context, rect);
	var rad, scalex, scaley;
	if (this._width < this.height) { 
		rad = this.width;
		scalex = 1;
		scaley = this.height/this.width;
	} else {
		rad = this.height;
		scaley = 1;
		scalex = this.width/this._height;
	}
	context.translate(rect.left + this.width, rect.top + this.height);
	//context.scale(scalex, scaley);
	context.beginPath();
	context.arc(0, 0, rad, 0, Math.PI * 2, true);
	context.closePath();
	if(this.fillStyle) context.fill();
	if(this.strokeStyle) context.stroke();
	context.restore();
}; // end ellipse draw image

*/

/**
 * 
 */
dream.visual.drawing.CircleSlice = function(left, top, radius, angle){
	dream.visual.drawing.CircleSlice._superClass.call(this, left, top, radius);
	this._angle = angle;
}.inherits(dream.visual.drawing.CircularShape);

dream.util.createFlagProperty(dream.visual.drawing.CircleSlice.prototype,"angle","isImageChanged");

dream.visual.drawing.CircleSlice.prototype.drawImage = function(context, origin){
	context.save();
	dream.visual.drawing.CircleSlice._superClass.prototype.drawImage.call(this, context, origin);
	context.translate(origin.left, origin.top);
	context.beginPath();
	var angs = this._angle * Math.PI / 180;
	context.lineTo(this._radius, 0);
	context.moveTo(0, 0);
	context.arc(0, 0, this._radius, 0, angs, false);
	context.rotate(angs);
	
	context.closePath();
	if(this.fillStyle) context.fill();
	if(this.strokeStyle) context.stroke();
	context.restore();
};

/**
 * @constructor
 */
dream.visual.drawing.Poly = function (left, top, radius, sides){
	dream.visual.drawing.Poly._superClass.call(this, left, top, radius);
	this._sides = sides;
}.inherits(dream.visual.drawing.CircularShape);

dream.util.createFlagProperty(dream.visual.drawing.Poly.prototype,"sides","isImageChanged");

dream.visual.drawing.Poly.prototype.drawImage = function(context, origin){
	context.save();
	context.translate(origin.left, origin.top);
	dream.visual.drawing.Poly._superClass.prototype.drawImage.call(this, context, origin);
	var ang = 2  * Math.PI / this.sides;
	context.rotate(Math.PI / -2);
	context.beginPath();
	var s = Math.abs(this.sides) + 0.5 | 0;
	for (var i=0; i < s; i++){
		context.rotate(ang);
		context.lineTo(this.radius, 0);
	}
	context.closePath();
	if(this.fillStyle) context.fill();
	if(this.strokeStyle) context.stroke();
	context.restore();
};

/**
 * @constructor
 */
dream.visual.drawing.Star=function (left, top, radius, radius2, points){
	dream.visual.drawing.Star._superClass.call(this, left, top);
	this.radius = radius;
	this.radius2 = radius2;
	this.points = points;
}.inherits(dream.visual.drawing.Shape);

Object.defineProperty(dream.visual.drawing.Star.prototype, "radius", {
	get: function() {
		return this._radius;
	},
	set: function(v){
		this._radius = v;
		if(this.rect.left > -v){
			this.rect.width = this.rect.height = v*2;
			this.rect.left = this.rect.top = -v;
			this.isBoundaryChanged = true;
		}
		this.isImageChanged=true;
	}
});
Object.defineProperty(dream.visual.drawing.Star.prototype, "radius2", {
	get: function() {
		return this._radius2;
	},
	set: function(v){
		this._radius2 = v;
		if(this.rect.left > -v){
			this.rect.width = this.rect.height = v*2;
			this.rect.left = this.rect.top = -v;
			this.isBoundaryChanged = true;
		}
		this.isImageChanged=true;
	}
});
dream.util.createFlagProperty(dream.visual.drawing.Star.prototype,"points","isImageChanged");

dream.visual.drawing.Star.prototype.drawImage = function(context, origin){
	context.save();
	dream.visual.drawing.Rect._superClass.prototype.drawImage.call(this, context, origin);
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
	if(this.fillStyle) context.fill();
	if(this.strokeStyle) context.stroke();
	context.restore();
};

/**
 * @constructor
 */
dream.visual.drawing.Path = function(){};

//       definig styles it may become another file alltoghether


/**
 * @constructor
 */
dream.visual.drawing.Style = function(){
	
};
dream.event.create(dream.visual.drawing.Style.prototype,"onChange");



/**
 * @constructor
 */
dream.visual.drawing.Color = function(sr,g,b,a){
	if (typeof sr == 'string'){
		if (sr.length == 4){
			this._red=parseInt('0x'+sr[1])*16;
			this._green=parseInt('0x'+sr[2])*16;
			this._blue=parseInt('0x'+sr[3])*16;
			this._alpha=1;
		} else if (sr.length == 7){
			this._red=parseInt('0x'+sr[1]+sr[2]);
			this._green=parseInt('0x'+sr[3]+sr[4]);
			this._blue=parseInt('0x'+sr[5]+sr[6]);
			this._alpha=1;
							}
		}// end of string parsing
	else {
		this._red=sr;
		this._green=sr;
		this._blue=sr;
		this._alpha=a;
		}
}.inherits(dream.visual.drawing.Style);

dream.visual.drawing.Color.prototype.createStyle=function(){
	return 'rgba('+(this.red | 0)+','+(this.green | 0)+','+(this.blue | 0)+','+this.alpha+')';
	
};

dream.util.createEventProperty(dream.visual.drawing.Color.prototype,"red","onChange");
dream.util.createEventProperty(dream.visual.drawing.Color.prototype,"green","onChange");
dream.util.createEventProperty(dream.visual.drawing.Color.prototype,"blue","onChange");
dream.util.createEventProperty(dream.visual.drawing.Color.prototype,"alpha","onChange");


/**
 * @constructor
 */
dream.visual.drawing.strokeStyle = function(style, width, cap, join, miterLimit){
	this._style=style || "#000";
	this._width=width || 1;
	this._cap=cap || "butt";
	this._join = join || "miter";
	this._miterLimit = miterLimit || 10;
	
	if (this._style instanceof dream.visual.drawing.Style)
		this._style.onChange.propagate(this);
	
}.inherits(dream.visual.drawing.Style);

dream.visual.drawing.strokeStyle.prototype.createStyle=function(context, rect){
	return this._style instanceof dream.visual.drawing.Style ? this._style.createStyle(context, rect):this._style;
	
};

Object.defineProperty(dream.visual.drawing.strokeStyle.prototype, "style", {
	get: function() {
		return this._style;
	},
	set: function(v){
		if (this._style instanceof dream.visual.drawing.Style) 
			this._style.onChange.removeByOwner(this);
		this._style = v;
		if (this._style instanceof dream.visual.drawing.Style) 
			this._style.onChange.propagate(this);
		dream.event.dispatch(this, "onChange");
	}
});

dream.util.createEventProperty(dream.visual.drawing.strokeStyle.prototype,"width","onChange");
dream.util.createEventProperty(dream.visual.drawing.strokeStyle.prototype,"cap","onChange");
dream.util.createEventProperty(dream.visual.drawing.strokeStyle.prototype,"join","onChange");
dream.util.createEventProperty(dream.visual.drawing.strokeStyle.prototype,"miterLimit","onChange");



/**
 * @constructor
 */
dream.visual.drawing.ColorStop = function(position, color){
	this._position = position;
	this._color = color;
};

dream.event.create(dream.visual.drawing.ColorStop.prototype, "onChange");

Object.defineProperty(dream.visual.drawing.ColorStop.prototype, "position", {
	get: function() {
		return this._position;
	},
	set: function(v){ 
		this._position = v > 1 ? 1 : (v < 0 ? 0 : v);	
		dream.event.dispatch(this, "onChange");
	}
});

Object.defineProperty(dream.visual.drawing.ColorStop.prototype, "color", {
	get: function() {
		return this._color;
	},
	set: function(v){
		if (this._color instanceof dream.visual.drawing.Color) 
			this._color.onChange.removeByOwner(this);
		this._color = v;
		if (this._color instanceof dream.visual.drawing.Color) 
			this._color.onChange.propagate(this);
		dream.event.dispatch(this, "onChange");
	}
});


/**
 * @param {Array<dream.visual.drawing.ColorStop>} colorStops
 * @constructor
 */
dream.visual.drawing.Gradient = function(colorStops){
	this.colorStops = new dream.util.ArrayList;
	
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
}.inherits(dream.visual.drawing.Style);;


/**
 * @constructor
 */
dream.visual.drawing.LinearGradient = function(colorStops, startX, startY, endX, endY){
	dream.visual.drawing.LinearGradient._superClass.call(this, colorStops);
	
	this.startX = startX;
	this.startY = startY;
	this.endX = endX;
	this.endY = endY;
	
}.inherits(dream.visual.drawing.Gradient);

dream.visual.drawing.LinearGradient.prototype.createStyle = function(context, rect){
	var gr = context.createLinearGradient(rect.left + rect.width * this.startX, rect.top + rect.height * this.startY, rect.left + rect.width * this.endX, rect.top + rect.height * this.endY);
	for ( var i = 0, cs; cs = this.colorStops[i]; i++)
		gr.addColorStop(cs.position, cs.color instanceof dream.visual.drawing.Color ? cs.color.createStyle():cs.color);
	return gr;
};
