(function(window){

var PathArgumentError = function(s, cn){
	return Error("Invalid SVG Path '"+s+"', Argument count mismatch! At Command:  "+ cn+".");
};

var pathSegment = dream.geometry.pathSegment;

var Path = function(s){
	var pth = this;
	this.segments = new dream.collection.LinkedList;
	this.segments.onAdd.add(function(obj){
		// manage change of segments
		obj.onChange.add(function(){
			pth.updateLength();
			dream.event.dispatch(pth, "onChange");
		});
		dream.event.dispatch(obj, "onChange");
		// manage adding move for zooms
		
		// manage adding for smooth curves
		
	});
	this.segments.onRemove.add(function(obj){
		pth.length -= obj.length;
		obj.onChange.removeByOwner(pth);
		dream.event.dispatch(pth, "onChange");
	});
	this.length = 0;
	this.rect = new dream.geometry.Rect;
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
	var tokens = s.replace(/,/g, " ").split(/([a-zA-Z])([\-0-9,\s]+)/)
		.map(function(c){if(c != "") return /^[a-zA-Z]{1}$/.test(c) ? c : c.trim().split(/\s+/g);});

	var cn, lcn, ox = 0, oy = 0;
	//console.log(TT = tokens);return 0;
	while(tokens.length){
		cn = tokens.shift();
		if(!cn) continue;
		lcn = cn.toLowerCase();
		args = tokens.shift();
		isRel = lcn == cn;
		var c = false;
		switch(lcn){
			case "m":
				c = pathSegment.Move;
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
				var com = new pathSegment.ZLine(0, 0);
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
				this.segments.push(new pathSegment.CubicBezier(x1, y1, x2, y2, x, y));
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
				this.segments.push(new pathSegment.SmoothCubicBezier(x1, y1, x, y));
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
				this.segments.push(new pathSegment.QuadraticBezier(x1, y1, x, y));
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
				this.segments.push(new pathSegment.SmoothQuadraticBezier(x, y));
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

dream.geometry.Path = Path;
	
})(window);