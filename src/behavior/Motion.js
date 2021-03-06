/**
 * @module behavior
 * @namespace dream.behavior
 */
(function(window){
	/**
	 * *Motion* is a kind of {{#crossLink "dream.behavior.Action"}}Action{{/crossLink}} that can be used to animate
	 * an objects property with an specific *velocity* and *acceleration*.
	 * The main difference of *Motion* and {{#crossLink "dream.dynamic.Animation"}}Animation{{/crossLink}} types is that
	 * it's duration is not important and it will run forever.
	 *  
	 * @class Motion
	 * @extends dream.behavior.Action
	 * @constructor
	 * @param {String} prop Property name to apply motion
	 * @param {Number} [velocity=0]
	 * @param {Number} [acceleration=0] 
	 * @param {Function} [fn] 
	 * @param {Number} [interval=1] Interval of running step function 
	 * @param {Function} [initFn] 
	 */
	var Motion = function(prop, velocity, acceleration, fn, initFn){
		Motion._superClass.call(this, fn, initFn);
		this.prop = prop;
		this.velocity = velocity || 0;
		this.acceleration = acceleration || 0;
	}.inherits(dream.behavior.Action);
	
	var Motion$ = Motion.prototype;
	
	Motion$.step = function(){
		if(this.host){
			this.setHostValue(this.prop, this.getHostValue(this.prop) + this.velocity);
			this.velocity += this.acceleration;
			if(this.fn) 
				return this.fn.call(this.host, this) 
			else 
				return true;
		}
	};
	
	dream.behavior.Motion = Motion;
	
})(window);