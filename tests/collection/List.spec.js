describe("List", function() {
	var l;
	
	beforeEach(function(){
		l = new dream.collection.List;
	});
	
	it("should be a class", function() {
		expect(l).toBeDefined();
	});
	
	it("should be inherited from Collection", function(){
		expect(l).toEqual(jasmine.any(dream.collection.Collection));
	});
	
	it("checks add and push functions", function(){
		var item = "myItem";
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		var r1 = l.add(item);
		var r2 = l.push(item);
		
		expect(onAddSpy).toHaveBeenCalledWith(item);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(l.length).toEqual(2);
		expect(r1).toEqual(item);
		expect(r2).toEqual(2);
	});
	it("checks remove, removeByIndex and pop functions", function(){
		var item = "myItem1", item2 = "myItem2";
		var onRemoveSpy = jasmine.createSpy("onAdd");
		l.onRemove.add(onRemoveSpy);
		l.push(item);
		l.push(item2);
		
		// check pop
		var r1 = l.pop();
		expect(onRemoveSpy).toHaveBeenCalledWith(item2);
		expect(l.length).toEqual(1);
		expect(r1).toEqual(item2);
		
		//check remove
		l.push(item2);
		
		var r2 = l.remove(item2)
		expect(onRemoveSpy).toHaveBeenCalledWith(item2);
		expect(l.length).toEqual(1);
		expect(r2).toEqual(item2);
		
		// check removeByIndex
		l.push(item2);
		
		var r3 = l.removeByIndex(0);
		expect(onRemoveSpy).toHaveBeenCalledWith(item);
		expect(l.length).toEqual(1);
		expect(r3).toEqual(item);
		expect(l[0]).toEqual(item2);
	});
	it("checks addArray", function(){
		var items = ["s0", "s1","s2", "s3"];
		
		l.addArray(items);
		
		expect(l.length).toEqual(4);
		expect(l[0]).toEqual("s0");
		expect(l[1]).toEqual("s1");
		expect(l[2]).toEqual("s2");
		expect(l[3]).toEqual("s3");
	});
	it("checks indexOf", function(){
		var item1 = {a:23};
		var item2 = 12;
		var item3 = "ss";
		
		var item4 = {b:34};
		var item5 = 275;
		
		var r0 = l.indexOf(item1);
		
		l.push(item1);
		l.push(item2);
		l.push(item3);
		
		var r1 = l.indexOf(item1);
		var r2 = l.indexOf(item2);
		var r3 = l.indexOf(item3);
		var r4 = l.indexOf(item4);
		var r5 = l.indexOf(item5);
		
		expect(r0).toEqual(-1);
		expect(r1).toEqual(0);
		expect(r2).toEqual(1);
		expect(r3).toEqual(2);
		expect(r4).toEqual(-1);
		expect(r5).toEqual(-1);
		
		l.pop();
		
		var r33 = l.indexOf(item3);
		expect(r33).toEqual(-1);
	});
	it("checks shift nd unshift functions", function(){
		var items = ["s0", "s1","s2", "s3"];
		l.addArray(items);
		
		var onRemoveSpy = jasmine.createSpy("onAdd");
		l.onRemove.add(onRemoveSpy);
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		// check shift
		var r1 = l.shift();
		expect(onRemoveSpy).toHaveBeenCalledWith("s0");
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(r1).toEqual("s0");
		expect(l.length).toEqual(3);
		expect(l[0]).toEqual("s1");
		
		// check unshift
		var r2 = l.unshift("ss")
		expect(onAddSpy).toHaveBeenCalledWith("ss");
		expect(onAddSpy.calls.length).toEqual(1);
		expect(r2).toEqual("ss");
		expect(l.length).toEqual(4);
		expect(l[0]).toEqual("ss");
		expect(l[3]).toEqual("s3");
		
	});
	it("checks at and insertAt functions", function(){
		var items = ["s0", "s1","s2", "s3"];
		l.addArray(items);
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		// check at function
		expect(l.at(0)).toEqual("s0");
		expect(l.at(3)).toEqual("s3");
		expect(l.at(7)).toEqual(undefined);
		
		//check insertAt
		
		l.insertAt(2, "ss");
		expect(l[2]).toEqual("ss");
		expect(l[1]).toEqual("s1");
		expect(l[3]).toEqual("s2");
		expect(l[4]).toEqual("s3");
		expect(l.length).toEqual(5);
		expect(onAddSpy).toHaveBeenCalledWith("ss");
		expect(onAddSpy.calls.length).toEqual(1);
		
	});
	it("checks clear and put functions", function(){
		var items = ["s0", "s1","s2", "s3"];
		l.addArray(items);
		
		var onRemoveSpy = jasmine.createSpy("onAdd");
		l.onRemove.add(onRemoveSpy);
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		// check put
		var r1 = l.put(2, "ss");
		expect(onRemoveSpy).toHaveBeenCalledWith("s2");
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(onAddSpy).toHaveBeenCalledWith("ss");
		expect(onAddSpy.calls.length).toEqual(1);
		expect(r1).toEqual("ss");
		expect(l.length).toEqual(4);
		expect(l[1]).toEqual("s1");
		expect(l[2]).toEqual("ss");
		expect(l[3]).toEqual("s3");
		
		// check clear
		l.clear();
		expect(onRemoveSpy.calls.length).toEqual(5);
		expect(l.length).toEqual(0);
		expect(l[0]).toEqual(undefined);
	});
 });