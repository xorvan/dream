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
		
		if(fs.frames.items.length > 1)
			sprite.animStep = sprite.steps.add(new dream.visual.animation.Step(function(){fs.frames.next();dream.event.dispatch(sprite, "onImageChange", [this.viewRect.clone()]);}, -1, fs.interval));
	});
	
	if(frameSet){
		this.frameSets.add(frameSet, "default");
		this.frameSets.select("default");
	}
}.inherits(dream.visual.Graphic);

dream.visual.Sprite.prototype.pause = function(){
	if(this.animStep) this.animStep.pause();
};

dream.visual.Sprite.prototype.resume = function(){
	if(this.animStep) this.animStep.resume();
};

dream.visual.Sprite.prototype.drawImage = function(ctx, rect) {
	var fs = this.frameSets.current;
	var f = fs.frames.current;
	ctx.drawImage(dream.preload.cache[fs.spriteSheetUrl].content, f.left, f.top, f.width, f.height, rect.left, rect.top, rect.width, rect.height);
};

Object.defineProperty(dream.visual.Sprite.prototype, "requiredResources", {
	get : function () {
		var r = [];
		for(var i=0, fs; fs = this.frameSets.items[i]; i++){
			r.push(new dream.preload.ImageResource(fs.spriteSheetUrl));
		}
		return r;
	}
});
