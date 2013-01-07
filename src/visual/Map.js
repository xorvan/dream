/**
 * @constructor
 * @extends dream.visual.Graphic
 */
dream.visual.Map = function(url){
	
	this.url = url;
	
}.inherits(dream.visual.Graphic);

Object.defineProperty(dream.visual.Map.prototype, "requiredResources", {
	get : function () {
		return [new dream.static.Resource(this.url)];
	}
});
