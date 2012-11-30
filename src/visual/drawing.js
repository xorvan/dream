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
		dream.event.dispatch(this, "onImageChange", [this.viewRect.clone()]);
		
		if(this._fs instanceof dream.visual.drawing.Gradient)
			this._fs.onChange.propagate(this, "onImageChange", function(){return [this.viewRect.clone()];});
	}
});

Object.defineProperty(dream.visual.drawing.Shape.prototype, "strokeStyle", {
	get: function() {
		return this._ss;
	},
	set: function(v){
		if(this._ss instanceof dream.visual.drawing.Gradient)
			this._ss.onChange.removeByOwner(this);
		
		this._ss = v;
		dream.event.dispatch(this, "onImageChange", [this.viewRect.clone()]);
		
		if(this._ss instanceof dream.visual.drawing.Gradient)
			this._ss.onChange.propagate(this, "onImageChange", function(){return [this.viewRect.clone()];});
	}
});

dream.visual.drawing.Shape.prototype.drawImage = function(context, rect){
	if(this._fs) context.fillStyle = this._fs instanceof dream.visual.drawing.Gradient ? this._fs.createStyle(context, rect) : this._fs;
	if(this._ss) context.strokeStyle = this._ss instanceof dream.visual.drawing.Gradient ? this._ss.createStyle(context, rect) : this._ss;
};

/**
 * @constructor
 */
dream.visual.drawing.Rect = function(left, top, width, height){
	dream.visual.drawing.Shape._superClass.call(this, left, top, width, height);
	
}.inherits(dream.visual.drawing.Shape);

dream.visual.drawing.Rect.prototype.drawImage = function(context, rect){
	dream.visual.drawing.Rect._superClass.prototype.drawImage.call(this, context, rect);
	if(this.fillStyle) context.fillRect(rect.left, rect.top, rect.width, rect.height);
	if(this.strokeStyle) context.strokeRect(rect.left, rect.top, rect.width, rect.height);
};

/**
 * @constructor
 */
dream.visual.drawing.Circle = function(left, top, diameter){
	this.diameter=this.width=this.height=diameter;
	dream.visual.drawing.Shape._superClass.call(this, left, top, diameter, diameter);
	
}.inherits(dream.visual.drawing.Shape);

dream.visual.drawing.Circle.prototype.drawImage = function(context, rect){
	dream.visual.drawing.Rect._superClass.prototype.drawImage.call(this, context, rect);
	context.beginPath();
	context.arc(rect.left + rect.width / 2, rect.top + rect.width/2, rect.width / 2, 0, Math.PI * 2, true);
	context.closePath();
	if(this.fillStyle) context.fill();
	if(this.strokeStyle) context.stroke();
};

/**
 * @constructor
 */
dream.visual.drawing.Path = function(){};
	
/**
 * @constructor
 */
dream.visual.drawing.Paper = function(){};

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
};

dream.event.create(dream.visual.drawing.Gradient.prototype, "onChange");

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
		this._color = v;	
		dream.event.dispatch(this, "onChange");
	}
});

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
		gr.addColorStop(cs.position, cs.color);
	return gr;
};
