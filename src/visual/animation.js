/**
 * 
 */
dream.visual.animation = {};

/**
 * @constructor
 */
dream.visual.animation.Tween = function(valueMap, duration, interpolator, loop, interval){
	this.valueMap = valueMap;
	this.duration = duration;
	this.interpolator = interpolator || dream.visual.animation.interpolators.linear;
	this.loop = loop;
	this.interval = interval || 1;
};

dream.event.create(dream.visual.animation.Tween.prototype, "onEnd");
dream.event.create(dream.visual.animation.Tween.prototype, "onCycle");

Object.defineProperty(dream.visual.animation.Tween.prototype, "step", {
	get : function(){
		if(this._step) return this._step;
		var diffMap = {};
		var initialMap = this.initialMap = {};
		for(var i in this.valueMap){
			diffMap[i] = this.valueMap[i] - this.host[i];
			initialMap[i] = this.host[i];
		}
		
		var tween = this;
		var step = new dream.visual.animation.Step(function(){}, this.duration, this.interval);
		var stepFunc = function() {
			var multiplier = tween.interpolator( (dream.fc - step.startFrame) / tween.duration );
			for(var i in diffMap){
				tween.host[i] = initialMap[i] + diffMap[i] * multiplier; 
			};
		};
		
		step.fn = stepFunc;
		step.onEnd.add(function(){
			if(tween.loop){
				step._persistent = true;
				step.rewind();
				dream.event.dispatch(tween, "onCycle");
			}else{
				dream.event.dispatch(tween, "onCycle");
				dream.event.dispatch(tween, "onEnd");
			}
		});
		this._step = step;
		return step;
	}
});

dream.visual.animation.Tween.prototype.pause = function(){
	this._step.pause();
};

dream.visual.animation.Tween.prototype.resume = function(){
	this._step.resume();
};

dream.visual.animation.Tween.prototype.rewind = function(){
	this._step.rewind();
};

dream.visual.animation.Tween.prototype.stop = function(){
	this.host.steps.remove(this._step);
};

dream.visual.animation.Tween.prototype.revert = function(){
	for(var i in this.initialMap){
		this.host[i] = this.initialMap[i];
	}
	this.stop();
};


dream.visual.animation.interpolators = {
		linear: function(x){return x;},
		sine: function(x) {return Math.sin(Math.PI * x * 2);},
		halfSine: function(x) {return Math.sin(Math.PI * x);},
		quarterSine: function(x) {return Math.sin(Math.PI * x / 2);}

};

/**
 * @constructor
 */
dream.visual.animation.Timeline = function() {
};

/**
 * @constructor
 */
dream.visual.animation.Step = function(fn, duration, interval) {
	this.fn = fn;
	this.interval = interval || 1;
	this.isPlaying = true;
	this.startFrame = dream.fc;
	this.lastFrame = dream.fc;
	this.endFrame = duration ? dream.fc + duration : -1;
};
dream.event.create(dream.visual.animation.Step.prototype, "onEnd");

dream.visual.animation.Step.prototype.resume = function() {
	if (!this.isPlaying) {
		this.isPlaying = true;
		this.endFrame = dream.fc + (this.endFrame - this.startFrame - this.lastFrame);
		this.startFrame = dream.fc - this.lastFrame + 1;
	}
};

dream.visual.animation.Step.prototype.pause = function() {
	if (this.isPlaying) {
		this.isPlaying = false;
		this.lastFrame = dream.fc - this.startFrame;
	}
};

dream.visual.animation.Step.prototype.rewind = function() {
	this.endFrame = dream.fc + this.endFrame - this.startFrame;
	this.startFrame = dream.fc;
	this.isPlaying = true;
};

