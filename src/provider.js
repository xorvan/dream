(function(window){

var Provider = function(renderList){
	this._area = new dream.Rect();
	this.renderList = renderList; 
	
};

var $ = Provider.prototype;

$.provide = function(area){
	return null;		
};

$.remove = function(objList){
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

var StaticProvider = function(renderList){
	Provider.call(this, renderList);
	
	this.assets = new dream.util.AssetLibrary();
	var provider = this;
	this.assets.onAdd.add(function(obj){
		if(obj.boundary.hasIntersectWith(provider._area))
			this.renderList.add(obj);
	});
	this.assets.onRemove.add(function(obj){
		this.renderList.remove(obj);
	});
	
}.inherits(Provider);
	
var $ = StaticProvider.prototype;

$.provide = function(area){
	for (var i = 0, obj; obj = this.assets[i]; i++)
		if(obj.boundary.hasIntersectWith(area))
			this.renderList.add(obj);
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