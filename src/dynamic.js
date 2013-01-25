/**
 * 
 */
(function(){
	
/**
 * @constructor for actions
 */
	
var Action = function (frame, fn, execOnSeek){
	this.frame = frame;
	this.fn = fn;
	this.execOnSeek = execOnSeek;
};

/**
 * @constructor
 */
var Dynamic = function(fn, interval) {
	if (fn) this.fn = fn;
	this.isPlaying = false;
	this.isPassive = false;
	this.interval = interval || 1;
};
var $ = Dynamic.prototype;

$.step = function(){
	this.fn.call(this.host);	
};

$.init = function(host){
	this.host = host;
	return this;
};
	
$.pause = function(){
	this.isPlaying = false;
	return this;
};
$.play = function(){
	this.isPlaying = true;
	return this;
};

var Animation = function(duration, loop, interval){
	Dynamic.call(this, null, interval);
	this.duration = duration || 1;
	if (this.duration < 1) this.duration = 1;
	this.loop = loop;
	this.isBackward = false;
	this.actions = new dream.util.IndexedArrayList({frame:false});
	this._counter = 0;
	
	var anim = this;
	this.actions.onAdd.add(function(o){
		anim.isPassive = false;
	});
}.inherits(Dynamic);

var $ = Animation.prototype;
dream.event.create($, "onEnd");
dream.event.create($, "onCycle");
dream.event.create($, "onPlay");
dream.event.create($, "onPause");

$.pause = function(){
	this.isPlaying = false;
	dream.event.dispatch("onPause");
	return this;
};
$.play = function(){
	if (this._counter == 0 || this._counter == this.duration + 1) this.rewind();
	this.isPlaying = true;
	dream.event.dispatch("onPlay");
	return this;
};
$.rewind = function(){
	if (this.isBackward) this.seeker = this.duration;
	else this.seeker = 1; 
	return this;
};
$.stop = function(){
	this.rewind();
	this.pause();
	return this;
};

Object.defineProperty($, "seeker", {
	get : function() {
		return  this._counter;
	},
	set:function(frame){
		if (frame == this._counter) return;
		
		if (frame > this.duration) 
			frame = this.duration;
		else if (frame < 1 ) 
			frame = 1;
		
		if (this.actions){
			var min, max, direction;
			if(this._counter > frame ) 
				min = frame, max = this._counter, direction = false;
			else 
				min = this._counter, max = frame, direction = true;
			
			var actionFrames = [];
			for(var i in this.actions.index.frame) if (min < i < max) actionFrames.push(i);
			
			if(direction)
				for (var i = 0, actions; actions = this.actions.index.frame[actionFrames[i]]; i++)
					for(var j=0, action; action = actions[j]; j++)
						 action.execOnSeek && action.fn.call(this.host, 1);
			else
				for (var i = actionFrames.length, actions; actions = this.actions.index.frame[actionFrames[i]]; i--)
					for(var j=0, action; action = actions[j]; j++)
						 action.execOnSeek && action.fn.call(this.host, -1);
		}
		
		if (this.animations)
			for ( var i = 0, anim; anim = this.animations[i]; i++)
				anim.seeker = frame - anim._startFrame;
		this.step(frame);
	}
});


Object.defineProperty($, "position", {
	get : function() {
		return  this._counter;
	}
});


$.step = function(frame) {
		if (this.isBackward) {
			this._counter = frame != undefined ? frame : this._counter - 1 ;
			if (this._counter < 1) {
				if (this.loop) {
					this.seeker = this.duration;
					dream.event.dispatch(this, "onCycle");
				} else {
					if (! this._isInTimeline) this.isPlaying = false;
					this._counter = 0;
					dream.event.dispatch(this, "onEnd");
				}
			}
		} else {
			this._counter = frame != undefined ? frame : this._counter + 1;
			if (this._counter > this.duration) {
				if (this.loop) {
					this.seeker = 1;
					dream.event.dispatch(this, "onCycle");
					
				} else {
					if (! this._isInTimeline) this.isPlaying = false;
					this._counter = this.duration + 1;
					dream.event.dispatch(this, "onEnd");
				}
			}
		}
		if(this.actions.index.frame[this._counter])
			for ( var i = 0, action; action = this.actions.index.frame[this._counter][i]; i++)
				action.fn.call(this.host, this.isBackward ? -1 : 1);
};



	
/**
 * @constructor
 */
var Tween = function(valueMap, interpolator, duration, loop, interval){
	Tween._superClass.call(this, duration, loop, interval);
	this.valueMap = valueMap;
	this.interpolator = interpolator && interpolator.fn || dream.dynamic.interpolator.Linear.prototype.fn;
	if(!('left' in valueMap || 'top' in valueMap || 'right' in valueMap || 'bottom' in valueMap || 'rotation' in valueMap))
		this.isPassive = true;
	
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
		if (i[0] == "$"){
			var j = i;
			i = i.slice(1);
			this.diffMap[i] = this.valueMap[j];}
		else
			this.diffMap[i] = this.valueMap[i] - this.getHostValue(i);
		this.initialMap[i] = this.getHostValue(i);
	}
	return this;
};
	


$.step = function(frame){
	Animation.prototype.step.call(this, frame);
	var multiplier = this.interpolator( (this._counter - 1) / this.duration );
	for(var i in this.diffMap)
		this.setHostValue(i, this.initialMap[i] + this.diffMap[i] * multiplier); 	
};

/**
 * @constructor
 */

var Timeline = function(duration, loop, interval){
	Timeline._superClass.call(this, duration, loop, interval);
	this.isPassvie = true;
	this.animations = new dream.util.ArrayList();
	
	var timeline = this;
	this.animations.onAdd.add(function(obj){
		dream.util.assert(obj instanceof dream.dynamic.Animation,"you can only add animations to timeline");
		obj.isPlaying = true;
		obj._isInTimeline = true;
		if(!obj.isPassive)
			timeline.isPassive = false;
		
		
	});
	
	
}.inherits(Animation);

var $ = Timeline.prototype;

$.addAt = function(frame, anim, id){
	anim._startFrame = frame;
	this.animations.add(anim, id);
};

$.init = function(host){
	this.host = host;
	for ( var i = 0, anim; anim = this.animations[i]; i++)
			anim.init(host);
};

$.step = function(frame){
	Animation.prototype.step.call(this, frame);
	var localCounter; 
	for ( var i = 0, anim; anim = this.animations[i]; i++)
		if (anim.isPlaying && anim._startFrame <= this._counter && anim._startFrame + anim.duration * anim.interval >= this._counter && (localCounter = this._counter - anim._startFrame, localCounter % anim.interval == 0))
			anim.step(localCounter/anim.interval);
};



var SpriteAnimation = function(textureArray, loop, interval){
	SpriteAnimation._superClass.call(this, textureArray.length, loop, interval);
	this.isPassive = true;
	this.frames = new dream.util.ArrayList();
	this.frames.addArray(textureArray);	
}.inherits(Animation);

var $ = SpriteAnimation.prototype;

$.step = function(frame){
	Animation.prototype.step.call(this, frame);
//	console.log(this._counter , frame);
	this.host.texture = this.frames[this._counter - 1];
	
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
var DynamicList = function(host){
	DynamicList._superClass.call(this);
	
	this.isPlaying = true;
	this._counter = 0;
	this.host = host;
	this.onAdd.add(function(obj){
			obj.init(this.host);
	});
	
}.inherits(dream.util.ArrayList);

var $ = DynamicList.prototype;

$.step = function(){
	if(this.host.isPresent){
		for (var i = 0, dyn ; dyn = this[i]; i++)
			if (dyn.isPlaying && ++this._counter % dyn.interval == 0) dyn.step();		
	}else{
		for (var i = 0, dyn ; dyn = this[i]; i++)
			if (!dyn.isPassive && dyn.isPlaying && ++this._counter % dyn.interval == 0) dyn.step();		
	}
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
var HalfSine = function(freq){
	var f = freq == undefined ? 1 : freq;
	this.fn = function(x) {var pi=Math.PI;return Math.abs(Math.sin(pi * x * f * 2));};
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
var Exp = function(pow){
	var pow = pow || 1;
	this.fn = function(x) {return Math.exp(x, pow) - 1;};
}.inherits(Interpolator);


/**
 * 
 */
var PowerIn = function(pow){
	var pow = pow || 1;
	this.fn = function(x){return Math.pow(x, pow);};
}.inherits(Interpolator);

/**
 * 
 */
var PowerOut = function(pow){
	var pow = pow || 1;
	this.fn = function(x){return 1 - Math.pow(1 - x, pow);};
}.inherits(Interpolator);


/**
 * 
 */
var PowerInOut = function(pow){
	var pow = pow || 1;
	this.fn = function(x){
	if ((x *= 2) < 1) return 0.5 * Math.pow(x, pow);
	return 1 - 0.5 * Math.abs(Math.pow(2-x,pow));};
	};

var bounceoutfn = function(x){
	{if (x < 1/2.75) {
		return (7.5625*x*x);
	} else if (x < 2/2.75) {
		return (7.5625*(x-=1.5/2.75)*x+0.75);
	} else if (x < 2.5/2.75) {
		return (7.5625*(x-=2.25/2.75)*x+0.9375);
	} else {
		return (7.5625*(x-=2.625/2.75)*x +0.984375);
	}};
};	

var baouneinfn = function(x){return 1 - bounceoutfn(1-x);};
	
/**
 * 
 */
var BounceOut = function(){
	this.fn = bounceoutfn;
}.inherits(Interpolator);

/**
 * 
 */
var BounceIn = function(){
	this.fn = baouneinfn;
}.inherits(Interpolator);

/**
 * 
 */
var BounceInOut = function(){
	this.fn = function(x){
	if (x < 0.5) return baouneinfn (x * 2) * 0.5;
	return bounceoutfn(x * 2 - 1) * 0.5 + 0.5;
	};
}.inherits(Interpolator);

/**
 * 
 */
var BackIn = function(param){
	var param = param || 1;
	this.fn = function(x){
		return x * x * ((param + 1) * x - param);
		};
}.inherits(Interpolator);

/**
 * 
 */
var BackOut = function(param){
	var param = param || 1;
	this.fn = function(x){
		return (--x * x * ((param + 1) * x + param) + 1);
		};
}.inherits(Interpolator);

/**
 * 
 */
var CircIn = function(){
	this.fn = function(x) {return Math.sqrt(1-(--x)*x);};
}.inherits(Interpolator);

/**
 * 
 */
var CircOut = function(){
	this.fn = function(x) {
		if ((x*=2) < 1) return -0.5*(Math.sqrt(1-x*x)-1);
		return 0.5*(Math.sqrt(1-(x-=2)*x)+1);
		};
}.inherits(Interpolator);


/**
 * 
 */
var ElasticIn = function(amplitude, period){
	var pi2 = Math.PI*2;
	var a = amplitude == undefined ? 1 : amplitude;
	var p = period == undefined ? 0.3 : period;
	this.fn =  function(x) {
		if (x == 0 || x == 1) return x;
		var s = p / pi2 * Math.asin(1 / a);
		return (a * Math.pow(2, -10 * x) * Math.sin((x - s) * pi2 / p ) + 1);
		};
}.inherits(Interpolator);

/**
 * 
 */
var ElasticOut = function(amplitude, period){
	var pi2 = Math.PI*2;
	var a = amplitude == undefined ? 1 : amplitude;
	var p = period == undefined ? 0.3 : period;
	this.fn = function(x) {
		if (x==0 || x==1) return x;
		var s = p / pi2 * Math.asin(1 / a);
		return -(a * Math.pow(2, 10 * (x -= 1)) * Math.sin((x - s) * pi2 / p));
		};
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

//Exporting
dream.dynamic = {
		Action:Action,
		Dynamic: Dynamic,
		Animation:Animation,
		Tween: Tween,
		SpriteAnimation:SpriteAnimation,
		DynamicList:DynamicList,
		Interpolator:Interpolator,
		Timeline:Timeline,
		interpolator:{
			Linear: Linear,
			Sine: Sine,
			Cosine: Cosine,
			HalfSine:HalfSine,
			Exp:Exp,
			PowerIn: PowerIn,
			PowerOut: PowerOut,
			PowerInOut:PowerInOut,
			BounceIn:BounceIn,
			BounceOut:BounceOut,
			BounceInOut:BounceInOut,
			BackIn:BackIn,
			BackOut:BackOut,
			CircIn:CircIn,
			CircOut:CircOut,
			ElasticIn: ElasticIn,
			ElasticOut: ElasticOut,
			ElasticInOut: ElasticInOut
		}
		
};

})();
