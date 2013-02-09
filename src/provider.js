(function(window){

var Provider = function(){
	this._area = new dream.Rect();
};

var $ = Provider.prototype;

$.init = function(pool){
	this.pool = pool; 	
};

$.provide = function(area){
	return null;		
};

Object.defineProperty($, "area", {
	set: function(v){
		if(this._area == v) return v;
		this._area = v;
		this.provide(v);
	},
	get : function () {
		return this._area;
	}
});

var OfflineProvider = function(){
	Provider.call(this);
	
	this.assets = new dream.util.AssetLibrary();
	var provider = this;
	this.assets.onAdd.add(function(obj){
		if(obj.boundary.hasIntersectWith(provider._area))
			provider.pool.add(obj);
	});
	this.assets.onRemove.add(function(obj){
		this.pool.remove(obj);
	});
	
}.inherits(Provider);
	
var $ = OfflineProvider.prototype;

$.provide = function(area){
	for (var i = 0, obj; obj = this.assets[i]; i++)
		if(obj.boundary.hasIntersectWith(area))
			this.pool.add(obj);
};

Object.defineProperty($, "requiredResources", {
	get : function () {
		return this.assets.requiredResources;
	}
});
	
dream.provider = {
		Provider: Provider,
		OfflineProvider: OfflineProvider
};
	
})(window);