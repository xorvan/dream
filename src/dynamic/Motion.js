/**
 * @namespace dream.dynamic
 */
(function(window){
	/**
	 * *Motion* is a kind of {{#crossLink "dream.dynamic.Dynamic"}}Dynamic{{/crossLink}} that can be used to animate
	 * an objects property with an specific *velocity* and *acceleration*.
	 * The main difference of *Motion* and {{#crossLink "dream.dynamic.Animation"}}Animation{{/crossLink}} types is that
	 * it's duration is not important and it will run forever.
	 *  
	 * @class Motion
	 * @extends dream.dynamic.Dynamic
	 * @constructor
	 * @param {String} prop Property name to apply motion
	 * @param {Number} [velocity=0]
	 * @param {Number} [acceleration=0] 
	 * @param {Number} [interval=1] Interval of running step function 
	 */
	var Motion = function(prop, velocity, acceleration, interval){
		Motion._superClass.call(this, undefined, interval);
		this.prop = prop;
		this.velocity = velocity || 0;
		this.acceleration = acceleration || 0;
	}.inherits(dream.dynamic.Dynamic);
	
	var Motion$ = Motion.prototype;
	
	Motion$.step = function(){
		if(this.host){
			this.setHostValue(this.prop, this.getHostValue(this.prop) + this.velocity);
			this.velocity += this.acceleration;
		}
	};
	
	dream.dynamic.Motion = Motion;
	
})(window);