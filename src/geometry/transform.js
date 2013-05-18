/**
 * @module geometry
 * @namespace dream.geometry.transform
 */
(function(window){

var Matrix = dream.geometry.Matrix;
	
/**
 * this is super class for all kind of transformations
 * @class Transformation
 * @constructor
 */
var Transformation = function(){
	this.isChanged = true;
};
var Transformation$ = Transformation.prototype;

/**
 * *onChange* event will raise whenever the items of *Transformation* is changed.
 * @event onChange
 * 
 */
dream.event.create(Transformation$, "onChange");

/**
 * *onPositionChange* event will raise whenever the *Transformation* changes in such a way that it affects positions
 * of the host object of it. for example if some items of Translate, Transformation change, the graphic object that has this
 * transformation will change it's position.
 * @event onPositionChange
 * 
 */
dream.event.create(Transformation$, "onPositionChange");

/**
 * this property returns the transformation matrix of current transformation. it is readonly
 * @property matrix
 * @type {dream.geometry.Matrix}
 * @readOnly
*/
Object.defineProperty(Transformation$, "matrix", {
	get : function () {
		if(this.isChanged){
			this.updateMatrix();
			this.isChanged = false;
		}
		return this._matrix;
	}
});

/**
 * this property returns inverse *Transformation* of current *Transformation*, for example if we have an 
 * scale(2) transformation, it's inverse will return scale(0.5) *Transformation*
 * @property inverse
 * @type {dream.geometry.Matrix}
 * @readOnly
*/
Object.defineProperty(Transformation$, "inverse", {
	get : function () {
		var m = this.matrix.inverse;
		return new Custom(m.x0, m.y0, m.x1, m.y1, m.dx, m.dy);
	}
});

Transformation$.hasTransform = false;

/**
 * this method will multiply the transformation matrix of given *Transformation* to produce the effectof boh transformation
 * for example if we have scale(2) transformation and compose it with rotate(30), the result will be a transformation with 
 * effectof scale(2) and rotate(30)
 * @method compose
 * @param {dream.transformation.Transformation} inputMatrix
 * @returns {dream.transformation.Transformation} result
 */
Transformation$.compose = function(transformation){
	var m = this.matrix.multiplyBy(transformation.matrix);
	return new Custom(m.x0, m.y0, m.x1, m.y1, m.dx, m.dy);
};

/**
 * project given *Point* with current transformation. for example if we have point in a shape which is rotated by 30 degree,
 * projecting it with that shape's *Transformation* will result a point in the coordination with no rotation.
 * @method project
 * @param {dream.geometry.Point} point
 * @returns {dream.geometry.Point} result
 */
Transformation$.project = function(point){
	return this.matrix.multiplyByPoint(point);
};

/**
 * project given *Rect* with current transformation. for example if we have rect in a shape which is rotated by 30 degree,
 * projecting it with that shape's *Transformation* will result a rect in the coordination with no rotation.
 * @method projectRect
 * @param {dream.geometry.Rect} rect
 * @returns {dream.geometry.Rect} result
 */
Transformation$.projectRect = function(rect){
	return new dream.geometry.Rect(rect.left, rect.top, rect.width, rect.height, this.compose(rect.transformation));
};

/**
 * unproject given *Point* with current transformation. for example if we have point in the coordination with no rotation
 * unprojcting it with transfomation of a shape which is rotated by 30 degree, will result a *Point* in a coordination with
 * the 30 degree rotation
 * projecting it with that shape's *Transformation* will result a point .
 * @method unproject
 * @param {dream.geometry.Point} point
 * @returns {dream.geometry.Point} result
 */
Transformation$.unproject = function(point){
	return this.matrix.inverse.multiplyByPoint(point);
};

/**
 * unproject given *Rect* with current transformation. for example if we have *Rect* in the coordination with no rotation
 * unprojcting it with transfomation of a shape which is rotated by 30 degree, will result a *Rect* in a coordination with
 * the 30 degree rotation
 * @method projectRect
 * @param {dream.geometry.Rect} rect
 * @returns {dream.geometry.Rect} result
 */
Transformation$.unprojectRect = function(rect){
	return new dream.geometry.Rect(rect.left, rect.top, rect.width, rect.height, this.inverse.compose(rect.transformation));
};

Transformation$.apply = function(context, origin){
	return origin;
};

/**
 * the *Identity* transformtion will return a *Transformation* with no effect
 * @class Identity
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * 
 */
var Identity = function(left, top){
	this._matrix = new Matrix();
}.inherits(Transformation);
var Identity$ = Identity.prototype;

Object.defineProperty(Identity$, "matrix", {
	get : function () {
		return this._matrix;
	}
});

/**
 * the *Translation* transformtion displaces host object, meaning change it's left and top properties
 * @class Translation
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * @param {Number} left
 * @param {Number} top
 * 
 */
var Translation = function(left, top){
	Translation._superClass.call(this);
	this._left = left || 0;
	this._top = top || 0;
}.inherits(Transformation);
var Translation$ = Translation.prototype;

dream.util.createEventFlagProperty(Translation$, "left", "onPositionChange");
dream.util.createEventFlagProperty(Translation$, "top", "onPositionChange");

Object.defineProperty(Translation$, "hasTransform", {
	get : function () {
		return (this._left || this._top) ? true:false;
	}
});

Translation$.updateMatrix = function(){
	this._matrix = new dream.geometry.transform.Matrix(1, 0, 0, 1, this._left, this._top);
};

Translation$.apply = function(context, origin){
	return new dream.geometry.Point(origin.left + this._left|0, origin.top + this._top|0);
};

/**
 * the *Rotation* transformtion rotates host object
 * @class Rotation
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * @param {Number} angle
 * 
 */
var Rotation = function(angle){
	Rotation._superClass.call(this);
	this._angle = angle * dream.geometry.transform.DEG_TO_RAD || 0;
}.inherits(Transformation);
var Rotation$ = Rotation.prototype;

Object.defineProperty(Rotation$, "angle", {
	get: function () {
		return this._angle * dream.geometry.transform.RAD_TO_DEG;
	},
	set: function(v){
		this._angle = this.hasTransform = (v%360) * dream.geometry.transform.DEG_TO_RAD;
		this.isChanged = true;
		dream.event.dispatch(this, "onChange");
	} 
});

Rotation$.updateMatrix = function(){
	var a = this._angle,
		c = Math.cos(a),
		s = Math.sin(a);
	this._matrix = new dream.geometry.transform.Matrix(c, s, -s, c, 0, 0);
};

Rotation$.apply = function(context, origin){
	var ol = origin.left, ot = origin.top; 
	if(ol || ot){
		context.translate(ol, ot);
	}
	context.rotate(this._angle);
	return new dream.geometry.Point;
};

/**
 * the *Scale* transformtion scales host object in x and y axises
 * @class Scale
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * @param {Number} saleX
 * @param {Number} scaleY
 * 
 */
var Scale = function(x, y){
	Scale._superClass.call(this);
	this._x = x;
	this._y = y;
	
	if(this._x == undefined) this._x = 1;
	if(this._y == undefined) this._y = 1;
}.inherits(Transformation);
var Scale$ = Scale.prototype;

dream.util.createEventFlagProperty(Scale$, "x");
dream.util.createEventFlagProperty(Scale$, "y");

Object.defineProperty(Scale$, "hasTransform", {
	get : function () {
		return this._x != 1 || this._y != 1;
	}
});

Scale$.updateMatrix = function(){
	this._matrix = new dream.geometry.transform.Matrix(this._x, 0, 0, this._y, 0, 0);
};

Scale$.apply = function(context, origin){
	var ol = origin.left, ot = origin.top; 
	if(ol || ot){
		context.translate(ol, ot);
	}
	context.scale(this._x, this._y);
	return new dream.geometry.Point;
};

/**
 * the *Custom* transformtion changes the host object properties with given matrix items
 * @class Custom
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} dx
 * @param {Number} dy
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
var Custom$ = Custom.prototype;

dream.util.createEventFlagProperty(Custom$, "x0");
dream.util.createEventFlagProperty(Custom$, "y0");
dream.util.createEventFlagProperty(Custom$, "x1");
dream.util.createEventFlagProperty(Custom$, "y1");
dream.util.createEventFlagProperty(Custom$, "dx");
dream.util.createEventFlagProperty(Custom$, "dy");

Object.defineProperty(Custom$, "hasTransform", {
	get : function () {
		return (this._x0 != 1 || this._y0 || this._x1 || this._y1 != 1 || this._dx || this._dy) ? true:false;
	}
});


Custom$.updateMatrix = function(){
	this._matrix = new Matrix(this._x0, this._y0, this._x1, this._y1, this._dx, this._dy);
};

Custom$.apply = function(context, origin){
	var ol = origin.left, ot = origin.top; 
	if(ol || ot){
		context.translate(ol, ot);
	}
	context.transform(this._x0, this._y0, this._x1, this._y1, this._dx, this._dy);
	return new dream.geometry.Point;
};


/**
 * the *Composite* transformtion gives an Array of *Transformation*s as input
 *  and composes them into one resulting *Transformation*
 * @class Composite
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * @param {Array} transformations
 * 
 */
var Composite = function(transformations){
	Composite._superClass.call(this);
	var composite = this;
	this.transformations = new dream.collection.Dict;
	this.transformations.onAdd.add(function(obj){
		obj.onChange.propagate(composite);
		obj.onPositionChange.propagate(composite);
		obj.onChange.add(obj.onPositionChange.add(function(){composite.isChanged = true;}));
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
var Composite$ = Composite.prototype;

Object.defineProperty(Composite$, "hasTransform", {
	get : function () {
		for (var i=0, t; t = this.transformations[i]; i++ )
			if(t.hasTransform) return true;
		return false;

	}
});

Composite$.updateMatrix = function(){
	var r = this.transformations[0];
	for (var i=1, m; m = this.transformations[i]; i++ )
		if(m.hasTransform) r = r.compose(m);
	
	this._matrix = r && r.matrix || new Matrix();
};

Composite$.apply = function(context, origin){ 	
//	var m = this.matrix;
//	context.transform(m.x0, m.y0, m.x1, m.y1, m.dx|0, m.dy |0);
//	return new dream.geometry.Point;
	var o = origin;
	for (var i=0, t; t = this.transformations[i]; i++ ){
		if(t.hasTransform) o = t.apply(context, o);
	}
	return o;
};

/**
 * the *Generic* transformtion lets you buils a transformation based on the properties you want
 * @class Generic
 * @constructor
 * @extends dream.geometry.transform.Transformation
 * @param {Number} left
 * @param {Number} top
 * @param {Number} scaleX
 * @param {Number} scaleY
 * @param {Number} rotation
 * @param {Number} anchorX
 * @param {Number} anchorY
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
var Generic$ = Generic.prototype;

dream.util.createProperty(Generic$, "left", "transformations.translation.left");
dream.util.createProperty(Generic$, "top", "transformations.translation.top");
dream.util.createProperty(Generic$, "scaleX", "transformations.scale.x");
dream.util.createProperty(Generic$, "scaleY", "transformations.scale.y");
dream.util.createProperty(Generic$, "rotation", "transformations.rotation.angle");
Object.defineProperty(Generic$, "anchorX", {
	get : function() {
		return -this.transformations.anchor.left;
	},
	set : function(v) {
		this.transformations.anchor.left = this._ax = -v;
	}
});
Object.defineProperty(Generic$, "anchorY", {
	get : function() {
		return -this.transformations.anchor.top;
	},
	set : function(v) {
		this.transformations.anchor.top = this._ay = -v;
	}
});

Generic$.apply = function(context, origin){

	if(this.transformations.scale.hasTransform || this.transformations.rotation.hasTransform){
		var m = this.matrix;
		context.transform(m.x0, m.y0, m.x1, m.y1, (m.dx|0) + origin.left, (m.dy|0) + origin.top);
		return new dream.geometry.Point;		
	}else{
		return new dream.geometry.Point((origin.left + this.transformations.translation.left + this._ax) |0,
						(origin.top + this.transformations.translation.top + this._ay) |0);
	}
};

//Exporting
dream.geometry.transform = {
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

})(window);