(function(window){

var Provider = function(list){
	this._area = new dream.Rect();
	this.list = list; 
	
};

var $ = Provider.prototype;

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

var StaticProvider = function(list){
	Provider.call(this, list);
	
	this.assets = new dream.util.AssetLibrary();
	var provider = this;
	this.assets.onAdd.add(function(obj){
		if(obj.boundary.hasIntersectWith(provider._area))
			provider.list.add(obj);
	});
	this.assets.onRemove.add(function(obj){
		this.list.remove(obj);
	});
	
}.inherits(Provider);
	
var $ = StaticProvider.prototype;

$.provide = function(area){
	for (var i = 0, obj; obj = this.assets[i]; i++)
		if(obj.boundary.hasIntersectWith(area))
			this.list.add(obj);
};

Object.defineProperty($, "requiredResources", {
	get : function () {
		return this.assets.requiredResources;
	}
});
	
	
dream.provider = {
		Provider: Provider,
		StaticProvider: StaticProvider
};
	
})(window);