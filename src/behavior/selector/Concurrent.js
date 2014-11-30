/**
 * @module behavior
 * @namespace dream.behavior.selector
 */
(function(window){

/**
 * @class Concurrent
 * @constructor
 * @extends dream.behavior.selector.Selector
 */
var Concurrent = function(actions, count, status){
	Concurrent._superClass.call(this, actions);
	
	this.count = count || 1;
	this.status = status || false;
	
}.inherits(dream.behavior.selector.Selector);
var Concurrent$ = Concurrent.prototype;

Concurrent$.step = function(){
	var sCount = 0 , fCount = 0, rCount = 0;
		
	for(var i = 0, l = this.actions.length; i < l; i++){
		var r = this.actions[i].step();
		if(r){
			sCount++;
		}else if(r == false){
			fCount++;
		}else{
			rCount++;
		}
	}
	
	if(this.status){
		return (sCount >= this.count || ( (sCount + rCount >= this.count) && undefined ) );
	}else{
		return (!(fCount >= this.count) && ( (fCount + rCount >= this.count) && undefined ) );
	}
};

//exports
dream.behavior.selector.Concurrent = Concurrent;
	
})(window);