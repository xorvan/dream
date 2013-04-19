/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){
	
var Animation = dream.behavior.animation.Animation;

/**
 * @class Timeline
 * @extends dream.behavior.animation.Animation
 * @constructor
 */
var Timeline = function(duration){
	Timeline._superClass.call(this, undefined, duration);
	this.isPassvie = true;
	this.animations = new dream.collection.List();
	
	var timeline = this;
	this.animations.onAdd.add(function(obj){
		dream.util.assert(obj instanceof Animation, "You can only add animations to timeline");
		if(!obj.isPassive)
			timeline.isPassive = false;
	});
	
}.inherits(Animation);

var Timeline$ = Timeline.prototype;

Timeline$.addAt = function(frame, anim, id){
	anim._startFrame = frame;
	this.animations.add(anim, id);
};

Timeline$.init = function(host){
	this.host = host;
	for ( var i = 0, anim; anim = this.animations[i]; i++)
			anim.init(host);
};

Timeline$.fn = function(frame, self, phase){
	for ( var i = 0, anim; anim = self.animations[i]; i++)
		if (anim._startFrame <= frame && anim._startFrame + anim.duration >= frame)
			anim.fn.call(anim.host, frame - anim._startFrame, anim, phase);
};

//exports
dream.behavior.animation.Timeline = Timeline;
	
})(window);