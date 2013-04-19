(function(window){

/**
 * @constructor
 */
var VisualAsset = function(){
	
}.inherits(dream.Asset);
var VisualAsset$ = VisualAsset.prototype;

dream.event.createWithCapture(VisualAsset$, "onMouseEnter");
dream.event.createWithCapture(VisualAsset$, "onMouseLeave");
dream.event.createWithCapture(VisualAsset$, "onMouseMove");
dream.event.createWithCapture(VisualAsset$, "onMouseDown");
dream.event.createWithCapture(VisualAsset$, "onMouseUp");
dream.event.createWithCapture(VisualAsset$, "onClick");
dream.event.createWithCapture(VisualAsset$, "onDrag");
dream.event.createWithCapture(VisualAsset$, "onDragStart");
dream.event.createWithCapture(VisualAsset$, "onDragStop");
dream.event.createWithCapture(VisualAsset$, "onDrop");

VisualAsset$.raiseMouseDown = function(event){
	dream.event.dispatch(this, "onMouseDown$capture", event);
	if(event._isPropagationStopped) return false;
	if(this.hovered) {
		this.hovered.raiseMouseDown(event.toLocal(this.hovered));
		if(event._isPropagationStopped) return false;
		event.restore();
	}
	dream.event.dispatch(this, "onMouseDown", event);
	this.isMouseDown = true;
};

VisualAsset$.raiseMouseUp = function(event, clickEvent, dropEvent){
	if(event._isPropagationStopped && clickEvent._isPropagationStopped) return false;
	
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp$capture", event);
	if(this.isMouseDown && !clickEvent._isPropagationStopped) dream.event.dispatch(this, "onClick$capture", event);
	
	if(dropEvent && !dropEvent._isPropagationStopped) dream.event.dispatch(this, "onDrop$capture", dropEvent);
	
	if(this.hovered){
		this.hovered.raiseMouseUp(event.toLocal(this.hovered), clickEvent.toLocal(this.hovered), dropEvent && dropEvent.toLocal(this.hovered));
		event.restore();
		clickEvent.restore();
	}
	
	if(dropEvent && !dropEvent._isPropagationStopped) dream.event.dispatch(this, "onDrop", dropEvent);
	
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseUp", event);
	if(this.isMouseDown && !clickEvent._isPropagationStopped){
		dream.event.dispatch(this, "onClick", event);
		this.isMouseDown = false;
	}
};

VisualAsset$.raiseMouseMove = function(event, dragEvent){
	dream.event.dispatch(this, "onMouseMove$capture", event);
	
	if(this.isMouseDown && !this.isDragging)
		dream.event.dispatch(this, "onDragStart$capture", dragEvent);

	if(this.hovered){
		this.hovered.raiseMouseMove(event.toLocal(this.hovered), dragEvent.toLocal(this.hovered));
		event.restore();
		dragEvent.restore();
	}
	
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onMouseMove", event);
	
	if(this.isMouseDown && !this.isDragging){
		if(!dragEvent._isPropagationStopped) dream.event.dispatch(this, "onDragStart", event);
		if(!dragEvent._isDefaultPrevented){
			this.isDragging = true;
			if(this.hovered) this.dragging = this.hovered;		
		}
	}
};

VisualAsset$.raiseMouseLeave = function(event){
	if(this.hovered) this.hovered.raiseMouseLeave(event.toLocal(this.hovered)), event.restore();
	this.isHovered = false;
	this.hovered = null;	
	dream.event.dispatch(this, "onMouseLeave", event);
};

VisualAsset$.raiseDrag = function(event){
	dream.event.dispatch(this, "onDrag$capture", event);
	if(!event._isPropagationStopped){
		if(this.dragging) this.dragging.raiseDrag(event.toLocal(this.dragging)), event.restore();
		if(!event._isPropagationStopped) dream.event.dispatch(this, "onDrag", event);
	}
};

VisualAsset$.raiseDragStop = function(event){
	dream.event.dispatch(this, "onDragStop$capture", event);
	if(this.dragging && !event._isPropagationStopped) this.dragging.raiseDragStop(event.toLocal(this.dragging)), event.restore();
	this.dragging = false;
	this.isDragging = false;
	if(!event._isPropagationStopped) dream.event.dispatch(this, "onDragStop", event);
};

dream.VisualAsset = VisualAsset;

})(window);