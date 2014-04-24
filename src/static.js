/**
 * 
 */
(function(window){
	

/**
 * 
 */
var cache = {};

/**
 * 
 */
var normalizeUrl = function(url){
    var a = document.createElement('a');
    a.href = url;
    return a.href;
};

/**
 * @param {Array<dream.preload.Resource>} resources
 * @constructor
 */
var Loader = function(resources){
	this.loadedCount = 0;
	this.resources = resources || [];
	
	this.isRequestSent = false;
};
var $ = Loader.prototype;

dream.event.create($, "onLoad");
dream.event.create($, "onProgress");

$.load = function(callBack){
	
	if(this.isRequestSent || this.resources.length == 0){
		callBack.call(this);
	}else{
		this.onLoad.addTemp(callBack);
		this.isRequestSent = true;
		this.loadedCount = 0;
		
		var loader = this;
		
		for(var i = 0, res; res = this.resources[i]; i++){
			res.load(function(){
				loader.loadedCount++;
				
				dream.event.dispatch(loader, "onProgress");
				
				if(loader.loadedCount == loader.resources.length){
					dream.event.dispatch(loader, "onLoad");
				}
			});
		}
	}
};

$.reload = function(callBack){
	this.abort();	
	this.load(callBack);
};

$.abort = function(){
	this.isRequestSent = false;
	for(var i = 0, res; res = this.resources[i]; i++ )
		res.abort();
};

/**
 * @constructor
 */
var Resource = function(url){
	this.content = null;
	this.loader = null;
	this.dependencies = [];
	this.isLoaded = false;
	this.isRequestSent = false;
	
	if(url){
		var option, options = url.split(";");
		this.url = normalizeUrl(options[0]);
		this.forcedMimeType = (option = options[1] && options[1].split(":")) && (option[0].trim() == "Content-Type" && option[1].trim());
		return cache[this.url] || (cache[this.url] = this.url.indexOf("#") == -1 ? this : new Fragment(this.url));
	}
};
var $ = Resource.prototype;

dream.event.create($, "onLoad");
dream.event.create($, "onSelfLoad");
dream.event.create($, "onProgress");

$.load = function(callBack){
	if(!this.isRequestSent){
		this.isRequestSent = true;
		this.doLoad(callBack);
	}else{
		callBack && callBack.call(this);
	}
};

$.reload = function(callBack){
	this.abort();	
	this.load(callBack);
};

$.abort = function(){
	this.isRequestSent = false;
	
	if(this.xhr){
		this.xhr.abort();
		delete this.xhr;
		if(this.depLoader){
			this.depLoader.cancel();
			delete this.depLoader;
		}
	}
	
	for(var i = 0, res; res = this.dependencies[i]; i++ )
		res.abort();
};

$.doLoad = function(callBack){
	var res = this;
	
	if(callBack) this.onLoad.addTemp(callBack);
	
	var xhr = this.xhr = new XMLHttpRequest();
	
	if (xhr.overrideMimeType && this.forcedMimeType)
		xhr.overrideMimeType(this.forcedMimeType);
	
	xhr.onprogress = function(e){
		dream.event.dispatch(res, "onProgress", e);
	};
	
	xhr.onreadystatechange = function(){
		if(this.readyState == this.HEADERS_RECEIVED) {
			var mime = res.forcedMimeType || this.getResponseHeader("Content-Type"),
				loaderClass = ResourceLoader.getResourceLoader(mime);
			
			if(!loaderClass) throw new Error("Cannot load resource with Content-Type '"+ mime + "'!");
			
			res.loader = new loaderClass(this, res.url, function(){
				res.content = res.loader.content;
				res.dependencies = res.loader.dependencies;
				
				if(!res.isLoaded )
					dream.event.dispatch(res, "onSelfLoad");
				
				if(res.dependencies && res.dependencies.length > 0){
					var l = this.depLoader = new Loader(res.dependencies);
					l.onLoad.add(function(){
						res.isLoaded = true;
						dream.event.dispatch(res, "onLoad");
					});
					l.load();
				}else{
					res.isLoaded = true;
					dream.event.dispatch(res, "onLoad");
				}
			});
		}
	};
	xhr.open("GET", this.url, true);
	xhr.send();
};

/**
 * 
 * @constructor
 * @extends dream.preload.Resource
 */
Fragment = function(url){
	Fragment._superClass.call(this);
	
	var s = url.split("#");
	this.resource = new Resource(s[0]);
	this.hash = s[1];
	
}.inherits(Resource);
var $ = Fragment.prototype;

$.doLoad = function(callBack){
	this.isLoaded = true;
	dream.event.dispatch(this, "onSelfLoad");
	
	var fragment = this;
	this.resource.load(function(){
		fragment.content = this.loader.getContent(fragment.hash);
		callBack && callBack.call(this);
	});
};

Object.defineProperty($, "dependencies", {
	get : function () {
		return [this.resource];
	}
});

/**
 * @constructor
 */
var ResourceLoader = function(xhr, url){
	this.content = null;
	this.url = url;
	this.dependencies = [];
};
var $ = ResourceLoader.prototype;

$.getContent = function(fragment){
	return this.content;
}

ResourceLoader.loaders = [];

ResourceLoader.register = function(resourceLoader){
	ResourceLoader.loaders.push(resourceLoader);
};

ResourceLoader.getResourceLoader = function(mime){
	for(var i = ResourceLoader.loaders.length - 1, loader; loader = ResourceLoader.loaders[i]; i--)
		if(loader.mimeType.exec(mime))
			return loader;
	return null;
};

ResourceLoader.Type = {
		TEXT: "text",
		BLOB: "blob",
		DOCUMENT: "document"
	};

/**
 * @constructor
 * @extends dream.static.ResourceLoader
 */
var BlobResourceLoader = function(xhr, url){
	BlobResourceLoader._superClass.call(this, xhr, url);
	
	try{
		if(xhr && xhr.responseType != undefined)
			xhr.responseType = ResourceLoader.Type.BLOB;
	}catch(e){console.log(e);}
	
}.inherits(ResourceLoader);

/**
 * @constructor
 * @extends dream.static.BlocResourceLoader
 */
var ImageResourceLoader = function(xhr, url, onLoad){
	ImageResourceLoader._superClass.call(this, xhr, url);
	
	var rl = this;

	if(xhr.responseType == ResourceLoader.Type.BLOB){
		xhr.onload = function(ev) {
			var img = new Image();
			img.onload = function(e) {
				window.URL.revokeObjectURL(img.src);
				onLoad();
			};
			img.src = window.URL.createObjectURL(this.response);
			rl.content = img;
		};
	}else{
		xhr.abort();
		var img = new Image();
		img.onload = function(){
			rl.content = img;
			onLoad();
		};
		img.src = url;
		
	}
	
		
}.inherits(BlobResourceLoader);

ImageResourceLoader.mimeType = /image\/(.+)/;
ResourceLoader.register(ImageResourceLoader);

/**
 * @constructor
 * @extends dream.static.ResourceLoader
 */
var DocumentResourceLoader = function(xhr, url, onLoad){
	DocumentResourceLoader._superClass.call(this, xhr, url);
	
	if(xhr){
		if(xhr.responseType != undefined) 
			xhr.responseType = ResourceLoader.Type.DOCUMENT;
		
		var rl = this;

		xhr.onload = function(ev) {
			rl.content = this.responseType == ResourceLoader.Type.DOCUMENT ? this.response : this.responseXML;
			onLoad && onLoad();
		};
	}
	
}.inherits(ResourceLoader);

DocumentResourceLoader.mimeType = /(text\/xml) | (application\/xml)/;
ResourceLoader.register(DocumentResourceLoader);/**

 * @constructor
 * @extends dream.static.ResourceLoader
 */
var JsonResourceLoader = function(xhr, url, onLoad){
	JsonResourceLoader._superClass.call(this, xhr, url);
	
	if(xhr){
		if(xhr.responseType != undefined) 
			xhr.responseType = ResourceLoader.Type.TEXT;
		
		var rl = this;

		xhr.onload = function(ev) {
			rl.content = JSON.parse(this.response);
			onLoad && onLoad();
		};
	}
	
}.inherits(ResourceLoader);

JsonResourceLoader.mimeType = /(text\/plain)/;
ResourceLoader.register(JsonResourceLoader);

/**
 * @constructor
 * @extends dream.static.DocumentResourceLoader
 */
var TiledMapResourceLoader = function(xhr, url, onLoad){
	TiledMapResourceLoader._superClass.call(this, xhr, onLoad);
	
}.inherits(DocumentResourceLoader);

TiledMapResourceLoader.mimeType = /application\/tiled-map+xml/;

Object.defineProperty(TiledMapResourceLoader.prototype, "dependencies", {
	get : function () {
		if(this.content){
			var dep = [];
			var pre = /^(.*\/).*$/.exec(this.url);
			pre = pre ? pre[1] : "";
			var images = this.content.getElementsByTagName("image");
			for(var i=0,image; image = images[i]; i++){
				dep.push(new Resource(pre+image.getAttribute("source")));
			}
			return dep.length? dep : null;
		}else{
			return null;
		}
	}
});

ResourceLoader.register(TiledMapResourceLoader);


var JsonSheetResourceLoader = function(xhr, url, onLoad){
	JsonSheetResourceLoader._superClass.call(this, xhr, url, onLoad);
	
}.inherits(JsonResourceLoader);

Object.defineProperty(JsonSheetResourceLoader.prototype, "dependencies", {
	get : function () {

		if(this.content){
			return [new Resource(dream.util.resolveUrl(this.content.meta.image, this.url))]
		}else{
			return null;
		}
	}
});

JsonSheetResourceLoader.mimeType = /application\/json/;
ResourceLoader.register(JsonSheetResourceLoader);

dream.static = {
		Loader: Loader,
		Resource: Resource,
		ResourceLoader: ResourceLoader,
		BlobResourceLoader: BlobResourceLoader,
		ImageResourceLoader: ImageResourceLoader,
		DocumentResourceLoader: DocumentResourceLoader,
		TiledMapResourceLoader: TiledMapResourceLoader,
		JsonSheetResourceLoader: JsonSheetResourceLoader,
		normalizeUrl: normalizeUrl,
		cache: cache
};

})(window);