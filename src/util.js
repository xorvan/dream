(function(window){

	/**
	 * @param items
	 * @constructor
	 */
	var ArrayList = function(items){
		this.keys = {};
		this._index = {};
		
		if(items) this.addArray(items);
	}.inherits(Array);
	var ArrayList$ = ArrayList.prototype;

	dream.event.create(ArrayList$, "onAdd");	
	dream.event.create(ArrayList$, "onRemove");

	/**
	 * @param object
	 * @param {string} [id]
	 */
	ArrayList$.add = function(object, id){
		//dream.util.assert(object);
		var gid = dream.util.getId(object);
		if(this._index[gid]) return object;
		
		var nid = id || "id" + gid;
		if(this.keys[nid] != undefined) {console.log(nid+" replaced!");this.remove(nid);};
		
		this._index[gid] = nid;
		this.keys[nid] = this.push(object) -1;
		this[nid] = object;
		dream.event.dispatch(this, "onAdd", object);
		return object;
	};

	ArrayList$.indexOf = function(object){
		if(object instanceof Object){
			return this.keys[this._index[dream.util.getId(object)]];
		}else{
			return this.keys[object];	
		}
	};

	ArrayList$.removeByIndex = function(index){
		dream.util.assert(typeof index == "number");
		var r = this.splice(index, 1)[0];
		dream.util.assert(r);
		var gid = dream.util.getId(r);
		var id = this._index[gid];
		delete this.keys[id];
		delete this._index[gid];
		delete this[id];
		for (var i=index, o; o = this[i]; i++ ){
			this.keys[this._index[dream.util.getId(o)]] --;		
		}
		dream.event.dispatch(this, "onRemove", r);
		return r;
	};

	ArrayList$.remove = function(object){
		if(typeof object == "number"){
			return this.removeByIndex(i);
		}else{
			var i = this.indexOf(object);
			if(typeof i == "number"){
				return this.removeByIndex(i);
			}else{
				return false;
			}
		}
		
	};

	ArrayList$.replace = function(object, newObject, id){
		dream.util.assert(object);
		dream.util.assert(newObject);
		var gid = dream.util.getId(object);
		var ngid = dream.util.getId(newObject);
		var nid = id || "id" + ngid;
		
		var pid = this._index[gid];
		delete this._index[gid];
		this._index[ngid] = nid;
		var index = this.keys[pid];
		this.keys[nid] = index;
		delete this.keys[pid];
		this[index] = newObject;
		
		dream.event.dispatch(this, "onRemove", object);
		dream.event.dispatch(this, "onAdd", newObject);
		return newObject;
	};

	ArrayList$.clear = function(){
		for(var i=0, o; o = this[i]; i++){		
			dream.event.dispatch(this, "onRemove", o);
			delete this[this._index[dream.util.getId(o)]];
			delete this[i];
		}
		this.splice(0, this.length);
		this.keys = [];
		this._index = [];
	};

	ArrayList$.addArray = function(items){
		items && items.forEach(this.add, this);
	};

	ArrayList$.addJson = function(items){
		for(var i in items) 
			this.add(items[i], i);
	};

	/**
	 * @author Ehsan
	 * @constructor
	 */
	var IndexedArrayList = function(indexes, items){	
		this.indexes = indexes;	
		this.index = {};
		for(var index in this.indexes){
			this.index[index] = {};
		}
		
		IndexedArrayList._superClass.call(this, items);	
		
	}.inherits(ArrayList);

	var IndexedArrayList$ = IndexedArrayList.prototype;
	IndexedArrayList$.add = function(object, id){
		for(var index in this.indexes){
			var a = this.index[index][object[index]] || (this.index[index][object[index]] = []);
			a.push(object);

			var ar = this;
			
			if (this.indexes[index])
				object[this.indexes[index]].add(function(oldValue){
					var a = ar.index[index][oldValue];
					a.splice(a.indexOf(object),1);
					if(!a.length) delete ar.index[index][oldValue];
					var n = ar.index[index][this[index]] || (ar.index[index][this[index]] = []);
					n.push(object);
				});
			
		}
		return IndexedArrayList._superClass.prototype.add.call(this, object, id);
	};

	/**
	 * @author Ehsan
	 * @constructor
	 */
	var Selector = function(items){
		Selector._superClass.call(this, items);	
		
	}.inherits(ArrayList);
	var Selector$ = Selector.prototype;
	dream.event.create(Selector$, "onDeselect");
	dream.event.create(Selector$, "onSelect");

	Selector$.selectObject = function(obj, i){
		//dream.util.assert(obj != undefined);
		//dream.event.dispatch(this, "onDeselect", this._current);
		this._current = obj;
		this._currentIndex = i;
		dream.event.dispatch(this, "onSelect", obj);
		return obj;
	};

	Selector$.select = function(obj){
		if(typeof obj == "string"){
			return this.selectObject(this[obj], this.indexOf(obj));
		}else if(typeof obj == "number"){
			return this.selectObject(this[obj], obj);
		}else{
			return this.selectObject(obj, this.indexOf(obj));
		}
	};

	Selector$.next = function(step){
		var i = this._currentIndex + (step || 1);
		this.select(i >= this.length ? 0 : i);
	};

	Selector$.previous = function(step){
		var i = this._currentIndex - (step || 1);
		this.select(i < 0 ? this.length -1  : i);
	};

	Object.defineProperty(Selector$, "current", {
		get : function () {
			return this._current;
		},
		set : function (v) {
			this.selectObject(v);
		}
	});

	/**
	 * @constructor
	 */
	var AssetLibrary = function(){
		dream.util.AssetLibrary._superClass.call(this);
		
		this.loader = new dream.static.Loader();
	}.inherits(dream.collection.List);
	var AssetLibrary$ = AssetLibrary.prototype
	AssetLibrary$.prepare = function(callBack){
		if(this.loader.isRequestSent){
			this.loader.abort();
		}
		this.loader.resources = this.requiredResources;
		this.loader.load(callBack);
	};

	Object.defineProperty(AssetLibrary$, "requiredResources", {
		get : function () {
			var r = new dream.collection.Set;
			for(var i=0,asset; asset=this[i]; i++ )
				r.addArray(asset.requiredResources);
			return r;
		}
	});


	var Quad = function(){
		this.subs = [];
		this.uniqueSubs = [];
		this.own = [];
	}

	Quad$ = Quad.prototype;

	Quad$.put = function(path, obj){
		if(path.length == 0){
			this.own.push(obj)
		}else{
			if(!this[path[0]])
				this[path[0]] = new Quad();
			this.subs.push(obj);
			if(!~this.uniqueSubs.indexOf(obj)) this.uniqueSubs.push(obj);
			this[path[0]].put(path.substr(1), obj)
		}
		
	};

	Quad$.get = function(path){
		var res = this;
		for(var i=0; i< path.length; i++){
			res=res[path[i]]
			if(!res){
				console.error("NO SUCH A PATH IN QUAD", path);
				break
			}
		}
		return res;
	};

	Quad$.remove = function(path){
		var s = this.get(path.substr(0,path.length-1))
		delete s[path[path.length-1]];
	}

	Quad$.getSubs = function(path){
		var res = this.get(path)
		if(res) {
			return res.subs;
		}else{
			console.error("NO such a path", path);
		}
	};

	Quad$.getSubsArray = function(arr){
		var rs = [];
		for(var i=0; i<arr.length;i++){
			var res = this.get(path)
			if(res) {
				rs.concat(res.subs);
			}else{
				console.error("NO such a path", path);
			}
			
		}
		return rs;
	};

	Quad$.getUniqueSubs = function(path){
		var res = this.get(path)
		if(res) {
			return res.uniqueSubs;
		}else{
			console.error("NO such a path", path);
		}
	};

	Quad$.getUniqueSubsArray = function(arr){
		var rs = [];
		for(var i=0; i<arr.length;i++){
			var res = this.get(path)
			if(res) {
				for(var j=0; j< res.length; j++)
					if(!~rs.indexOf(res[j])) rs.push(res[j]);
			}else{
				console.error("NO such a path", path);
			}
			
		}
		return rs;
	};

	Quad$.deletePathArray = function(obj, arr){
		for(var i=0; i<arr.length;i++){
			var path = arr[i];
			var res = this;
			var ind = res.subs.indexOf(obj);
			if(ind != -1) res.subs.splice(ind,1);
			var ind2 = res.uniqueSubs.indexOf(obj);
			if(ind2 != -1) res.uniqueSubs.splice(ind2,1);
			for(var j=0; j< path.length; j++){
				res=res[path[j]]
				if(!res){
					console.error("NO SUCH A PATH IN QUAD", path);
					break
				}else{
					ind = res.subs.indexOf(obj);
					if(ind != -1) res.subs.splice(ind,1);
					ind2 = res.uniqueSubs.indexOf(obj);
					if(ind2 != -1) res.uniqueSubs.splice(ind2,1);
				}
			}
			res.own.splice(res.own.indexOf(obj),1);
			if(res.own.length = 0){
				this.remove(path);
			}
			
		}
	};


	/**
	 * @author Mehdi
	 * @constructor
	 */
	var QuadTree = function(width, height){
		this.width = width;
		this.height = height;
		this.list = new Quad();
		this.keys = [];

	};

	QuadTree$ = QuadTree.prototype;

	QuadTree$.clear = function(){
		this.list = new Quad();
		this.keys = [];
	};

	QuadTree$.examine = function(obj){
		var q = new QuadTree(this.width, this.height);
		q.add(obj);
		return q.keys;
	}


	QuadTree$.add = function(obj, ind){
		var rs = this.doAdd(obj, ind);
		delete obj.__partTop
		delete obj.__partLeft
		delete obj.__partWidth
		delete obj.__partHeight
	};

	QuadTree$.doAdd = function(obj, ind, halve){
		var halve =  halve || 0;
		var ind = ind || "";
		var lv = ind.length+1;
		var wh = this.width/Math.pow(2, lv) | 0;
		var hh = this.height/Math.pow(2, lv) | 0;
		var t = obj.__partTop || obj.top;
		var l = obj.__partLeft || obj.left;
		var w = obj.__partWidth || obj.width;
		var h = obj.__partHeight || obj.height;
		var b = t + h
		var r = l + w;
		// console.log("working with object:(ind, l,t,w,h,wh,hh) ",ind, l, t, w, h, wh, hh);
		if((l < wh && r > wh && t < hh && b > hh) || (w*h*2 > wh*hh) || halve > 2){
			//object covers the full level
			addToIndex.call(this,obj,ind);
			return true;
		}
		if(r < wh){
			//object is in left half
			// console.log("left");
			if(b < hh){
				// console.info("left top");
				this.doAdd(obj, ind+"1")
			}
			else if(t > hh){
				// console.log("left bottom");
				obj.__partTop = t - hh
				this.doAdd(obj, ind+"2")
			}
			else{
				// spans in both vertical regions
				obj.__partHeight = hh - t;
				this.doAdd(obj, ind+"1", halve+1);
				obj.__partHeight = b - hh;
				obj.__partTop = hh
				this.doAdd(obj, ind+"2", halve+1);

			}

		}else if(l > wh){
			// right span
			// console.log("right");
			if(b < hh){
				// console.log("right top");
				obj.__partLeft = l - wh
				this.doAdd(obj, ind+"4")
			}
			else if(t > hh){
				// console.log("right bottom");
				obj.__partLeft = l - wh;
				obj.__partTop = t - hh;
				this.doAdd(obj, ind+"3")
			}
			else{
				// spans in both vertical regions
				obj.__partLeft = l - wh;
				obj.__partHeight = hh - t;
				this.doAdd(obj, ind+"4", halve+1);
				obj.__partLeft = l - wh;
				obj.__partHeight = b - hh;
				obj.__partTop = hh
				this.doAdd(obj, ind+"3", halve+1);
			}

		}else if(b < hh){
			//top panel
			// console.log("top");
			if(r < wh){
				// console.log("top left");
				this.doAdd(obj, ind+"1")
			}else if(l > wh){
				// console.log("top right");
				this.doAdd(obj, ind+"4")
			}else{
				// top both left and right
				obj.__partWidth = wh - l;
				this.doAdd(obj, ind+"1", halve+1);
				obj.__partLeft = wh;
				obj.__partWidth = r - wh;
				this.doAdd(obj, ind+"4", halve+1);
			}


		}else if(t > hh){
			// bottom panel
			// console.log("bottom");
			if(r < wh){
				// console.log("bottom left");
				this.doAdd(obj, ind+"2")
			}else if(l > wh){
				// console.log("bottom right");
				this.doAdd(obj, ind+"3")
			}else{
				// bottom both left and right
				obj.__partTop = t - hh
				obj.__partWidth = wh - l;
				this.doAdd(obj, ind+"2", halve+1);
				obj.__partTop = t - hh
				obj.__partLeft = wh;
				obj.__partWidth = r - wh;
				this.doAdd(obj, ind+"3", halve+1);


			}
		}
		function addToIndex(obj, ind){
			this.list.put(ind, obj);
			this.keys.push(ind);
			// console.log("index added: ", ind);
		}
	}

	/**
	 * @author Ehsan
	 * @constructor
	 */
	var RedrawRegionList = function(){
	}.inherits(Array);

	var RedrawRegionList$ = RedrawRegionList.prototype
	RedrawRegionList$.add = function(rect){
		if(rect.width <=0 || rect.height <= 0) return false;
		for(var i = 0, r; r = this[i]; i++)
			if(rect.hasIntersectWith(r))
				return this.add(this.splice(i,1)[0].add(rect));
		
		return this.push(rect);
	};

	RedrawRegionList$.add = function(rect){
		if(rect.width <=0 || rect.height <= 0) return false;
		for(var i = 0, r; r = this[i]; i++)
			if(rect.hasIntersectWith(r))
				return this.add(this.splice(i,1)[0].add(rect));
		
		return this.push(rect);
	};

	//dream.util.RedrawRegionList.prototype.addArray = dream.util.ArrayList.prototype.addArray;
	RedrawRegionList$.addArray = function(items){
		if(items instanceof dream.util.RedrawRegionList)
			for(var i = 0, o; o = items[i]; i++)
				this.push(o);
		else
			for(var i = 0, o; o = items[i]; i++)
				this.add(o);
			
	};

	RedrawRegionList$.clear = function(){
		this.splice(0, this.length);
	};



	var Plane = function(arr){
		this.z = arr || [];
		this.redrawRegions = new dream.util.RedrawRegionList();
		this.ctx = undefined;
		this.perf = {
			rgProfile: [],
			rgCount: 0,
			paintCount: 0
		}
	}

	/**
	 * @constructor
	 */
	var BufferCanvas = function(width, height){
		this.canvas = document.createElement("canvas");

		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext("2d");	
	};

	var getRequestAnimationFrame = function(fps) {
		if(fps){
			return function(callback, element) {
				return window.setTimeout(callback, 1000 / fps);
			};
		}else{
			return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.oRequestAnimationFrame
				|| window.msRequestAnimationFrame
				|| function(callback, element) {
					return window.setTimeout(callback, 1000 / 60);
				};
		}
	};

	var getCancelRequestAnimationFrame = function(fps) {
		if(fps){
			return window.clearTimeout;
		}else{
			return window.cancelRequestAnimationFrame
				|| window.webkitCancelRequestAnimationFrame
				|| window.mozCancelRequestAnimationFrame
				|| window.oCancelRequestAnimationFrame
				|| window.msCancelRequestAnimationFrame
				|| window.clearTimeout;
		}
	};

	var assert = function(assertion, message){
		if(!assertion) throw new Error("Assertion failed! " + (message || ""));
	};

	var objCount = 0;

	var getId = function(obj){
		return obj && obj.__GID || (obj.__GID = ++objCount);
	};

	var createProperty = function(obj, name, shadowVariable){
		var sv = shadowVariable || "_"+name;
		return Object.defineProperty(obj, name, {
			get : new Function("return this."+sv),
			set : new Function("v", "this."+sv+"=v;")
		});
	};

	var createEventProperty = function(obj, name, changeEvent, shadowVariable){
		var e = changeEvent || "onChange", sv = shadowVariable || "_"+name;
		return Object.defineProperty(obj, name, {
			get : new Function("return this."+sv),
			set : new Function("v", "var o = this."+sv+";this."+sv+"=v;dream.event.dispatch(this, '"+e+"', o);")
		});
	};

	var createFlagProperty = function(obj, name, changeFlag, shadowVariable){
		var f = changeFlag || "isChanged", sv = shadowVariable || "_"+name;
		return Object.defineProperty(obj, name, {
			get : new Function("return this."+sv),
			set : new Function("v", "var o = this."+sv+";this."+sv+"=v; if(v!=o) this."+f+" = true;")
		});
	};

	var createEventFlagProperty = function(obj, name, changeEvent, changeFlag, shadowVariable){
		var e = changeEvent || "onChange",f = changeFlag || "isChanged", sv = shadowVariable || "_"+name;
		return Object.defineProperty(obj, name, {
			get : new Function("return this."+sv),
			set : new Function("v", "var o = this."+sv+";this."+sv+"=v;dream.event.dispatch(this, '"+e+"', o);if(v!=o) this."+f+" = true;")
		});
	};

	var profile = function(fn, samples){
		var s = samples || 100;
		var sum = 0, min = 0, max = 0;
		for(var i = 0; i < s; i++){
			var t0 = performance.now();
			fn();
			var r = performance.now() - t0;
			
			if(i == 0){
				sum = min = max = r;
			}else{
				sum += r;
				min = r < min ? r : min;
				max = r > max ? r : max;
			}
		}
		
		return {avg: sum/s, min: min, max: max, samples: s, toString: function(){return this.avg+"x"+this.samples+" +"+this.max+" -"+this.min}};
	};


	function parseURI(url) {
	  var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
	  // authority = '//' + user + ':' + pass '@' + hostname + ':' port
	  return (m ? {
	    href     : m[0] || '',
	    protocol : m[1] || '',
	    authority: m[2] || '',
	    host     : m[3] || '',
	    hostname : m[4] || '',
	    port     : m[5] || '',
	    pathname : m[6] || '',
	    search   : m[7] || '',
	    hash     : m[8] || ''
	  } : null);
	}
	 
	var resolveUrl = function (href, base) {// RFC 3986
	 
	  function removeDotSegments(input) {
	    var output = [];
	    input.replace(/^(\.\.?(\/|$))+/, '')
	         .replace(/\/(\.(\/|$))+/g, '/')
	         .replace(/\/\.\.$/, '/../')
	         .replace(/\/?[^\/]*/g, function (p) {
	      if (p === '/..') {
	        output.pop();
	      } else {
	        output.push(p);
	      }
	    });
	    return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	  }
	 
	  href = parseURI(href || '');
	  base = parseURI(base || '');
	 
	  return !href || !base ? null : (href.protocol || base.protocol) +
	         (href.protocol || href.authority ? href.authority : base.authority) +
	         removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
	         (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
	         href.hash;
	}

//exports
dream.util = {
	ArrayList: ArrayList,
	resolveUrl: resolveUrl,
	createProperty: createProperty,
	createEventProperty: createEventProperty,
	createFlagProperty: createFlagProperty,
	createEventFlagProperty: createEventFlagProperty,
	getCancelRequestAnimationFrame: getCancelRequestAnimationFrame,
	getRequestAnimationFrame: getRequestAnimationFrame,
	BufferCanvas: BufferCanvas,
	Plane: Plane,
	RedrawRegionList: RedrawRegionList,
	AssetLibrary: AssetLibrary,
	QuadTree: QuadTree,
	Quad: Quad,
	Selector: Selector,
	assert: assert,
	getId: getId,
	profile: profile




}

})(window)

