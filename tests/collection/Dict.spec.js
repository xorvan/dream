describe("Dict", function() {
	var d;
	
	beforeEach(function(){
		d = new dream.collection.Dict;
		onRemoveSpy = jasmine.createSpy("onRemove");
		d.onRemove.add(onRemoveSpy);
		
		onAddSpy = jasmine.createSpy("onAdd");
		d.onAdd.add(onAddSpy);
	});
	
	it("should be a class", function() {
		expect(d).toBeDefined();
	});
	it("should be inherited from Collection", function(){
		expect(d).toEqual(jasmine.any(dream.collection.Collection));
	});
	
	it("check add function", function(){
		var items = [{s:12}, {s:13}, "ss", 275];
		
		d.add(items[0],"m1");
		
		
		expect(onAddSpy).toHaveBeenCalledWith(items[0]);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(d.length).toEqual(1);
		expect(d.m1).toEqual(items[0]);
		expect(d[0]).toEqual(items[0]);
	});
	it("check addJson function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		d.addJson(items);
		
		expect(onAddSpy.calls.length).toEqual(3);
		expect(d.length).toEqual(3);
		expect(d.s).toEqual(12);
		expect(d.s2).toEqual(13);
		expect(d.ss).toEqual({i:"s24"});
	});
	
	it("check remove function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		d.addJson(items);
		
		d.remove(items.ss);
		
		expect(onRemoveSpy).toHaveBeenCalledWith({i:"s24"});
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(d.length).toEqual(2);
		expect(d.s).toEqual(12);
		expect(d.s2).toEqual(13);
		expect(d.ss).not.toBeDefined();
	});
	it("check removeById function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		d.addJson(items);
		
		d.removeById("s2");
		
		expect(onRemoveSpy).toHaveBeenCalledWith(13);
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(d.length).toEqual(2);
		expect(d.s).toEqual(12);
		expect(d.s2).not.toBeDefined();
		expect(d.ss).toEqual(items.ss);
	});
	it("check removeByIndex function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		d.addJson(items);
		
		d.removeByIndex(1);
		
		expect(onRemoveSpy).toHaveBeenCalledWith(13);
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(d.length).toEqual(2);
		expect(d.s).toEqual(12);
		expect(d.s2).not.toBeDefined();
		expect(d.ss).toEqual(items.ss);
	});
	it("check clear function", function(){
		var items = {s:12, s2:13, ss:{i:"s24"}};
		
		d.addJson(items);
		
		d.clear();
		
		expect(onRemoveSpy.calls.length).toEqual(3);
		expect(d.length).toEqual(0);
		expect(d.s).not.toBeDefined();
		expect(d.s2).not.toBeDefined();
		expect(d.ss).not.toBeDefined();
	});
	
	
 });