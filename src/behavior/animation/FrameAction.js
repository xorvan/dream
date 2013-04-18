/**
 * @module behavior
 * @namespace dream.behavior.animation
 */
(function(window){
	
/**
 * Class for creating actions to be used in animations. any action have a function to be executed on desired frame and a flag
 * which determines whether it should be executed if we fast forward/backward animation.
 * the function of actions get a phase argument during execution which is 1 if we are going forward or -1 if we are going backward. it should be used 
 * to for example reversing the effect that function have caused.
 * @class FrameAction
 * @constructor
 */
var FrameAction = function (fn, execOnSeek){
	this.fn = fn;
	this.execOnSeek = execOnSeek;
};

//exports
dream.behavior.animation.FrameAction = FrameAction;
	
})(window);