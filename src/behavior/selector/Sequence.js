/**
 * @module behavior
 * @namespace dream.behavior.selector
 */
(function(window){

/**
 * @class Sequence
 * @constructor
 * @extends dream.behavior.selector.Selector
 */
var Sequence = function(actions){
	Sequence._superClass.call(this, actions);
}.inherits(dream.behavior.selector.Selector);

var Sequence$ = Sequence.prototype;

Sequence$.step = function(){
	var index = this.current ? this.actions.indexOf(this.current) : 0;
	delete this.current;
	for(var i = index, l = this.actions.length; i < l; i++){
		var r = this.actions[i].step();
		if( r == false){
			return false;
		}else if(r == undefined){
			this.current = this.actions[i];
			return r;
		}
	}
	return true;
};

//exports
dream.behavior.selector.Sequence = Sequence;
	
})(window);