/**
 * @module geometry
 * @namespace deam.geometry
 */
(function(window){
/**
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

dream.event.create(Point$, "onChange", function(){
	this._left = this.left;
	this._top = this.top;
	dream.util.createEventProperty(this, "left");
	dream.util.createEventProperty(this, "top");
});

Point$.toString = function(){return "Point["+this.left+", "+this.top+"]";};

Point$.isIn = function(rect){
	return this.left >= rect.left && this.left <= rect.right && 
		this.top >= rect.top && this.top <= rect.bottom;
};

Point$.clone = function(){
	return new Point(this.left, this.top);
};

dream.geometry.Point = Point;

})(window);