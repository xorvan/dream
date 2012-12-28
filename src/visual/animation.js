/**
 * 
 */
(function(){
	
/**
 * @constructor
 */
var Tween = function(valueMap, duration, interpolator, loop, interval){
	this.valueMap = valueMap;
	this.duration = duration;
	this.interpolator = interpolator && interpolator.fn || dream.visual.animation.interpolator.Linear.prototype.fn;
	this.loop = loop;
	this.interval = interval || 1;
};
var $ = Tween.prototype;

dream.event.create($, "onEnd");
dream.event.create($, "onCycle");

$.getHostValue = function(i){
	return i.indexOf(".") > -1 ? eval("this.host."+ i) : this.host[i];
};

$.setHostValue = function(i, v){
	return i.indexOf(".") > -1 ? eval("this.host."+ i + " = " + v) : this.host[i] = v;
};

Object.defineProperty($, "step", {
	get : function(){
		if(this._step) return this._step;
		var diffMap = {};
		var initialMap = this.initialMap = {};
		for(var i in this.valueMap){
			diffMap[i] = this.valueMap[i] - this.getHostValue(i);
			initialMap[i] = this.getHostValue(i);
		}
		
		var tween = this;
		var step = new dream.visual.animation.Step(function(){}, this.duration, this.interval);
		var stepFunc = function() {
			var multiplier = tween.interpolator( step._frameCounter / tween.duration );
			for(var i in diffMap){
				tween.setHostValue(i, initialMap[i] + diffMap[i] * multiplier); 
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

$.pause = function(){
	this._step.pause();
};

$.resume = function(){
	this._step.resume();
};

$.rewind = function(){
	this._step.rewind();
};

$.stop = function(){
	this.host.steps.remove(this._step);
};

$.revert = function(){
	for(var i in this.initialMap){
		this.host[i] = this.initialMap[i];
	}
	this.stop();
};

/**
 * 
 */
var Interpolator = function(){};

/**
 * 
 */
var Linear = function(){}.inherits(Interpolator);
Linear.prototype.fn = function(x){return x;};

/**
 * 
 */
var Sine = function(freq){
	var f = freq == undefined ? 1 : freq;
	this.fn = function(x) {var pi=Math.PI;return Math.sin(pi * x * f * 2);};
}.inherits(Interpolator);

/**
 * 
 */
var Cosine = function(freq){
	var f = freq == undefined ? 1 : freq;
	this.fn = function(x) {var pi=Math.PI;return Math.cos(pi * x * f * 2);};
}.inherits(Interpolator);

/**
 * 
 */
var PowerIn = function(pow){
	this.fn = function(x){return Math.pow(x, pow);};
}.inherits(Interpolator);

/**
 * 
 */
var PowerOut = function(pow){
	this.fn = function(x){return 1 - Math.pow(1 - x, pow);};
}.inherits(Interpolator);

/**
 * 
 */
var ElasticInOut = function(amplitude, period){
	var pi2 = Math.PI*2;
	var a = amplitude == undefined ? 1 : amplitude;
	var p = period == undefined ? 0.3 : period;
	this.fn = function(x) {
		var s = p/pi2 * Math.asin(1/a);
		if ((x*=2)<1) return -0.5*(a*Math.pow(2,10*(x-=1))*Math.sin( (x-s)*pi2/p ));
		return a*Math.pow(2,-10*(x-=1))*Math.sin((x-s)*pi2/p)*0.5+1;
	};
}.inherits(Interpolator);

var interpolators = {
		linear: function(x){return x;},
		Sine: function(freq){return function(x) {var pi=Math.PI;return Math.sin(pi * x * freq * 2);};},
		halfSine: function(freq) {return function(x) {var pi=Math.PI;return Math.abs(Math.sin(pi * x * freq));};},
		quarterSine: function(freq){return function(x) {var pi=Math.PI;return Math.sin(pi * x * freq / 2);};},
		exp:function (pow){return function(x)     {return Math.exp(x * pow) - 1;};},
		powIn:function (pow) {return function(x)  {return Math.pow(x, pow);};},
		powOut:function (pow) {return function(x) {return 1 - Math.pow(1 - x, pow);};},
		powInOut:function (pow) {return function(x) {if ((x *= 2) < 1) return 0.5 * Math.pow(x, pow);	return 1 - 0.5 * Math.abs(Math.pow(2-x,pow));};},
		backIn: function (val) {return function(x){return x * x * ((val + 1) * x - val);};},
		backOut: function (val) {return function(x){return (--x * x * ((val + 1) * x + val) + 1);};},
		circIn: function(x) {return Math.sqrt(1-(--x)*x);},
		circOut: function(x) {if ((x*=2) < 1) return -0.5*(Math.sqrt(1-x*x)-1);	return 0.5*(Math.sqrt(1-(x-=2)*x)+1);},
		bounceOut: function(x) {if (x < 1/2.75) {
												return (7.5625*x*x);
											} else if (x < 2/2.75) {
												return (7.5625*(x-=1.5/2.75)*x+0.75);
											} else if (x < 2.5/2.75) {
												return (7.5625*(x-=2.25/2.75)*x+0.9375);
											} else {
												return (7.5625*(x-=2.625/2.75)*x +0.984375);
											};},
		bounceIn: function (x){return 1-dream.visual.animation.interpolators.bounceOut(1-x);},									
		bounceInOut: function (x){if (x < 0.5) return dream.visual.animation.interpolators.bounceIn (x * 2) * 0.5;return dream.visual.animation.interpolators.bounceOut(x * 2 - 1) * 0.5 + 0.5;},
		elasticIn:function (amplitude, period){
			var pi2 = Math.PI*2;
			return function(x) {
				if (x==0 || x==1) return x;
				var s = period/pi2 * Math.asin(1/amplitude);
				return (amplitude*Math.pow(2,-10*x)*Math.sin((x-s)*pi2/period )+1);};},
		elasticOut:function (amplitude, period){
				var pi2 = Math.PI*2;
				return function(x) {
					if (x==0 || x==1) return x;
					var s = period/pi2*Math.asin(1/amplitude);
					return -(amplitude*Math.pow(2,10*(x-=1))*Math.sin((x-s)*pi2/period));};}

		//backIn: function (val) {return function(x){return };}

};

/**
 * @constructor
 */

var Tickable = function(duration){
	this._frameCounter = 0;
	this.isPlaying = true;
	this.duration = duration ? duration:-1;
	
};

var $ = Tickable.prototype;
dream.event.create($, "onEnd");

$.tick = function(){
	if (this.duration == this._frameCounter ) {
		this.isPlaying = false;
		dream.event.dispatch(this, "onEnd");
		if (! this._persistent) return 1;
	};
};

$.pause = function(){
	this.isPlaying = false;
};
$.resume = function(){
	this.isPlaying = true;
};
$.rewind = function(){
	this._frameCounter = 0;
	this.isPlaying = true;
};

/**
 * @constructor
 */
var Timeline = function(duration) {
	Tickable.call(this, duration);
	this.frames = {};
//	this.steps = new dream.util.ArrayList();
//	this.tweens = new dream.util.ArrayList();
}.inherits(Tickable);

var $ = Timeline.prototype;
$.at = function(frame, fn){
	if (this.frames[frame]) this.frames[frame].push(fn);
	else this.frames[frame]=[fn];
	return this;
};

$.tick = function(host){
	Tickable.prototype.tick.call(this);
	if (this.isPlaying){
	var cnt = this._frameCounter ++;
	if (cnt == this.duration) return 1;
	
	var fnlist = this.frames[cnt];
	if (fnlist)
		for (var fn in fnlist)
			fnlist[fn].call(host);
}};

$.clearAt = function(frame){
	delete this.frames[frame];
	return this;
};

Object.defineProperty($, "seeker", {
	get : function() {
		return  this._frameCounter;
	},
	set : function(v) {
		if (frame > 0 && frame < this.life) this._frameCounter = frame;
	}
});


/**
 * @constructor
 */
var Step = function(fn, duration, interval) {
	Tickable.call(this, duration);
	this.fn = fn;
	this.interval = interval || 1;
}.inherits(Tickable);;
var $ = Step.prototype;

$.tick = function(host, frame){
	Tickable.prototype.tick.call(this);
	if (this.isPlaying){
		if (frame && (frame > this.duration || frame <=0)) return 0;
		this.frame = frame ? frame:++this._frameCounter;
		if (!(this._frameCounter % this.interval)) this.fn.call(host);	
	}
	
};

//Exporting
dream.visual.animation = {
		Tween: Tween,
		Interpolator:Interpolator,
		Timeline:Timeline,
		interpolator:{
			Linear: Linear,
			Sine: Sine,
			Cosine: Cosine,
			PowerIn: PowerIn,
			PowerOut: PowerOut,
			ElasticInOut: ElasticInOut
		},
		Step: Step
};

})();
