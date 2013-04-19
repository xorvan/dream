/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){

var Animation = dream.behavior.animation.Animation;

/**
 * @class PathTween
 * @extends dream.behavior.animation.Animation
 * @constructor
 */
var PathTween = function(path, transform, duration, start, end, interpolator){
	Animation.call(this, undefined, duration);
	if (path instanceof dream.geometry.Path)
		this.path = path;
	else
		throw Error("PathTween Only Accepts a path as first argument");
	this.transform = transform || new dream.geometry.transform.Identity;
	this.start = start || 0;
	this.end = end || 1;
	this.interpolator = interpolator && interpolator.fn || dream.behavior.animation.interpolator.Linear.prototype.fn;
	
}.inherits(Animation);

var PathTween$ = PathTween.prototype;

PathTween$.fn = function(frame, self){
	var point, t, ct;
	t = ((frame - 1) / self.duration) + self.start;
	//if ( t > self.end) self.position = 1;
	ct = self.interpolator(t);
	if(ct > 1) ct = 1;
	else if (ct < 0) ct=0;
	point = self.transform.project(self.path.solve(ct));
	this.left = point.left;
	this.top  = point.top;
};

//exports
dream.behavior.animation.PathTween = PathTween;
	
})(window);