/**
 * @module geometry
 * @namespace dream.geometry
 */
(function(window){
/**creates a *Rect* object, the *Rect* object is a rectangle which has left, top, width, height
 *  and transformation (which is a transformation matrix)
 * @class Rect
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} width
 * @param {Number} height
 * @param {dream.geometry.transform.Transformation} [transformation]
 * this parameter should be an instance of dream.geometry.transform
 */
var Rect = function(left, top, width, height, transformation){
	this.width = width || 0;
	this.height = height || 0;
	
	this.left = left || 0;
	this.top = top || 0;
	
	this.transformation = transformation || new dream.geometry.transform.Identity;
};

/**
 * the left position of *Rect* in regard to it's parent, it is a getter/setter
 * @property left
 * @type Number
 */
/**
 * the top position of *Rect* in regard to it's parent, it is a getter/setter
 * @property top
 * @type Number
 */
/**
 * the width of *Rect*, it is a getter/setter
 * @property width
 * @type Number
 */
/**
 * the height position of *Rect*, it is a getter/setter
 * @property height
 * @type Number
 */
/**
 * the transformation of *Rect*, it is a getter/setter
 * @property left
 * @type dream.geometry.transform
 */
var Rect$ = Rect.prototype;
/**
 * the right position of *Rect* in regard to it's parent, it is only getter
 * @property right
 * @type Number
 */
Object.defineProperty(Rect$, "right", {
	get : function () { return this.left + this.width;}
});

/**
 * the bottom position of *Rect* in regard to it's parent, it is only getter
 * @property bottom
 * @type Number
 */
Object.defineProperty(Rect$, "bottom", {
	get : function () { return this.top + this.height;}
});
/**
 * the area of *Rect* (width * height), it is only getter
 * @property area
 * @type Number
 */
Object.defineProperty(Rect$, "area", {
	get : function () { return this.width * this.height;}
});

/**
 * the boundary property returns containing *Rect* of current *Rect*, the returned *Rect* does not have any transformation.
 * if we remove all the transformation of current *Rect* (rotation, scale, etc) then t's boundary will be 
 * equal to itself, it is only getter
 * @property boundary
 * @type dream.geometry.Rect
 */
Object.defineProperty(Rect$, "boundary", {
	get : function () { 
		if(!this.transformation || this.transformation instanceof dream.geometry.transform.Identity){
			return this.clone();
		}else{
			var m = this.transformation.matrix;
			var l = this.left, r = this.right, t = this.top, b = this.bottom;
			var tps = [
			          m.multiplyByPoint(new dream.geometry.Point(l, t)),
			          m.multiplyByPoint(new dream.geometry.Point(r, t)),
			          m.multiplyByPoint(new dream.geometry.Point(l, b)),
			          m.multiplyByPoint(new dream.geometry.Point(r, b))
			          ];
			
			var tp = tps[0].clone();
			var tp1 = tps[0].clone();
			for ( var i = 0; i < 4; i++) {
				if (tps[i].left < tp.left)
					tp.left = tps[i].left;
				if (tps[i].left > tp1.left)
					tp1.left = tps[i].left;
				if (tps[i].top < tp.top)
					tp.top = tps[i].top;
				if (tps[i].top > tp1.top)
					tp1.top = tps[i].top;
			}
			
			return new dream.geometry.Rect(tp.left, tp.top, tp1.left - tp.left, tp1.top - tp.top);
		}
	}
});

/**
 * returns true if current *Rect* has intersect with given *Rect*, otherwise returns false.
 * @method hasIntersectWith
 * @param {dream.geometry.Rect} rect
 * @returns {Boolean} result
 */
Rect$.hasIntersectWith = function(rect){
	return this.right > rect.left && 
		this.left < rect.right && 
		this.bottom > rect.top && 
		this.top < rect.bottom;
};

/**
 * returns the intersecting *Rect* between current *Rect* and given *Rect*,
 *  returns false if there is no intersection
 * @method getIntersectWith
 * @param {dream.geometry.Rect} rect
 * @returns {dream.geometry.Rect} result
 */
Rect$.getIntersectWith = function(rect){
	if(this.hasIntersectWith(rect)){
		var l = Math.max(rect.left, this.left);
		var t = Math.max(rect.top, this.top);
		var r = Math.min(rect.right, this.right);
		var b = Math.min(rect.bottom, this.bottom);
		
		return new dream.geometry.Rect(l, t, r - l, b - t);
	}else{
		return false;
	}
};

/**
 * returns true if current *Rect* covers given *Rect* (contains it), otherwise returns false.
 * @method covers
 * @param {dream.geometry.Rect} rect
 * @returns {Boolean} result
 */
Rect$.covers = function(rect){
	return this.left <= rect.left && this.right >= rect.right &&
		this.top <= rect.top && this.bottom >= rect.bottom;
};

/**
 * returns true if current *Rect* is equal with given *Rect* without considering transformations.
 * (left, top, width, height of them are equal), otherwise returns false.
 * @method isEqualWith
 * @param {dream.geometry.Rect} rect
 * @returns {Boolean} result
 */
Rect$.isEqualWith = function(rect){
	return this.left == rect.left && this.width == rect.width &&
		this.top == rect.top && this.height == rect.height;
};

/**
 * adds current *Rect* and given *Rect* and return resulting *Rect*,
 *  adding two rects will result in equal or larger *Rect*
 * @method add
 * @param {dream.geometry.Rect} rect
 * @returns {dream.geometry.Rect} result
 */
Rect$.add = function(rect){
	var r = new dream.geometry.Rect(this.left<rect.left?this.left:rect.left, this.top<rect.top?this.top:rect.top);
	r.width = (this.right>rect.right?this.right:rect.right) - r.left;
	r.height = (this.bottom>rect.bottom?this.bottom:rect.bottom) - r.top;
	r.transformation = this.transformation;
	return r;
};

/**
 * returns and identical copy of current *Rect* without applying transformations. 
 * @method clone
 * @returns {dream.geometry.Rect} result
 */
Rect$.clone = function(){
	return new dream.geometry.Rect(this.left, this.top, this.width, this.height);
};

/**
 * returns the string representation of current *Rect* (like Rect[0, 0, 20, 30] )
 * @method toString
 * @returns {String} string
 */
Rect$.toString = function(){return "Rect["+this.left+", "+this.top+", "+this.width+", "+this.height+"]";};

dream.geometry.Rect = Rect;

})(window);