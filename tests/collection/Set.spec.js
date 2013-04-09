describe("Set", function() {
	var s;
	
	beforeEach(function(){
		s = new dream.collection.Set;
	});
	
	it("should be a class", function() {
		expect(s).toBeDefined();
	});
	
	it("should be inherited from List", function(){
		expect(s).toEqual(jasmine.any(dream.collection.List));
	});
	
	it("should not allow duplicate to be in set", function(){
		var item = "myItem", item2 = "myItem2", item3 = "myItem3", item4 = "myItem4";
		
		var onAddSpy = jasmine.createSpy("onAdd");
		s.onAdd.add(onAddSpy);
		
		var r1 = s.add(item);
		expect(onAddSpy).toHaveBeenCalledWith(item);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(s.length).toEqual(1);
		expect(r1).toEqual(item);
		
		s.push(item);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(s.length).toEqual(1);
		
		var r2 = s.push(item2);
		expect(onAddSpy).toHaveBeenCalledWith(item2);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(s.length).toEqual(2);
		
		s.unshift(item);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(s.length).toEqual(2);
		
		var r3 = s.unshift(item3);
		expect(onAddSpy).toHaveBeenCalledWith(item3);
		expect(onAddSpy.calls.length).toEqual(3);
		expect(s.length).toEqual(3);
		expect(r3).toEqual(item3);
		
		s.insertAt(0, item);
		expect(onAddSpy.calls.length).toEqual(3);
		expect(s.length).toEqual(3);
		
		var r4 = s.insertAt(0, item4);
		expect(onAddSpy).toHaveBeenCalledWith(item4);
		expect(onAddSpy.calls.length).toEqual(4);
		expect(s.length).toEqual(4);
		expect(r4).toEqual(item4);
		
	});
	
	it("should delete GID from set.gids", function(){
		var items = [{s:12}, {s:13}, {s:14}, {s:15}];
		var onRemoveSpy = jasmine.createSpy("onRemove");
		s.onRemove.add(onRemoveSpy);
		
		s.addArray(items);
		
		expect(s._GIDs[items[0].__GID]).toEqual(true);
		expect(s._GIDs[items[1].__GID]).toEqual(true);
		expect(s._GIDs[items[2].__GID]).toEqual(true);
		expect(s._GIDs[items[3].__GID]).toEqual(true);
		
		s.pop();
		expect(onRemoveSpy).toHaveBeenCalled();
		expect(s._GIDs[items[3].__GID]).toEqual(undefined);
		
		s.shift();
		expect(onRemoveSpy).toHaveBeenCalled();
		expect(s._GIDs[items[0].__GID]).toEqual(undefined);
		
		s.removeByIndex(1);
		expect(onRemoveSpy).toHaveBeenCalledWith(items[2]);
		expect(s._GIDs[items[2].__GID]).toEqual(undefined);
		
	});
	
 });