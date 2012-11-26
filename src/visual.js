/**
 * 
 */
dream.visual = {};

/**
 * @constructor
 */
dream.visual.SpriteFrameSet = function(spriteSheetUrl,left, top, width, height, count, interval, orders){
	var x = left || 0;
	var y = top || 0;
	var w = width || 0;
	var h = height || 0;
	
	this.spriteSheetUrl = spriteSheetUrl;
	this.interval = interval;
	this.frames = new dream.util.Selector();
	
	if(orders){
		var fa = this.frames;
		orders.forEach(function(i){
			fa.add(new dream.Rect(w*i + x, y, w, h));
		});
	}else{
		var c = count || 1;
		for(var i=0; i<c; i++)
			this.frames.add(new dream.Rect(w*i + x, y, w, h));
	}
	
	this.frames.select(0);
};

