/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){

var Animation = dream.behavior.animation.Animation;

/**
 *
 */
var Interpolator = function(){};

Object.defineProperty(Interpolator.prototype, "withReverse", {
	get : function() {
		return new WithReverse(this);
	}
});

var WithReverse = function(int){
	this.fn = function(t){
		if (t < 0.5)
			return int.fn(t * 2);
		else
			return int.fn((1 - t) * 2);
	};
}.inherits(Interpolator);


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
}.inherits(Interpolator);

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
var CircleIn = function(){
	this.fn = function(x) {return Math.sqrt(1-(--x)*x);};
}.inherits(Interpolator);

/**
 *
 */
var CircleOut = function(){
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

var PathY = function(path, scale){
	if (path instanceof dream.geometry.Path)
		this.path = path;
	else
		throw Error("Path Interpolator Only Accepts a path as Input");
	this.scale = scale || 1;
	var pt = this;
	this.fn = function(x){
		return point = pt.path.solve(x).top / this.scale;
	};
}.inherits(Interpolator);

var PathX = function(path, scale){
	if (path instanceof dream.geometry.Path)
		this.path = path;
		else
			throw Error("Path Interpolator Only Accepts a path as Input");
	this.scale = scale || 1;;
	var pt = this;
	this.fn = function(x){
		return point = pt.path.solve(x).left / this.scale;
	};
}.inherits(Interpolator);

//exports
dream.behavior.animation.interpolator = {
	Interpolator: Interpolator,
	Linear: Linear,
	WithReverse: WithReverse,
	Sine: Sine,
	Cosine: Cosine,
	HalfSine: HalfSine,
	Exp:Exp,
	PowerIn: PowerIn,
	PowerOut: PowerOut,
	PowerInOut: PowerInOut,
	BounceIn: BounceIn,
	BounceOut: BounceOut,
	BounceInOut: BounceInOut,
	BackIn: BackIn,
	BackOut: BackOut,
	CircleIn: CircleIn,
	CircleOut: CircleOut,
	ElasticIn: ElasticIn,
	ElasticOut: ElasticOut,
	ElasticInOut: ElasticInOut,
	PathY : PathY,
	PathX : PathX
};

})(window);
