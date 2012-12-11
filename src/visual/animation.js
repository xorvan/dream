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

dream.visual.animation.Tween.prototype.getHostValue = function(i){
	return i.indexOf(".") > -1 ? eval("this.host."+ i) : this.host[i];
};

dream.visual.animation.Tween.prototype.setHostValue = function(i, v){
	return i.indexOf(".") > -1 ? eval("this.host."+ i + " = " + v) : this.host[i] = v;
};

Object.defineProperty(dream.visual.animation.Tween.prototype, "step", {
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
			var multiplier = tween.interpolator( (dream.fc - step.startFrame) / tween.duration );
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
					return -(amplitude*Math.pow(2,10*(x-=1))*Math.sin((x-s)*pi2/period));};},
				elasticInOut:function (amplitude, period){
					var pi2 = Math.PI*2;
					return function(x) {
						var s = period/pi2 * Math.asin(1/amplitude);
						if ((x*=2)<1) return -0.5*(amplitude*Math.pow(2,10*(x-=1))*Math.sin( (x-s)*pi2/period ));
						return amplitude*Math.pow(2,-10*(x-=1))*Math.sin((x-s)*pi2/period)*0.5+1;};}
		//backIn: function (val) {return function(x){return };}

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

