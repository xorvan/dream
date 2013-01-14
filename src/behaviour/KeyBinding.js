/**
 * 
 */
(function(window){

/**
 * @constructor
 */
var KeyBinding = function(fn, key, interval){
	this.fn = fn;
	this.key = key;
	this.interval = interval;
}.inherits(dream.Behaviour);
var $ = KeyBinding.prototype;

$.enable = function(){

};

$.disable = function(){

};

dream.behaviour.Keybinding = KeyBinding;

})(window);