describe("EventDispatcher", function(){
	
	var C = function(){
		
	};
	
	C.prototype.action = function(){
		dream.event.dispatch(this, "onEvent")
	};
	
	
	listeners = jasmine.createSpyObj('listeners', ['create', 'dispatch']);;
	
	dream.event.create(C.prototype, "onEvent", listeners.create);
	
	var c = new C;
	
	it("should not create dispatcher while no one listens", function(){
		expect(c.__events).not.toBeDefined();
	});
	
	it("should create dispatcher and call callBack when someone listens", function(){
		c.onEvent.add(listeners.dispatch);
		expect(c.__events.onEvent).toEqual(jasmine.any(dream.event.EventDispatcher))
		expect(listeners.create).toHaveBeenCalled();
	});
	
	it("should dispatch event", function(){
		c.action();
		expect(listeners.dispatch.calls.length).toEqual(1);
		c.action();
		expect(listeners.dispatch.calls.length).toEqual(2);
	});
	
	it("should not dispatch event while its buffering", function(){
		dream.event.buffer(c, "onEvent");
		c.action();
		expect(listeners.dispatch.calls.length).toEqual(2);
		c.action();
		expect(listeners.dispatch.calls.length).toEqual(2);
	});
	
	it("should pass all events to flush filter", function(){
		var calls;
		dream.event.flush(c, "onEvent", function(q){
			calls = q;
		});
		
		expect(calls.length).toEqual(2);
	});
	


});