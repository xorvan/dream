/**
 * @module geometry
 * @namespace deam.geometry
 */
(function(window){
/**
 * @class Rect
 * @constructor
 * @param {Number} left
 * @param {Number} top
 * @param {Number} width
 * @param {Number} height
 * @param {dream.geometry.transform.Transformation} [transformation]
 */

var Rect = function(left, top, width, height, transformation){
	this.width = width || 0;
	this.height = height || 0;
	
	this.left = left || 0;
	this.top = top || 0;
	
	this.transformation = transformation || new dream.geometry.transform.Identity;
};
var Rect$ = Rect.prototype;

Object.defineProperty(Rect$, "right", {
	get : function () { return this.left + this.width;}
});

Object.defineProperty(Rect$, "bottom", {
	get : function () { return this.top + this.height;}
});

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

Rect$.hasIntersectWith = function(rect){
	return this.right > rect.left && 
		this.left < rect.right && 
		this.bottom > rect.top && 
		this.top < rect.bottom;
};

Rect$.getIntersectWith = function(rect){
	if(this.hasIntersectWith(rect)){
		var l = Math.max(rect.left, this.left);
		var t = Math.max(rect.top, this.top);
		var r = Math.min(rect.right, this.right);
		var b = Math.min(rect.bottom, this.bottom);
		
		return new dream.geometry.Rect(l, t, r - l + 1, b - t + 1);
	}else{
		return false;
	}
};

Rect$.covers = function(rect){
	return this.left <= rect.left && this.right >= rect.right &&
		this.top <= rect.top && this.bottom >= rect.bottom;
};

Rect$.isEqualWith = function(rect){
	return this.left == rect.left && this.width == rect.width &&
		this.top == rect.top && this.height == rect.height;
};

Rect$.add = function(rect){
	var r = new dream.geometry.Rect(this.left<rect.left?this.left:rect.left, this.top<rect.top?this.top:rect.top);
	r.width = (this.right>rect.right?this.right:rect.right) - r.left;
	r.height = (this.bottom>rect.bottom?this.bottom:rect.bottom) - r.top;
	r.transformation = this.transformation;
	return r;
};

Rect$.clone = function(){
	return new dream.geometry.Rect(this.left, this.top, this.width, this.height);
};

Rect$.toString = function(){return "Rect["+this.left+", "+this.top+", "+this.width+", "+this.height+"]";};

dream.geometry.Rect = Rect

})(window);