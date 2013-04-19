(function(window){

var createPointProperty = function(obj, name){
	var _name = "_"+name;
	Object.defineProperty(obj, name, {
		get: function() {
			return this[_name];
		},
		set: function(v){
			var seg = this;
			if(this[_name]) this[_name].onChange.removeByOwner(obj);
			this[_name] = v;
			this[_name].onChange.add(function(){
				seg.updateLength();
				dream.event.dispatch(seg, "onChange");
			});
			this.updateLength();
			dream.event.dispatch(this, "onChange");
		}
	});
};

var Segment = function(x, y){
	if(x !== undefined || y !== undefined) this.dest = new dream.geometry.Point(x, y);
	this.length = 0;
	this.rect = new dream.geometry.Rect;
};

var $ = Segment.prototype;
dream.event.create($, "onChange");

createPointProperty($, "dest");

Object.defineProperty($, "previous", {
	get: function() {
		return this._previous;
	},
	set: function(v){
		var seg = this;
		if(this._previous) this._previous.dest.onChange.removeByOwner(this);
		this._previous = v;
		this.updateLength();
		dream.event.dispatch(seg, "onChange");
		if(this._previous) this._previous.dest.onChange.add(function(){
			seg.updateLength();
			dream.event.dispatch(seg, "onChange");
		});
	}
});

$.getOrigin = function(t){
	var t = t == undefined ? 0:t;
	if(t < 0 || t > 1)
		throw Error("t should be between 0-1 for solving a segment");
	if(!this.previous) 
		return new dream.geometry.Point;
	return this.previous.dest;
};

$.updateLength = function(stp){
	var stp = stp || 0.02,
		x=0, y=0, dx, dy, length = 0, point,
		orig = this.getOrigin(),
		maxX, minX, maxY, minY;
	minX = maxX = orig.left;
	maxY = minY = orig.top;
	for (var i=0; i <= 1; i+=stp){
		point = this.solve(i);
		if(point.left > maxX) maxX = point.left;
		else if(point.left < minX) minX = point.left;
		if(point.top > maxY) maxY = point.top;
		else if(point.top < minY) minY = point.top;
		dx = point.left - x;
		dy = point.top - y;
		x = point.left;
		y = point.top;
		length += Math.sqrt(dx*dx + dy*dy);
	}
	this.length = length;
	this.rect.left = minX;
	this.rect.top =  minY;
	this.rect.width = maxX - minX;
	this.rect.height = maxY - minY;
	return length;
};

var Line = function(x, y){
	Segment.call(this, x, y);
}.inherits(Segment);

var $ = Line.prototype;

$.solve = function(t){
	var orig = this.getOrigin(t);
	return new dream.geometry.Point((this.dest.left - orig.left) * t + orig.left, (this.dest.top - orig.top) * t + orig.top);
};
// line specific length calc
$.updateLength = function(){
	var orig = this.getOrigin();
	var dx= this.dest.left - orig.left;
	var dy= this.dest.top - orig.top;
	var length = Math.sqrt(dx*dx + dy*dy);
	if (dx > 0) {this.rect.left = orig.left; this.rect.width = dx;}
	else {this.rect.left = this.dest.left; this.rect.width = -1 * dx;};
	if (dy > 0) {this.rect.top = orig.top; this.rect.height = dy;}
	else {this.rect.top = this.dest.top; this.rect.height = -1 * dy;};
	this.length = length;
	return length;
};

$.draw = function(ctx, origin){
	ctx.lineTo(this.dest.left, this.dest.top);
};

var ZLine = function(x, y){
	Line.call(this, x, y);
}.inherits(Line);

var $ = ZLine.prototype;

$.getLastMove = function(){
	var node = this.previous;
	while (node){
		if(node instanceof Move)
			return node;
		node = node.previous;	
	}
};

$.init = function(){
	var lastMove = this.getLastMove();
	if(lastMove){
		this.dest = lastMove.dest;
	}
};

var Move = function(x, y){
	Segment.call(this, x, y);
}.inherits(Segment);

var $ = Move.prototype;

$.updateLength = function(){
	return this.length = 0;
};

$.solve = function(t){
	var orig = this.getOrigin(t);
	return new dream.geometry.Point(orig.left, orig.top);
};

$.draw = function(ctx, origin){
	ctx.moveTo(this.dest.left, this.dest.top);
};

var Arc = function(){
	
}.inherits(Segment);

var CubicBezier = function(cpx1, cpy1, cpx2, cpy2, x, y){
	Segment.call(this, x, y);
	this.cp1 = new dream.geometry.Point(cpx1, cpy1);
	this.cp2 = new dream.geometry.Point(cpx2, cpy2);
}.inherits(Segment);

var $ = CubicBezier.prototype;

createPointProperty($, "cp1");
createPointProperty($, "cp2");

$.solve = function(t){
	if ((! this.cp1) || (! this.cp2) || (! this.dest)) return 0;
	var orig = this.getOrigin(t);
	var t2= t*t, t3= t*t2, point = new dream.geometry.Point;
	// calc left
	var origleft = orig.left, cp1left = this._cp1._left, cp2left = this._cp2._left;
	point.left = (origleft + t * (-origleft * 3 + t * (3 * origleft-origleft*t)))+
					t*(3*cp1left+t*(-6*cp1left+cp1left*3*t))+
					t2*(cp2left*3-cp2left*3*t)+this.dest.left * t3;
	// calc top
	var origtop = orig.top, cp1top = this._cp1._top, cp2top = this._cp2._top;
	point.top = (origtop+t*(-origtop*3+t*(3*origtop-origtop*t)))+
				t*(3*cp1top+t*(-6*cp1top+cp1top*3*t))+t2*(cp2top*3-cp2top*3*t)+this.dest.top * t3;
	
	return point;
};

$.draw = function(ctx, origin){
	ctx.bezierCurveTo(this.cp1.left, this.cp1.top,this.cp2.left, this.cp2.top, this.dest.left, this.dest.top);
};

var SmoothCubicBezier = function(cp2x, cp2y, x, y){
	CubicBezier.call(this, 0, 0, cp2x, cp2y, x, y);
}.inherits(CubicBezier);

var $ = SmoothCubicBezier.prototype;

$._updateCp2 = function(v){
	if(v.cp2){
		this.cp1.left = 2 * v.dest.left - v.cp2.left;
		this.cp1.top =  2 * v.dest.top  - v.cp2.top;
	} else {
		this.cp1.left = v.dest.left;
		this.cp1.top =  v.dest.top;
	}
};
Object.defineProperty($, "previous", {
	get: function() {
		return this._previous;
	},
	set: function(v){
		var seg = this;
		if(this._previous) this._previous.dest.onChange.removeByOwner(this);
		if(this._previous) this._previous.cp2.onChange.removeByOwner(this);
		this._previous = v;
		this._updateCp2(v);
		this.updateLength();
		dream.event.dispatch(seg, "onChange");
		this._previous.dest.onChange.add(function(){
			seg._updateCp2(seg._previous);
			seg.updateLength();
			dream.event.dispatch(seg, "onChange");
		});
		this._previous.cp2.onChange.add(function(){
			seg._updateCp2(seg._previous);
			seg.updateLength();
			dream.event.dispatch(seg, "onChange");
		});
	}
});

var QuadraticBezier = function(cpx, cpy, x, y){
	Segment.call(this, x, y);
	this.cp = new dream.geometry.Point(cpx, cpy);
}.inherits(Segment);

var $ = QuadraticBezier.prototype;
createPointProperty($, "cp");

$.solve = function(t){
	if ((! this.cp) || (! this.dest)) return 0;
	var orig = this.getOrigin(t);
	var t1= 1-t, point = new dream.geometry.Point;
	point.left= t1*t1*orig.left + 2*t1*t*this._cp._left + t*t*this.dest.left;
	point.top= t1*t1*orig.top + 2*t1*t*this._cp._top + t*t*this.dest.top;
	return point;
};

$.draw = function(ctx, origin){
	ctx.quadraticCurveTo(this.cp.left, this.cp.top, this.dest.left, this.dest.top);
};

var SmoothQuadraticBezier = function(x, y){
	QuadraticBezier.call(this, 0, 0, x, y);
}.inherits(QuadraticBezier);

var $ = SmoothQuadraticBezier.prototype;

$._updateCp = function(v){
	if(v.cp){
		this.cp.left = 2 * v.dest.left - v.cp.left;
		this.cp.top =  2 * v.dest.top  - v.cp.top;
	} else {
		this.cp.left = v.dest.left;
		this.cp.top =  v.dest.top;
	}
};

Object.defineProperty($, "previous", {
	get: function() {
		return this._previous;
	},
	set: function(v){
		var seg = this;
		if(this._previous) this._previous.dest.onChange.removeByOwner(this);
		if(this._previous) this._previous.cp.onChange.removeByOwner(this);
		this._previous = v;
		this._updateCp(v);
		this.updateLength();
		dream.event.dispatch(seg, "onChange");
		this._previous.dest.onChange.add(function(){
			seg._updateCp(seg._previous);
			seg.updateLength();
			dream.event.dispatch(seg, "onChange");
		});
		this._previous.cp.onChange.add(function(){
			seg._updateCp(seg._previous);
			seg.updateLength();
			dream.event.dispatch(seg, "onChange");
		});
	}
});

//exports
dream.geometry.pathSegment = {
	Segment: Segment,
	Move: Move,
	Line: Line,
	ZLine: ZLine,
	QuadraticBezier: QuadraticBezier,
	CubicBezier: CubicBezier,
	SmoothQuadraticBezier: SmoothQuadraticBezier,
	SmoothCubicBezier: SmoothCubicBezier
};
	
})();