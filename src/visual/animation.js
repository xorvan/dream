/**
 * 
 */
(function(){
	
/**
 * @constructor
 */
	
var Action = function (frame, forwardFn, backwardFn){
	this.frame = frame;
	this.forwardFn = forwardFn;
	this.backwardFn = backwardFn;
};

var Animation = function(duration, loop, interval, startFrame){
	this.duration = duration || 1;
	if (this.duration < 1) this.duration = 1;
	this.startFrame = startFrame || 0;
	this._interval = interval || 1;
	this._intrevalCnt = 0;
	this.loop = loop;
	this.isBackPlaying = false;
	this.actions = new dream.util.ArrayList();
	
	this._counter = -1;
	this._isPlaying = false;
};

var $ = Animation.prototype;
dream.event.create($, "onEnd");
dream.event.create($, "onCycle");
dream.event.create($, "onPlay");
dream.event.create($, "onPlayStop");

$.pause = function(){
	this.isPlaying = false;
};
$.play = function(){
	this.isPlaying = true;
};
$.rewind = function(){
	this._counter = -1;
	this.isPlaying = true;
};
$.stop = function(){
	this.isPlaying = false;
	this._counter = -1;
};

$.seek = function(frame , hard){
	if (frame == this._counter) return;
	
	if (hard) {
		var max = this._counter > frame ? this._counter:frame;
		var min = max == this._counter ? frame:this._counter;
		var direction = frame > this._counter;
		for ( var i = 0, action; action = this.actions[i]; i++)
			if (min < action.frame < max)
				if (! direction) {
					if (action.backwardFn)
						action.backwardFn.call(host);
				} else
					action.forwardFn.call(host);
		
		if (this.animations){
			for ( var i = 0, anim; anim = this.actions[i]; i++)
				anim.seek(frame - this.startFrame);}
		};
	
	this._counter = frame - 1; 
	if (frame <= 0 ) this._counter = -1;
	if (this.duration != -1 && frame >= this.duration) this._counter = this.duration -1;
	this.host.isBoundaryChanged = true;
};

$.init = function(host){
	this.host = host;
};

Object.defineProperty($, "isPlaying", {
	get : function() {
		return  this._isPlaying;
	},
	set : function(v) {
		this._isPlaying = v; 
		if (v) dream.event.dispatch("onPlay");
		else dream.event.dispatch("onPlayStop");
	}
});


Object.defineProperty($, "position", {
	get : function() {
		return  this._counter;
	}
});

Object.defineProperty($, "interval", {
	get : function() {
		return  this._interval;
	},
	set:function(v){
		this._counter = (this._counter * v/this._interval) | 0;
		if (this._counter > this.duration) this._counter = this.duration - 1;
		this._interval = v;
	}
});

$.playBackward = function(){
	this.isBackPlaying = true;
};
$.playForward = function(){
	this.isBackPlaying = false;
};


$.step = function(frame) {
		if(++this._intervalCnt % this.interval) return 1;
		this._intervalCnt = 0;
		if (this.isBackPlaying) {
			if(! frame == undefined) this._counter = ++frame;
			this._counter--;
			if (this._counter <= -1) {
				if (this.loop) {
					this._counter = this.duration - 1;
					dream.event.dispatch(this, "onCycle");
				} else {
					this._isPlaying = false;
					this._counter = 0;
					dream.event.dispatch(this, "onEnd");
				}
			}
		} else {
			if(! frame == undefined) this._counter = --frame;
			this._counter ++;
			if (this._counter >= this.duration) {
				if (this.loop) {
					this._counter = 0;
					dream.event.dispatch(this, "onCycle");
					
				} else {
					this._isPlaying = false;
					this._counter --;
					dream.event.dispatch(this, "onEnd");
				}
			}
		}
		for ( var i = 0, action; action = this.actions[i]; i++)
			if (this._counter == action.frame)
				if (this.isBackPlaying) {
					if (action.backwardFn)
						action.backwardFn.call(this.host);
				} else
					action.forwardFn.call(this.host);
		return 0;
	
};



	
/**
 * @constructor
 */
var Tween = function(valueMap, interpolator, duration, loop, interval, startFrame){
	Tween._superClass.call(this, duration, loop, interval, startFrame);
	this.valueMap = valueMap;
	this.interpolator = interpolator && interpolator.fn || dream.visual.animation.interpolator.Linear.prototype.fn;
}.inherits(Animation);

var $ = Tween.prototype;

$.getHostValue = function(i){
	return i.indexOf(".") > -1 ? eval("this.host."+ i) : this.host[i];
};

$.setHostValue = function(i, v){
	return i.indexOf(".") > -1 ? eval("this.host."+ i + " = " + v) : this.host[i] = v;
};

$.init = function(host){
	if (host) this.host = host;
	this.diffMap = {};
	this.initialMap = {};
	for(var i in this.valueMap){
		this.diffMap[i] = this.valueMap[i] - this.getHostValue(i);
		this.initialMap[i] = this.getHostValue(i);
	}};

$.revert = function(){
	for(var i in this.initialMap){
		this.host[i] = this.initialMap[i];
	}
	this.stop();
};

$.step = function(frame){
	Tween._superClass.prototype.step.call(this, frame);
	var multiplier = this.interpolator( this._counter / this.duration );
	for(var i in this.diffMap)
		this.setHostValue(i, this.initialMap[i] + this.diffMap[i] * multiplier); 	
};

/**
 * @constructor
 */

var Timeline = function(duration, loop, interval, startFrame){
	Timeline._superClass.call(this, duration, loop, interval, startFrame);
	this.animations = new dream.util.ArrayList();
	this.animations.onAdd.add(function(obj){
		dream.util.assert(obj instanceof dream.visual.animation.Animation,"you can only add animations to timeline");
		obj._isPlaying = true;
		
		
	});
	
	
}.inherits(Animation);

var $ = Timeline.prototype;

$.init = function(host){
	this.host = host;
	for ( var i = 0, anim; anim = this.animations[i]; i++)
			anim.init(host);
};

$.step = function(frame){
	Timeline._superClass.prototype.step.call(this, frame);
	for ( var i = 0, anim; anim = this.animations[i]; i++)
		if (anim._isPlaying && anim.startFrame <= this._counter && anim.startFrame + anim.duration >= this._counter)
			anim.step(this._counter - anim.startFrame);
};



var SpriteAnimation = function(textureArray, loop, interval, startFrame){
	SpriteAnimation._superClass.call(this, textureArray.length, loop, interval, startFrame);
	this.frames = new dream.util.ArrayList();
	this.frames.addArray(textureArray);	
}.inherits(Animation);

var $ = SpriteAnimation.prototype;

$.step = function(frame){
	if (Animation.prototype.step.call(this, frame)) return;
	this.host.texture = this.frames[this._counter];
	
};

$.gotoFrame = function(name, stop){
	for (var i = 0, frame ; frame = this.frames[i]; i++)
		if (frame.name == name){
			this.seek(i);
			if (stop) this.pause();
		};
};

//$.showFrame(frame)

/**
 * 
 */
var AnimationList = function(host){
	AnimationList._superClass.call(this);
	
	this.isPlaying = true;
	this.host = host;
	this.onAdd.add(function(obj){
			obj.init(this.host);
	});
	
}.inherits(dream.util.ArrayList);

var $ = AnimationList.prototype;

$.step = function(){
	for (var i = 0, anim ; anim = this[i]; i++)
		if (anim._isPlaying) anim.step();
};

$.pause = function(){
	this.isPlaying = false;
};
$.play = function(){
	this.isPlaying = true;
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
var Step = function(fn, interval) {
	this.fn = fn;
	this.interval = interval || 1;
	this._counter = 0;
};
var $ = Step.prototype;

$.step = function(host){
		if (!(this._counter % this.interval)) this.fn.call(host);	
	};

//Exporting
dream.visual.animation = {
		Action:Action,
		Animation:Animation,
		Tween: Tween,
		SpriteAnimation:SpriteAnimation,
		AnimationList:AnimationList,
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
