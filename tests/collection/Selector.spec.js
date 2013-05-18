describe("Selector", function() {
	var s;
	
	beforeEach(function(){
		s = new dream.collection.Selector;
		onRemoveSpy = jasmine.createSpy("onRemove");
		s.onRemove.add(onRemoveSpy);
		
		onAddSpy = jasmine.createSpy("onAdd");
		s.onAdd.add(onAddSpy);
		
		onSelectSpy = jasmine.createSpy("onSelect");
		s.onSelect.add(onSelectSpy);
		
		onDeselectSpy = jasmine.createSpy("onDeselect");
		s.onDeselect.add(onDeselectSpy);
	});
	
	it("should be a class", function() {
		expect(s).toBeDefined();
	});
	it("should be inherited from Collection", function(){
		expect(s).toEqual(jasmine.any(dream.collection.Dict));
	});
	
	it("check select function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		s.addJson(items);
		
		s.select(items.ss);
		
		expect(onSelectSpy).toHaveBeenCalledWith(items.ss);
		expect(onSelectSpy.calls.length).toEqual(1);
		expect(s.current).toEqual(items.ss);


		s.select(items.s2);
		
		expect(onDeselectSpy).toHaveBeenCalledWith(items.ss);
		expect(onDeselectSpy.calls.length).toEqual(1);
		expect(onSelectSpy).toHaveBeenCalledWith(items.s2);
		expect(onSelectSpy.calls.length).toEqual(2);
		expect(s.current).toEqual(items.s2);
		
	});
	it("check selectById function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		s.addJson(items);
		
		s.selectById('s2');
		
		expect(onSelectSpy).toHaveBeenCalledWith(items.s2);
		expect(onSelectSpy.calls.length).toEqual(1);
		expect(s.current).toEqual(items.s2);
		
		
		s.selectById('ss');
		
		expect(onDeselectSpy).toHaveBeenCalledWith(items.s2);
		expect(onDeselectSpy.calls.length).toEqual(1);
		expect(onSelectSpy).toHaveBeenCalledWith(items.ss);
		expect(onSelectSpy.calls.length).toEqual(2);
		expect(s.current).toEqual(items.ss);
		
	});
	it("check current attribute", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		expect(s.current).toEqual(null);
		
		s.addJson(items);
		
		s.current = items.ss
		
		expect(onSelectSpy).toHaveBeenCalledWith(items.ss);
		expect(onSelectSpy.calls.length).toEqual(1);
		expect(s.current).toEqual(items.ss);
		
		s.current = items.s2;
		
		expect(onDeselectSpy).toHaveBeenCalledWith(items.ss);
		expect(onDeselectSpy.calls.length).toEqual(1);
		expect(onSelectSpy).toHaveBeenCalledWith(items.s2);
		expect(onSelectSpy.calls.length).toEqual(2);
		expect(s.current).toEqual(items.s2);
		
	});
	
	
 });