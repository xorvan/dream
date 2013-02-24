(function(window){

var PathArgumentError = function(s, cn){
	return Error("Invalid SVG Path '"+s+"', Argument count mismatch! At Command:  "+ cn+".");
};

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

var Path = function(s){
	var pth = this;
	this.segments = new dream.collection.Linkedlist;
	this.segments.onAdd.add(function(obj){
		// manage change of segments
		obj.onChange.add(function(){
			pth.updateLength();
			dream.event.dispatch(pth, "onChange");
		});
		dream.event.dispatch(pth, "onChange");
		// manage adding move for zooms
		
		// manage adding for smooth curves
		
	});
	this.segments.onRemove.add(function(obj){
		pth.length -= obj.length;
		obj.onChange.removeByOwner(pth);
		dream.event.dispatch(pth, "onChange");
	});
	this.length = 0;
	this.rect = new dream.Rect;
	if(s){
		this.parse(s);
		this.updateLength();
	}
};

var $ = Path.prototype;

dream.event.create($, "onChange");

$.draw = function(context, origin){
	context.beginPath();
	var node = this.segments.first;
	while(node) {
		node.draw(context, origin);
		node = node.next;
	};
};

$.updateLength = function(){
	var length = 0, node = this.segments.first;
	while (node){
		length += node.length;
		this.rect = this.rect.add(node.rect);
		node = node.next;
	}
	this.length = length;
	return length;
};

$.solve = function(t){
	if(t > 1) 
		throw Error("'t' should be between 0 and 1 for solving a Path!");
	else if(t == 1) 
		return this.segments.last.solve(1);
	var node = this.segments.first, s = 0, p = this.length * t, st;
	while(s + node.length < p){
		s += node.length;
		node = node.next;
	}
	st = (p - s) / node.length;
	return node.solve(st);
};

$.parse = function(s){
	var tokens = s.replace(/,/g, " ").split(/([a-zA-Z])([0-9,\s]+)/)
		.map(function(c){if(c != "") return /^[a-zA-Z]{1}$/.test(c) ? c : c.trim().split(/\s+/g);});

	var cn, lcn, ox = 0, oy = 0;
	console.log(tokens);
	while(tokens.length){
		cn = tokens.shift();
		if(!cn) continue;
		lcn = cn.toLowerCase();
		args = tokens.shift();
		isRel = lcn == cn;
		var c = false;
		switch(lcn){
			case "m":
				c = Move;
			case "l":
				if(!c) c = Line;
				
				if(args.length < 2) throw PathArgumentError(s, cn);
				
				var x = +args.shift(), y = +args.shift();
				if(isRel){
					x += ox;
					y += oy;
				}
				ox = x;
				oy = y;
				this.segments.push(new c(x, y));
				break;
			case "z":
				args = [];
				var com = new Zline(0, 0);
				this.segments.push(com);
				com.init();
				break;
			case "c":
				if(args.length < 6) throw PathArgumentError(s, cn);
				var x1 = +args.shift(), y1 = +args.shift(),
					x2 = +args.shift(), y2 = +args.shift(),
					x = +args.shift(), y = +args.shift();
				
				if(isRel){
					x += ox;
					y += oy;
					x1 += ox;
					y1 += oy;
					x2 += ox;
					y2 += oy;
				}
				ox = x;
				oy = y;
				this.segments.push(new CubicBezier(x1, y1, x2, y2, x, y));
				break;
			case "s":
				if(args.length < 4) throw PathArgumentError(s, cn);
				var x1 = +args.shift(), y1 = +args.shift(),
					x = +args.shift(), y = +args.shift();
				
				if(isRel){
					x += ox;
					y += oy;
					x1 += ox;
					y1 += oy;
				}
				ox = x;
				oy = y;
				this.segments.push(new SmoothCubicBezier(x1, y1, x, y));
				break;	
			case "q":
				if(args.length < 4) throw PathArgumentError(s, cn);
				var x1 = +args.shift(), y1 = +args.shift(),
				x = +args.shift(), y = +args.shift();
				
				if(isRel){
					x += ox;
					y += oy;
					x1 += ox;
					y1 += oy;
				}
				ox = x;
				oy = y;
				this.segments.push(new QuadraticBezier(x1, y1, x, y));
				break;
			case "t":
				if(args.length < 2) throw PathArgumentError(s, cn);
				var x = +args.shift(), y = +args.shift();
				if(isRel){
					x += ox;
					y += oy;
				}
				ox = x;
				oy = y;
				this.segments.push(new SmoothQuadraticBezier(x, y));
				break;
			default:
				throw new Error("Invalid SVG Path '"+s+"', command is not defined! At Command:  "+ cn+".");
		}
		if(args.length){
			tokens.unshift(args);
			tokens.unshift(cn);
		}
	}
	
};


var Segment = function(x, y){
	if(x !== undefined || y !== undefined) this.dest = new dream.Point(x, y);
	this.length = 0;
	this.rect = new dream.Rect;
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
		return new dream.Point;
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
	return new dream.Point((this.dest.left - orig.left) * t + orig.left, (this.dest.top - orig.top) * t + orig.top);
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

var Zline = function(x, y){
	Line.call(this, x, y);
}.inherits(Line);

var $ = Zline.prototype;

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
	return new dream.Point(orig.left, orig.top);
};

$.draw = function(ctx, origin){
	ctx.moveTo(this.dest.left, this.dest.top);
};

var Arc = function(){
	
}.inherits(Segment);

var CubicBezier = function(cpx1, cpy1, cpx2, cpy2, x, y){
	Segment.call(this, x, y);
	this.cp1 = new dream.Point(cpx1, cpy1);
	this.cp2 = new dream.Point(cpx2, cpy2);
}.inherits(Segment);

var $ = CubicBezier.prototype;

createPointProperty($, "cp1");
createPointProperty($, "cp2");

$.solve = function(t){
	if ((! this.cp1) || (! this.cp2) || (! this.dest)) return 0;
	var orig = this.getOrigin(t);
	var t2= t*t, t3= t*t2, point = new dream.Point;
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

$.solve = function(t){
	if ((! this.cp1) || (! this.cp2) || (! this.dest)) return 0;
	var orig = this.getOrigin(t);
	var t2= t*t, t3= t*t2, point = new dream.Point;
	// calc first control point
	var lc = this.previous;
	if(lc instanceof CubicBezier || lc instanceof SmoothCubicBezier ){
		this._cp1._left = 2 * orig.left - lc.cp2.left;
		this._cp1._top = 2 * orig.top - lc.cp2.top;
	} else {
		this._cp1._left = orig.left;
		this._cp1._top = orig.top;
	}
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

var QuadraticBezier = function(cpx, cpy, x, y){
	Segment.call(this, x, y);
	this.cp = new dream.Point(cpx, cpy);
}.inherits(Segment);

var $ = QuadraticBezier.prototype;
createPointProperty($, "cp");

$.solve = function(t){
	if ((! this.cp) || (! this.dest)) return 0;
	var orig = this.getOrigin(t);
	var t1= 1-t, point = new dream.Point;
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

$.solve = function(t){
	if ((! this.cp) || (! this.dest)) return 0;
	var t1= 1-t, point = new dream.Point;
	var orig = this.getOrigin(t);
	// calc control point
	var lq = this.previous;
	if(lq instanceof QuadraticBezier || lq instanceof SmoothQuadraticBezier ){
		this._cp._left = 2 * orig.left - lq.cp.left;
		this._cp._top = 2 * orig.top - lq.cp.top;
	} else {
		this._cp._left = orig.left;
		this._cp._top = orig.top;
	}
	point.left= t1*t1*orig.left + 2*t1*t*this._cp._left + t*t*this.dest.left;
	point.top= t1*t1*orig.top + 2*t1*t*this._cp._top + t*t*this.dest.top;
	return point;
};


//exports

dream.geometry = {
		Path: Path,
		PathSegment : {
			Move: Move,
			Line: Line,
			Zline : Zline,
			QuadraticBezier : QuadraticBezier,
			CubicBezier : CubicBezier,
			SmoothQuadraticBezier : SmoothQuadraticBezier,
			SmoothCubicBezier : SmoothCubicBezier
				}
		
};
	
	
	
})();