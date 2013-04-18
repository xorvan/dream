/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){

var Animation = dream.behavior.animation.Animation;

/**
 * Tween is a class for creating tween objects. a tween object is an animation that change properties of an object progressively in a duration
 * 
 * @class Tween
 * @constructor
 * @extends dream.behavior.animation.Animation
 * @example
 * 	t = new dream.behavior.animation.Tween({rotation:35}, 100)
 * @example
 * 	t = new dream.behavior.animation.Tween({$rotation:-10, top:25}, 100, new dream.behavior.animation.interpolator.PowerInOut(2)) 
 * @example
 * 	t = new dream.behavior.animation.Tween('fillStyle.colorStops[0].color.red':127, top:25}, 200)
 * @param {Object} valueMap 
 *  the json that defines which attributes should be tweened and to which final values. note the values should be number. 
 *  if you are going to change a property relative to its current value you can use a Tween$ (dollar sign) before the name of property. 
 *  if you are going to specify a property of one of properties of the object you should put the chain in a single quoted string
 * @param {Number} duration 
 * number of frames that should take o compete the tween.
 * @param {Object} [interpolator] 
 *  interpolator object which should be an instance of dream.behavior.animation.interpolator and it's deratives, default is linear interpolator 
 * 
 **/
var Tween = function(valueMap, duration, interpolator){
	Animation.call(this, undefined, duration);
	this.valueMap = valueMap;
	this.interpolator = interpolator && interpolator.fn || dream.behavior.animation.interpolator.Linear.prototype.fn;
	if(!('left' in valueMap || 'top' in valueMap || 'right' in valueMap || 'bottom' in valueMap || 'rotation' in valueMap))
		this.isPassive = true;
	
}.inherits(Animation);

var Tween$ = Tween.prototype;

Tween$.initFn = function(host){
	this.diffMap = {};
	this.initialMap = {};
	for(var i in this.valueMap){
		if (i[0] == "$"){
			var j = i;
			i = i.slice(1);
			this.diffMap[i] = this.valueMap[j];}
		else
			this.diffMap[i] = this.valueMap[i] - this.getHostValue(i);
		this.initialMap[i] = this.getHostValue(i);
	}
};

//Tween$.step = function(){
//	//if(!this._counter) this.init();
//	return Animation.prototype.step.call(this);
//};

Tween$.fn = function(frame, self){
	var multiplier = self.interpolator( (frame - 1) / (self.duration - 1) );
	for(var i in self.diffMap)
		self.setHostValue(i, self.initialMap[i] + self.diffMap[i] * multiplier); 
};
	
//exports
dream.behavior.animation.Tween = Tween;
	
})(window);