/**
 * @constructor
 */
dream.visual.Sprite = function(frameSet, left, top, width, height){
	dream.visual.Sprite._superClass.call(this, left, top, width, height);
	
	this.frameSets = new dream.util.Selector();
	var sprite = this;
	this.frameSets.onSelect.add(function(fs){
		if(sprite.animStep){
			sprite.steps.remove(sprite.animStep);
			delete sprite.animStep;
		}
		
		if(fs.frames.length > 1)
			sprite.animStep = sprite.steps.add(
					new dream.visual.animation.Step(function(){
						fs.frames.next();
						var	fw = fs.frames.current.width, 
							fh = fs.frames.current.height; 
						if(sprite.rect.width != fw || sprite.rect.height != fh){
							sprite.rect.width = fw; 
							sprite.rect.height = fh; 
							sprite.isBoundaryChanged = true; 
						}
						sprite.isImageChanged = true;
					}, -1, fs.interval)
			);
	});
	
	if(frameSet){
		this.frameSets.add(frameSet, "default");
		this.frameSets.select("default");
		
		var f = this.frameSets.current.frames.current;
		
		this.rect.width = f.width;
		this.rect.height = f.height;
	}
}.inherits(dream.visual.Graphic);

dream.visual.Sprite.prototype.pause = function(){
	if(this.animStep) this.animStep.pause();
};

dream.visual.Sprite.prototype.resume = function(){
	if(this.animStep) this.animStep.resume();
};

dream.visual.Sprite.prototype.drawImage = function(ctx, origin) {
	var fs = this.frameSets.current;
	var f = fs.frames.current;
	ctx.drawImage(dream.preload.cache[fs.spriteSheetUrl].content, f.left, f.top, f.width, f.height, origin.left|0, origin.top|0, f.width, f.height);
};

Object.defineProperty(dream.visual.Sprite.prototype, "requiredResources", {
	get : function () {
		var r = new dream.util.ArrayList;
		for(var i=0, fs; fs = this.frameSets[i]; i++){
			r.add(new dream.preload.ImageResource(fs.spriteSheetUrl));
		}
		return r;
	}
});
