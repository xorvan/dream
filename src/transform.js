/**
 * 
 */
(function(){

/**
 * 
 */
var Matrix = function(x0, y0, x1, y1, dx, dy){
	this.x0 = x0;
	if(!x0 && x0 !== 0) this.x0 = 1;
	this.y0 = y0 || 0;
	this.x1 = x1 || 0;
	this.y1 = y1;
	if(!y1 && y1 !== 0) this.y1 = 1;
	this.dx = dx || 0;
	this.dy = dy || 0;
};
var $ = Matrix.prototype;

$.multiplyBy = function(matrix){
	return new dream.transform.Matrix(
			this.x0 * matrix.x0 + this.y0 * matrix.x1, this.x0 * matrix.y0 + this.y0 * matrix.y1, 
			this.x1 * matrix.x0 + this.y1 * matrix.x1, this.x1 * matrix.y0 + this.y1 * matrix.y1, 
			this.x0 * matrix.dx + this.x1 * matrix.dy + this.dx,
			this.y0 * matrix.dx + this.y1 * matrix.dy + this.dy
	);
};

$.multiplyByPoint = function(point){
	return new dream.Point(
			this.x0 * point.left + this.x1 * point.top + this.dx,
			this.y0 * point.left + this.y1 * point.top + this.dy
	);
};

Object.defineProperty($, "inverse", {
	get : function () {
		var x0 = this.x0;
		var y0 = this.y0;
		var x1 = this.x1;
		var y1 = this.y1;
		var dx = this.dx;
		var n = x0*y1-y0*x1;

		return new Matrix(y1/n, -y0/n, -x1/n, x0/n, (x1*this.dy-y1*dx)/n, -(x0*this.dy-y0*dx)/n);
	}
});

/**
 * 
 */
var Transformation = function(){
	this.isChanged = true;
};
var $ = Transformation.prototype;

dream.event.create($, "onChange");

Object.defineProperty($, "matrix", {
	get : function () {
		if(this.isChanged){
			this.updateMatrix();
			this.isChanged = false;
		}
		return this._matrix;
	}
});

Object.defineProperty($, "inverse", {
	get : function () {
		var m = this.matrix.inverse;
		return new Custom(m.x0, m.y0, m.x1, m.y1, m.dx, m.dy);
	}
});

$.hasTransform = false;

$.compose = function(transformation){
	var m = this.matrix.multiplyBy(transformation.matrix);
	return new Custom(m.x0, m.y0, m.x1, m.y1, m.dx, m.dy);
};

$.project = function(point){
	return this.matrix.multiplyByPoint(point);
};

$.projectRect = function(rect){
	return new dream.Rect(rect.left, rect.top, rect.width, rect.height, this.compose(rect.transformation));
};

$.unproject = function(point){
	return this.matrix.inverse.multiplyByPoint(point);
};

$.unprojectRect = function(rect){
	return new dream.Rect(rect.left, rect.top, rect.width, rect.height, this.inverse.compose(rect.transformation));
};

$.apply = function(context, origin){
	return origin;
};

/**
 * 
 */
var Identity = function(left, top){
	this._matrix = new Matrix();
}.inherits(Transformation);
var $ = Identity.prototype;

Object.defineProperty($, "matrix", {
	get : function () {
		return this._matrix;
	}
});

/**
 * 
 */
var Translation = function(left, top){
	Translation._superClass.call(this);
	this._left = left || 0;
	this._top = top || 0;
}.inherits(Transformation);
var $ = Translation.prototype;

dream.util.createEventFlagProperty($, "left");
dream.util.createEventFlagProperty($, "top");

Object.defineProperty($, "hasTransform", {
	get : function () {
		return this._left || this._top;
	}
});

$.updateMatrix = function(){
	this._matrix = new dream.transform.Matrix(1, 0, 0, 1, this._left, this._top);
};

$.apply = function(context, origin){
	return new dream.Point(origin.left + this._left|0, origin.top + this._top|0);
};

/**
 * 
 */
var Rotation = function(angle){
	Rotation._superClass.call(this);
	this._angle = angle * dream.transform.DEG_TO_RAD || 0;
}.inherits(Transformation);
var $ = Rotation.prototype;

Object.defineProperty($, "angle", {
	get: function () {
		return this._angle * dream.transform.RAD_TO_DEG;
	},
	set: function(v){
		this._angle = this.hasTransform = (v%360) * dream.transform.DEG_TO_RAD;
		this.isChanged = true;
		dream.event.dispatch(this, "onChange");
	} 
});

$.updateMatrix = function(){
	var a = this._angle,
		c = Math.cos(a),
		s = Math.sin(a);
	this._matrix = new dream.transform.Matrix(c, s, -s, c, 0, 0);
};

$.apply = function(context, origin){
	var ol = origin.left, ot = origin.top; 
	if(ol || ot){
		context.translate(ol, ot);
	}
	context.rotate(this._angle);
	return new dream.Point;
};

/**
 * 
 */
var Scale = function(x, y){
	Scale._superClass.call(this);
	this._x = x;
	this._y = y;
	
	if(this._x == undefined) this._x = 1;
	if(this._y == undefined) this._y = 1;
}.inherits(Transformation);
var $ = Scale.prototype;

dream.util.createEventFlagProperty($, "x");
dream.util.createEventFlagProperty($, "y");

Object.defineProperty($, "hasTransform", {
	get : function () {
		return this._x != 1 || this._y != 1;
	}
});

$.updateMatrix = function(){
	this._matrix = new dream.transform.Matrix(this._x, 0, 0, this._y, 0, 0);
};

$.apply = function(context, origin){
	var ol = origin.left, ot = origin.top; 
	if(ol || ot){
		context.translate(ol, ot);
	}
	context.scale(this._x, this._y);
	return new dream.Point;
};

/**
 * 
 */
var Custom = function(x0, y0, x1, y1, dx, dy){
	Custom._superClass.call(this);
	this._x0 = x0;
	if(!x0 && x0 !== 0) this._x0 = 1;
	this._y0 = y0 || 0;
	this._x1 = x1 || 0;
	this._y1 = y1;
	if(!y1 && y1 !== 0) this._y1 = 1;
	this._dx = dx || 0;
	this._dy = dy || 0;	
}.inherits(Transformation);
var $ = Custom.prototype;

dream.util.createEventFlagProperty($, "x0");
dream.util.createEventFlagProperty($, "y0");
dream.util.createEventFlagProperty($, "x1");
dream.util.createEventFlagProperty($, "y1");
dream.util.createEventFlagProperty($, "dx");
dream.util.createEventFlagProperty($, "dy");

Object.defineProperty($, "hasTransform", {
	get : function () {
		return this._x0 != 1 || this._y0 || this._x1 || this._y1 != 1 || this._dx || this._dy;
	}
});


$.updateMatrix = function(){
	this._matrix = new Matrix(this._x0, this._y0, this._x1, this._y1, this._dx, this._dy);
};

$.apply = function(context, origin){
	var ol = origin.left, ot = origin.top; 
	if(ol || ot){
		context.translate(ol, ot);
	}
	context.transform(this._x0, this._y0, this._x1, this._y1, this._dx, this._dy);
	return new dream.Point;
};


/**
 * 
 */
var Composite = function(transformations){
	Composite._superClass.call(this);
	var composite = this;
	this.transformations = new dream.util.ArrayList;
	this.transformations.onAdd.add(function(obj){
		obj.onChange.propagate(composite);
		obj.onChange.add(function(){composite.isChanged = true;});
		dream.event.dispatch(composite, "onChange");
		composite.isChanged = true;
	});
	this.transformations.onRemove.add(function(obj){
		obj.onChange.removeByOwner(composite);
		dream.event.dispatch(composite, "onChange");
		composite.isChanged = true;
	});
	this.transformations.addArray(transformations);
}.inherits(Transformation);
var $ = Composite.prototype;

Object.defineProperty($, "hasTransform", {
	get : function () {
		for (var i=0, t; t = this.transformations[i]; i++ )
			if(t.hasTransform) return true;
		return false;

	}
});

$.updateMatrix = function(){
	var r = this.transformations[0];
	for (var i=1, m; m = this.transformations[i]; i++ )
		if(r.hasTransform) r = r.compose(m);
	
	this._matrix = r && r.matrix || new Matrix();
};

$.apply = function(context, origin){ 	
//	var m = this.matrix;
//	context.transform(m.x0, m.y0, m.x1, m.y1, m.dx|0, m.dy |0);
//	return new dream.Point;
	var o = origin;
	for (var i=0, t; t = this.transformations[i]; i++ ){
		if(t.hasTransform) o = t.apply(context, o);
	}
	return o;
};

/**
 * 
 */
var Generic = function(left, top, scaleX, scaleY, rotation, anchorX, anchorY){
	Generic._superClass.apply(this);
	
	this._ax = -anchorX || 0;
	this._ay = -anchorY || 0;
	
	this.transformations.add(new Translation(left,top), "translation");
	this.transformations.add(new Scale(scaleX, scaleY), "scale");
	this.transformations.add(new Rotation(rotation), "rotation");
	this.transformations.add(new Translation(-anchorX,-anchorY), "anchor");
}.inherits(Composite);
var $ = Generic.prototype;

dream.util.createProperty($, "left", "transformations.translation.left");
dream.util.createProperty($, "top", "transformations.translation.top");
dream.util.createProperty($, "scaleX", "transformations.scale.x");
dream.util.createProperty($, "scaleY", "transformations.scale.y");
dream.util.createProperty($, "rotation", "transformations.rotation.angle");
Object.defineProperty($, "anchorX", {
	get : function() {
		return -this.transformations.anchor.left;
	},
	set : function(v) {
		this.transformations.anchor.left = this._ax = -v;
	}
});
Object.defineProperty($, "anchorY", {
	get : function() {
		return -this.transformations.anchor.top;
	},
	set : function(v) {
		this.transformations.anchor.top = this._ay = -v;
	}
});

$.apply = function(context, origin){

	if(this.transformations.scale.hasTransform || this.transformations.rotation.hasTransform){
		var m = this.matrix;
		context.transform(m.x0, m.y0, m.x1, m.y1, (m.dx|0) + origin.left, (m.dy|0) + origin.top);
		return new dream.Point;		
	}else{
		return new dream.Point((origin.left + this.transformations.translation.left + this._ax) |0,
						(origin.top + this.transformations.translation.top + this._ay) |0);
	}
};

//Exporting
dream.transform = {
		DEG_TO_RAD: Math.PI/180,
		RAD_TO_DEG: 180/Math.PI,
		
		Matrix: Matrix,
		Transformation: Transformation,
		Identity: Identity,
		Translation: Translation,
		Rotation: Rotation,
		Scale: Scale,
		Custom: Custom,
		Composite: Composite,
		Generic: Generic		
};


})();