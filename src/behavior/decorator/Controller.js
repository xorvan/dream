/**
 * @module behavior
 * @namespace dream.behavior.decorator
 */
(function(window){

/**
 * *Controller* is a kind of *Decorator* that can be bee used as a wrapper for 
 * all kind of *Animation*s to control their playback. 
 * @class Controller
 * @extends dream.behavior.decorator.Decorator
 **/
var Controller = function(animation, loop){
	Controller._superClass.call(this, animation);
	this.loop = loop;
	
	/**
	 * is used to check if we are playing forward or backward or to set it.
	 * if isBackward is set to true the animation frame are played backward (ex. 10, 9, 8 ...)
	 * @property isBackward
	 * @type Boolean
	 */
	this.isBackward = false;
	
}.inherits(dream.behavior.decorator.Decorator);

var Controller$ = Controller.prototype;
dream.event.create(Controller$, "onEnd");
dream.event.create(Controller$, "onCycle");
dream.event.create(Controller$, "onPlay");
dream.event.create(Controller$, "onPause");

Object.defineProperty(Controller$, "duration", {
	get : function() {
		return  this.action.duration;
	}
});

Object.defineProperty(Controller$, "isPassive", {
	get : function() {
		return  this.action.isPassive;
	}
});

/**
 * *position can be used to seek animation frame to the one desired, or to check were in the animation we are at the moment.
 * @property position
 * @type Number
 */
Object.defineProperty(Controller$, "position", {
	get : function() {
		return  this._counter;
	},
	set:function(frame){
		var anim = this.action;
		
		if (frame == anim._counter) return;
		
		if (frame > anim.duration) 
			frame = anim.duration;
		else if (frame < 1 ) 
			frame = 1;
		
		if (this.actions){
			var min, max, direction;
			if(anim._counter > frame ) 
				min = frame, max = anim._counter, direction = false;
			else 
				min = anim._counter, max = frame, direction = true;
			
			var action;
			if(direction)
				for (var i = min; i <= max; i++) if (action = anim.actions[i]) action.execOnSeek && action.fn.call(anim.host, 1);

			else
				for (var i = max; i <= min; i--) if (action = anim.actions[i]) action.execOnSeek && action.fn.call(anim.host, -1);
		}
		
		if (anim.animations)
			for ( var i = 0, a; a = anim.animations[i]; i++){
				if(frame < a._startFrame){
					a._counter = 1;
					a.fn.call(a.host, 1, a, direction ? 1 : -1);	
				} else if(frame > a._startFrame + a.duration){
					a._counter = a.duration;
					a.fn.call(a.host, a.duration, a, direction ? 1 : -1);	
				};				
			}
		
		anim._counter = frame;
		anim.fn.call(anim.host, frame, anim, direction ? 1 : -1);
	}
});

Controller$.step = function(frame) {
	if(!this.isPlaying) return undefined;
	
	var anim = this.action,
	res = undefined;
	
	if (this.isBackward) {
		if(anim.fn) anim.fn.call(anim.host, anim._counter, anim, -1);
		anim._counter--;
		if (anim._counter < 1) {
			if (this.loop) {
				this.position = this.duration;
				dream.event.dispatch(this, "onCycle");
			} else {
				anim._counter = 0;
				dream.event.dispatch(this, "onEnd");
				this.isPlaying = false;
				res = true;
			}
		}
	} else {
		if(anim.fn) anim.fn.call(anim.host, anim._counter, anim, 1);
		anim._counter++;
		if (anim._counter > anim.duration) {
			if (this.loop) {
				this.position = 1;
				dream.event.dispatch(this, "onCycle");
			} else {
				anim._counter = anim.duration + 1;
				dream.event.dispatch(this, "onEnd");
				this.isPlaying = false;
				res = true;
			}
		}
	}
	var action;
	if(action = anim.actions[anim._counter]){
		action.fn.call(anim.host, this.isBackward ? -1 : 1);
	}
	
	return res;
};

Controller$.pause = function(){
	this.isPlaying = false;
	dream.event.dispatch("onPause");
	return this;
};

Controller$.play = function(){
	var anim = this.action;
	if (anim._counter == 0 || anim._counter == anim.duration + 1) this.rewind();
	this.isPlaying = true;
	dream.event.dispatch("onPlay");
	return this;
};
/**
 * Restarts the animation and sets frame to 1 if we are playing forward or last frame if we are playing backward
 * @method rewind
 * @return {Object} this
 * @chainable
 */
Controller$.rewind = function(){
	if (this.isBackward) this.position = this.duration;
	else this.position = 1; 
	return this;
};

/**
 * Stops the animation and sets frame to 1 if we are playing forward or last frame if we are playing backward
 * @method stop
 * @return {Object} this
 * @chainable
 */
Controller$.stop = function(){
	this.rewind();
	this.pause();
	return this;
};

//exports
dream.behavior.decorator.Controller = Controller;
	
})(window);