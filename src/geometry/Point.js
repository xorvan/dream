/**
 * @module geometry
 * @namespace dream.geometry
 */
(function(window){
/**
 * creates a Point
 * @class Point
 * @constructor
 * @param {Number} left
 * @param {Number} top
 */
var Point = function(left, top){
	this.left = left || 0;
	this.top = top || 0;
};
var Point$ = Point.prototype;

/**
 * the left position of Point in regard to it's parent, it is a getter/setter
 * @property left
 * @type Number
 */
/**
 * the top position of Point in regard to it's parent, it is a getter/setter
 * @property top
 * @type Number
 */

/**
 * *onChange* event will raise whenever sthe left or top property of *Point* is changed.
 * @event onChange
 * 
 */
dream.event.create(Point$, "onChange", function(){
	this._left = this.left;
	this._top = this.top;
	dream.util.createEventProperty(this, "left");
	dream.util.createEventProperty(this, "top");
});

/**
 * returns the string representation of *Point* (like Point[10, 20] )
 * @method toString
 * @returns {String} string
 */
Point$.toString = function(){return "Point["+this.left+", "+this.top+"]";};

/**
 * takes a {{#crossLink "dream.geometry.Rect"}}Rect{{/crossLink}} and checks if this *Point* is in given *Rect* or not.
 * @method isIn
 * @param rect
 * @returns {Boolean} result
 */
Point$.isIn = function(rect){
	return this.left >= rect.left && this.left <= rect.right && 
		this.top >= rect.top && this.top <= rect.bottom;
};

/**
 * returns another *Point* identical to current one
 * @method clone
 * @returns {Object} point
 */
Point$.clone = function(){
	return new Point(this.left, this.top);
};

dream.geometry.Point = Point;

})(window);