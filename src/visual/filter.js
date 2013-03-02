(function(){

var Filter = function(){
	
};
var $ = Filter.prototype;
dream.event.create($, "onChange");

var GrayScale = function(){
	
}.inherits(Filter);

var createChangeProperty = function(obj, name){
	var _name = "_"+name;
	Object.defineProperty(obj, name, {
		get: function() {
			return this[_name];
		},
		set: function(v){
			this[_name] = v;
			dream.event.dispatch(this, "onChange");
		}
	});
};
	
GrayScale.prototype.filter = function(img){
	var d = img.data;
	  for (var i=0; i != d.length; i+=4) {
	    var r = d[i];
	    var g = d[i+1];
	    var b = d[i+2];
	    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	    d[i] = d[i+1] = d[i+2] = v;
	  }
	  return img;
};

var Brighten = function(amount){
	if (amount < -255) amount = -255;
	if (amount > 255) amount = 255;
	this.amount = amount;
}.inherits(Filter);

var $ = Brighten.prototype;

createChangeProperty($, "amount");

$.filter = function(img){
	var d= img.data, l = d.length, val = this.amount, i;
	for (i=0; i != l; i+=4){
		d[i] += val;
	    d[i+1] += val;
	    d[i+2] += val;
	}
	return img;
};

var Threshold = function(amount){
	if (amount < 0) amount = 0;
	if (amount > 255) amount = 255;
	this.amount = amount;
}.inherits(Filter);

var $ = Threshold.prototype;

createChangeProperty($, "amount");

$.filter = function(img){
	var d= img.data, l = d.length, val = this.amount, i, r, g, b;
	for (i=0; i != l; i+=4){
		r = d[i];
	    g = d[i+1];
	    b = d[i+2];
	    v = (0.2126*r + 0.7152*g + 0.0722*b >= val) ? 255 : 0;
	    d[i] = d[i+1] = d[i+2] = v;
	}
	return img;
};
var Noise= function(amount, strength, mono){
	if (strength > 1) strength = 1;
	if (strength < 0) strength = 0;
	if (amount > 1) amount = 1;
	if (amount < 0) amount = 0;
	this.strength = strength;
	this.amount = amount;
	this.mono = mono;
}.inherits(Filter);

var $ = Noise.prototype;

createChangeProperty($, "amount");
createChangeProperty($, "strength");

$.filter = function(img){
	var data= img.data, strength = this.strength, amount = this.amount, mono = this.mono;
	var noise = strength * 128, noise2 = noise / 2;
	var w = img.width, h = img.height, w4 = w * 4, y = h, random = Math.random, x, offsetY, offset, r, g, b, pixelNoise;
	do {
		offsetY = (y-1)*w4;
		x = w;
		do {
			offset = offsetY + (x-1)*4;
			if (random() < amount) {
				if (mono) {
					pixelNoise = - noise2 + random() * noise;
					r = data[offset] + pixelNoise;
					g = data[offset+1] + pixelNoise;
					b = data[offset+2] + pixelNoise;
				} else {
					r = data[offset] - noise2 + (random() * noise);
					g = data[offset+1] - noise2 + (random() * noise);
					b = data[offset+2] - noise2 + (random() * noise);
				}
				
				/*
				if (r < 0 ) r = 0;
				if (g < 0 ) g = 0;
				if (b < 0 ) b = 0;
				if (r > 255 ) r = 255;
				if (g > 255 ) g = 255;
				if (b > 255 ) b = 255;
				*/
				data[offset] = r;
				data[offset+1] = g;
				data[offset+2] = b;
			}
		} while (--x);
	} while (--y);
	return img;
};

var Posterize = function(levels){
	if (levels < 2) levels = 2;
	if (levels > 256) levels = 256;
	this.levels = levels;
}.inherits(Filter);

var $ = Posterize.prototype;

createChangeProperty($, "levels");

$.filter = function(img){
	var data = img.data, numLevels = this.levels, numAreas = 256 / numLevels, numValues = 256 / (numLevels-1);
	var w = img.width, h = img.height, w4 = w * 4, y = h, x, offsetY, offset, r, g, b;
	do {
		offsetY = (y-1)*w4;
		x = w;
		do {
			offset = offsetY + (x-1)*4;

			r = numValues * ((data[offset] / numAreas)>>0);
			g = numValues * ((data[offset+1] / numAreas)>>0);
			b = numValues * ((data[offset+2] / numAreas)>>0);

			if (r > 255) r = 255;
			if (g > 255) g = 255;
			if (b > 255) b = 255;

			data[offset] = r;
			data[offset+1] = g;
			data[offset+2] = b;

		} while (--x);
	} while (--y);
	return img;
};
var BoxBlur = function(amount){
	if (amount < 1) amount = 1;
	if (amount > 100) amount = 10;
	this.amount = amount;
}.inherits(Filter);

var $ = BoxBlur.prototype;

createChangeProperty($, "amount");

$.filter = function(img){
	var data = img.data, amount = this.amount, i;
	var w = img.width, h = img.height;
	var scale = 2, smallWidth = w/scale, smallHeight = h/scale, scaledWidth, scaledHeight; 
	var buff =new  dream.util.BufferCanvas(w, h), canv = buff.canvas, ctx = buff.context;
	var copyBuff =new  dream.util.BufferCanvas(smallWidth, smallHeight), copyCanv = copyBuff.canvas, copyCtx = copyBuff.context;
	ctx.putImageData(img, 0, 0);
	
	for (i = 0; i < amount; i++) {
		scaledWidth = Math.max(1,Math.round(smallWidth - i));
		scaledHeight = Math.max(1,Math.round(smallHeight - i));

		copyCtx.clearRect(0,0,smallWidth,smallHeight);

		copyCtx.drawImage(
			canv,
			0,0,w,h,
			0,0,scaledWidth,scaledHeight
		);
		
		console.log("boxblur");
		//if (clear)
		//	ctx.clearRect(rect.left,rect.top,rect.width,rect.height);

		ctx.drawImage(
			copyCanv,
			0,0,scaledWidth,scaledHeight,
			0,0,w,h
		);
	}
	return ctx.getImageData(0, 0, w, h);
};
var Blur = function(amount){
	if (amount < 1) amount = 1;
	if (amount > 100) amount = 10;
	this.amount = amount || 20;
}.inherits(Filter);

var $ = Blur.prototype;

createChangeProperty($, "amount");

$.filter = function(img){
	var data = img.data, amount = this.amount, i;
	var w = img.width, h = img.height;
	var scale = 2, smallWidth = w/scale, smallHeight = h/scale, scaledWidth, scaledHeight; 
	var buff =new  dream.util.BufferCanvas(w, h), canv = buff.canvas, ctx = buff.context;
	var copyBuff =new  dream.util.BufferCanvas(smallWidth, smallHeight), copyCanv = copyBuff.canvas, copyCtx = copyBuff.context;
	ctx.putImageData(img, 0, 0);
	
	for (i = 0; i < amount; i++) {
		scaledWidth = Math.max(1,Math.round(smallWidth - i));
		scaledHeight = Math.max(1,Math.round(smallHeight - i));
		
		copyCtx.clearRect(0,0,smallWidth,smallHeight);
		
		copyCtx.drawImage(
				canv,
				0,0,w,h,
				0,0,scaledWidth,scaledHeight
		);
		
		console.log("boxblur");
		//if (clear)
		//	ctx.clearRect(rect.left,rect.top,rect.width,rect.height);
		
		ctx.drawImage(
				copyCanv,
				0,0,scaledWidth,scaledHeight,
				0,0,w,h
		);
	}
	return ctx.getImageData(0, 0, w, h);
};
var Mosaic = function(blockSize){
	if (blockSize < 1) blockSize = 1;
	if (blockSize > 100) blockSize = 10;
	this.blockSize = blockSize || 10;
}.inherits(Filter);

var $ = Mosaic.prototype;

createChangeProperty($, "blockSize");

$.filter = function(img){
	var  blockSize = this.blockSize, blockSizeX, blockSizeY, x, y;
	var w = img.width, h = img.height; 
	var buff =new  dream.util.BufferCanvas(w, h), canv = buff.canvas, ctx = buff.context;
	var copyBuff =new  dream.util.BufferCanvas(w, h), copyCanv = copyBuff.canvas, copyCtx = copyBuff.context;
	var pixelBuff =new  dream.util.BufferCanvas(1, 1), pixelCanv = pixelBuff.canvas, pixelCtx = pixelBuff.context;
	
	ctx.putImageData(img, 0, 0);
	copyCtx.drawImage(canv, 0, 0, w, h);
	
	for (y=0;y<h;y+=blockSize) {
		for (x=0;x<w;x+=blockSize) {
			blockSizeX = blockSize;
			blockSizeY = blockSize;

			if (blockSizeX + x > w)
				blockSizeX = w - x;
			if (blockSizeY + y > h)
				blockSizeY = h - y;

			pixelCtx.drawImage(copyCanv, x, y, blockSizeX, blockSizeY, 0, 0, 1, 1);
			var data = pixelCtx.getImageData(0,0,1,1).data;
			ctx.fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
			ctx.fillRect(x, y, blockSize, blockSize);
		}
	}
	return ctx.getImageData(0, 0, w, h);
};

var ColorAdjust = function(rm, ro, gm, go, bm, bo){
	this.redMultiplier = rm == undefined ? 1:rm;
	this.redOffset = ro || 0;
	this.greenMultiplier = gm == undefined ? 1:gm;
	this.greenOffset = go || 0;
	this.blueMultiplier = bm == undefined ? 1:bm;
	this.blueOffset = bo || 0;
}.inherits(Filter);

var $ = ColorAdjust.prototype;

createChangeProperty($, "redMultiplier");
createChangeProperty($, "redOffset");
createChangeProperty($, "greenMultiplier");
createChangeProperty($, "greenOffset");
createChangeProperty($, "blueMultiplier");
createChangeProperty($, "blueOffset");

$.filter = function(img){
	var rm = this.redMultiplier, ro = this.redOffset, gm = this.greenMultiplier, 
	go = this.greenOffset, bm = this.blueMultiplier, bo = this.blueOffset, i, r, g, b,
	data = img.data, l = data.length;
	for (i=0; i < l; i+=4){
		r = data[i];
		g = data[i+1];
		b = data[i+2];
		data[i] = r * rm + ro;
		data[i+1] = data[i+1] * gm + go;
		data[i+2] = data[i+2] * bm + bo;
	}
	return img;
	
};

var FilterList = function(){
	this.onAdd.add(function(filter){
		dream.event.dispatch(this, "onChange");
		filter.onChange.propagate(this);
	});
	this.onRemove.add(function(filter){
		dream.event.dispatch(this, "onChange");
		filter.onChange.removeByOwner(this);
	});
	
}.inherits(dream.collection.Dict);

var $ = FilterList.prototype;
dream.event.create($, "onChange");

$.apply = function(img){
	if(this.buffer){
		this.buffer.canvas.width = img.width;
		this.buffer.canvas.height = img.height;
	} else this.buffer = new dream.util.BufferCanvas(img.width, img.height);
	for(var i=0; i < this.length; i++)
		img = this[i].filter(img);
	this.buffer.context.putImageData(img, 0, 0);
	return this.buffer.canvas;
};


// exports
dream.visual.filter = {
		Filter: Filter,
		FilterList: FilterList,
		GrayScale: GrayScale,
		Brighten: Brighten,
		Threshold: Threshold,
		Noise: Noise,
		Posterize: Posterize,
		Blur: Blur,
		ColorAdjust: ColorAdjust,
		Mosaic: Mosaic
};
	
})();