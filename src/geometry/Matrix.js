/**
 * @module geometry
 * @namespace dream.geometry
 */
(function(window){

/**
 * Matrix is Mathematical Object which is used to work with Transformations of Objects
 * you can make an Matrix Object with Specifing 6 parameters of it. note three items of x2, y2, 
 * and last item are set to 0, 0, 1 respectively, because they have no use in *Transformation* of objects
 * @class Matrix
 * @constructor
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} dx
 * @param {Number} dy
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
var Matrix$ = Matrix.prototype;

/**
 * takes an input matrix and multiply current matrix with it, and returns the result
 * @method multiplyBy
 * @param {dream.geometry.Matrix} matrix
 * @returns {dream.geometry.Matrix} result
 */
Matrix$.multiplyBy = function(matrix){
	return new dream.geometry.transform.Matrix(
			this.x0 * matrix.x0 + this.y0 * matrix.x1, this.x0 * matrix.y0 + this.y0 * matrix.y1, 
			this.x1 * matrix.x0 + this.y1 * matrix.x1, this.x1 * matrix.y0 + this.y1 * matrix.y1, 
			this.x0 * matrix.dx + this.x1 * matrix.dy + this.dx,
			this.y0 * matrix.dx + this.y1 * matrix.dy + this.dy
	);
};

/**
 * takes an input *Pont* and multiply current matrix with it, and returns the result
 * @method multiplyByPoint
 * @param {dream.geometry.Point} point
 * @returns {dream.geometry.Matrix} result
 */
Matrix$.multiplyByPoint = function(point){
	return new dream.geometry.Point(
			this.x0 * point.left + this.x1 * point.top + this.dx,
			this.y0 * point.left + this.y1 * point.top + this.dy
	);
};

Matrix$.multiplyDeltaByNumber = function(number){
	return new dream.geometry.transform.Matrix(
			this.x0, this.y0, 
			this.x1, this.y1, 
			this.dx * number, this.dy * number
	);
};

/**
 * returns the inverse of current matrix
 * @property inverse
 * @type {dream.geometry.Matrix} result
 * @readOnly
 */
Object.defineProperty(Matrix$, "inverse", {
	get : function () {
		var x0 = this.x0;
		var y0 = this.y0;
		var x1 = this.x1;
		var y1 = this.y1;
		var dx = this.dx;
		var dy = this.dy;
		var n = x0*y1-y0*x1;

		return new Matrix(y1/n, -y0/n, -x1/n, x0/n, (x1*dy-y1*dx)/n, -(x0*dy-y0*dx)/n);
	}
});

/**
 * Returns true if this *Matrix* is equal with given matrix parameter.
 * @method equals
 * @param {dream.geometry.Matrix} matrix
 */
Matrix$.equals = function(matrix){
	return this.x0 == matrix.x0 && this.y0 == matrix.y0 && 
		this.x1 == matrix.x1 && this.y1 == matrix.y1 && 
		this.dx == matrix.dx && this.dy == matrix.dy;
};

dream.geometry.Matrix = Matrix;

})(window);