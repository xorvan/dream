/**
 * 
 */
dream.preload = {};

/**
 * 
 */
dream.preload.cache = {};

/**
 * @param {Array<dream.preload.Resource>} resources
 * @constructor
 */
dream.preload.Loader = function(resources){
	this.loadedCount = 0;
	this.resources = resources || [];
	this.loadedResources = [];
	
	this.isLoading = false;
};

dream.event.create(dream.preload.Loader.prototype, "onLoad");
dream.event.create(dream.preload.Loader.prototype, "onProgress");

dream.preload.Loader.prototype.load = function(resources){
	if(resources){
		dream.preload.Loader.call(this, resources);
	}
	
	if(!this.isLoading){
		this.isLoading = true;
		this.loadedCount = 0;
	}

	if(this.resources.length<=0){
		dream.event.dispatch(this, "onLoad");
		return false;
	}
	
	var res, allLoaded=true;
	while(res = this.resources.pop()){
		var  hasDep = false;
		
		if(dream.preload.cache[res.url]) 
			res = dream.preload.cache[res.url];
		else
			dream.preload.cache[res.url] = res;
		
		this.loadedResources.push(res);
		
		if(!res.isLoaded){
			allLoaded = false;
			var loader = this;
			res.onLoad.add(function(){
				loader.loadedCount++;
				dream.event.dispatch(loader, "onProgress");
				
				var dep;
				if(dep = this.dependencies){				
					if(dep.length > 0){
						loader.resources = loader.resources.concat(dep);
						hasDep = true;
						loader.load();
					}
				}
				
				if(!hasDep && loader.loadedCount >= loader.resources.length + loader.loadedResources.length) dream.event.dispatch(loader, "onLoad");// this.eventDispatcher.dispatch("onLoad");
			});
			res.load();
		}else{
			this.loadedCount ++;
			dream.event.dispatch(this, "onProgress");			
		}
	}
	
	if(allLoaded) dream.event.dispatch(this, "onLoad");
	
};

/**
 * @constructor
 */
dream.preload.Resource = function(url){
	this.url = url;
	this.content = null;
	this.dependencies = [];
	this.isLoaded = false;
	this.isLoading = false;
	
	return dream.preload.cache[url] || this;
};

dream.event.create(dream.preload.Resource.prototype, "onLoad");

dream.preload.Resource.prototype.load = function(){
	if(!this.isLoading){
		this.reload();
		this.isLoading = true;
	}
};

/**
 * @constructor
 * @extends dream.preload.Resource
 */
dream.preload.AudioResource = function(url){
	return this.constructor._superClass.call(this, url);
}.inherits(dream.preload.Resource);

/**
 * @constructor
 * @extends dream.preload.Resource
 */
dream.preload.ImageResource = function(url){
	return dream.preload.ImageResource._superClass.call(this, url);
}.inherits(dream.preload.Resource);

dream.preload.ImageResource.prototype.reload = function(){
	var res = this;
	this.content = new Image();
	this.content.addEventListener("load", function(){
		res.isLoaded = true;
		dream.event.dispatch(res, "onLoad");		
	}, false);
	this.content.src = this.url;
};

/**
 * @constructor
 * @extends dream.preload.Resource
 */
dream.preload.XmlResource = function(url){
	return dream.preload.XmlResource._superClass.call(this, url);
}.inherits(dream.preload.Resource);

/**
 * @constructor
 * @extends dream.preload.Resource
 */
dream.preload.MapResource = function(url){
	return dream.preload.MapResource._superClass.call(this, url);
}.inherits(dream.preload.XmlResource);

dream.preload.MapResource.prototype.reload = function(){
	var xhr = new XMLHttpRequest();
	if (xhr.overrideMimeType)
		xhr.overrideMimeType('text/xml');
	xhr.open("GET", this.url, false);
	var res = this;
	xhr.onload = function(ev) {
		res.content = this.responseXML;
		res.isLoaded = true;
		dream.event.dispatch(res, "onLoad");
	};
	xhr.send();
};

Object.defineProperty(dream.preload.MapResource.prototype, "dependencies", {
	get : function () {
		if(this.content){
			var dep = [];
			var pre = /^(.*\/).*$/.exec(this.url);
			pre = pre ? pre[1] : "";
			var images = this.content.getElementsByTagName("image");
			for(var i=0,image; image = images[i]; i++){
				dep.push(new dream.preload.ImageResource(pre+image.getAttribute("source")));
			}
			return dep.length? dep : null;
		}else{
			return null;
		}
	}
});