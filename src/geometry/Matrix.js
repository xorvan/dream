(function(window){

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
var Matrix$ = Matrix.prototype;

Matrix$.multiplyBy = function(matrix){
	return new dream.geometry.transform.Matrix(
			this.x0 * matrix.x0 + this.y0 * matrix.x1, this.x0 * matrix.y0 + this.y0 * matrix.y1, 
			this.x1 * matrix.x0 + this.y1 * matrix.x1, this.x1 * matrix.y0 + this.y1 * matrix.y1, 
			this.x0 * matrix.dx + this.x1 * matrix.dy + this.dx,
			this.y0 * matrix.dx + this.y1 * matrix.dy + this.dy
	);
};

Matrix$.multiplyByPoint = function(point){
	return new dream.geometry.Point(
			this.x0 * point.left + this.x1 * point.top + this.dx,
			this.y0 * point.left + this.y1 * point.top + this.dy
	);
};

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

dream.geometry.Matrix = Matrix;

})(window);