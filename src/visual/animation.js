/**
 * 
 */
dream.visual.animation = {};

/**
 * @constructor
 */
dream.visual.animation.Tween = function() {
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
dream.event.create(dream.visual.animation.Step, "onEnd");

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

