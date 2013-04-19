/**
 * @module behavior
 * @namespace dream.behavior.selector
 */
(function(window){
	
/**
 * @class Priority
 * @constructor
 * @extends dream.behavior.selector.Selector
 */
var Priority = function(actions){
	Priority._superClass.call(this, actions);
}.inherits(dream.behavior.selector.Selector);

var Priority$ = Priority.prototype;

Priority$.step = function(){
	var index = this.current ? this.actions.indexOf(this.current) : 0;
	delete this.current;
	for(var i = index, l = this.actions.length; i < l; i++){		
		var r = this.actions[i].step();
		if(r == true){
			return r;
		}else if(r !== false){
			this.current = this.actions[i];
			return r;
		}
	}
	return false;
};

//exports
dream.behavior.selector.Priority = Priority;
	
})(window);