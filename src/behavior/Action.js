/**
 * @module behavior
 * @namespace dream.behavior
 */
(function(window){
	
/**
 * *Action* provides foundation for any logic and animation. basically you specify a function and an interval then that function will be called 
 * in the specified interval. Note dynamic have not any timeline or status, it is just executed.
 * @class Action
 * @constructor
 **/
var Action = function(fn, initFn) {
	if (fn) this.fn = fn;
	if (initFn) this.initFn = initFn;
	this.isPassive = false;
};
var Action$ = Action.prototype;

Action$.step = function(){
	return this.fn.call(this.host);	
};

Action$.init = function(host, force){
	if(!this.host || force)
		this.host = host;
	if(this.initFn) 
		this.initFn(this.host);	
	return this;
};

Action$.getHostValue = function(i){
	return i.indexOf(".") > -1 ? eval("this.host."+ i) : this.host[i];
};

Action$.setHostValue = function(i, v){
	return i.indexOf(".") > -1 ? eval("this.host."+ i + " = " + v) : this.host[i] = v;
};

//exports
dream.behavior.Action = Action;
	
})(window);