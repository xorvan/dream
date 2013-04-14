describe("LinkedList", function() {
	var l;
	
	beforeEach(function(){
		l = new dream.collection.LinkedList;
	});
	
	it("should be a class", function() {
		expect(l).toBeDefined();
	});
	
	it("should not add none objects and duplicates", function(){
		var items = [{s:12}, {s:13}, "ss", 275];
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		l.push(items[2]);
		
		expect(onAddSpy).not.toHaveBeenCalled();
		expect(l.length).toEqual(0);
		expect(l.first).toEqual(null);
		expect(l.last).toEqual(null);
		
		
		l.add(items[3]);
		
		expect(onAddSpy).not.toHaveBeenCalled();
		expect(l.length).toEqual(0);
		expect(l.first).toEqual(null);
		expect(l.last).toEqual(null);
		
		l.unshift(items[2]);
		
		expect(onAddSpy).not.toHaveBeenCalled();
		expect(l.length).toEqual(0);
		expect(l.first).toEqual(null);
		expect(l.last).toEqual(null);
		
		l.push(items[0]);
		
		l.push(items[0]);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(1);

		l.insertAt(0, items[0]);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(1);
	});
	
	it("check push and add functions", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		// before adding items
		
		expect(l.length).toEqual(0);
		
		var r1 = l.push(items[0]);
		
		expect(onAddSpy).toHaveBeenCalledWith(items[0]);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(1);
		expect(r1).toEqual(1);
		
		var r2 = l.add(items[1]);
		
		expect(onAddSpy).toHaveBeenCalledWith(items[1]);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(l.length).toEqual(2);
		expect(r2).toEqual(items[1]);
		
		var r3 = l.push(items[2]);
		
		expect(onAddSpy.calls.length).toEqual(3);
		expect(l.length).toEqual(3);
		expect(r3).toEqual(3);
		
	});
	
	it("checks first, last, next and previous properties of list and it's objects", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		
		// with no object
		expect(l.first).toEqual(null);
		expect(l.last).toEqual(null);
		
		l.push(items[0]);
		
		// after adding one object
		expect(l.first).toEqual(items[0]);
		expect(l.last).toEqual(items[0]);
		expect(items[0].next).toEqual(null);
		expect(items[0].previous).toEqual(null);
		
		l.push(items[1]);
		
		// after adding second object
		
		expect(l.first).toEqual(items[0]);
		expect(l.last).toEqual(items[1]);
		expect(items[0].next).toEqual(items[1]);
		expect(items[0].previous).toEqual(null);
		expect(items[1].previous).toEqual(items[0]);
		expect(items[1].next).toEqual(null);
		
		l.push(items[2]);
		
		// after adding third object
		
		expect(l.first).toEqual(items[0]);
		expect(l.last).toEqual(items[2]);
		expect(items[0].next).toEqual(items[1]);
		expect(items[0].previous).toEqual(null);
		expect(items[1].previous).toEqual(items[0]);
		expect(items[1].next).toEqual(items[2]);
		expect(items[2].previous).toEqual(items[1]);
		expect(items[2].next).toEqual(null);
		
	});
	it("checks at and indexOf functions", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		
		expect(function(){l.at(0)}).toThrow();
		
		l.push(items[0]);
		
		expect(l.at(0)).toEqual(items[0]);
		expect(l.indexOf(items[0])).toEqual(0);
		expect(function(){l.at(1)}).toThrow();
		expect(function(){l.at(-1)}).toThrow();
		
		l.push(items[1]);
		
		expect(l.at(0)).toEqual(items[0]);
		expect(l.at(1)).toEqual(items[1]);
		expect(l.indexOf(items[0])).toEqual(0);
		expect(l.indexOf(items[1])).toEqual(1);
		expect(function(){l.at(0)}).not.toThrow();
		expect(function(){l.at(1)}).not.toThrow();
		
		
		l.push(items[2]);
		
		expect(l.at(0)).toEqual(items[0]);
		expect(l.at(1)).toEqual(items[1]);
		expect(l.at(2)).toEqual(items[2]);
		expect(l.indexOf(items[0])).toEqual(0);
		expect(l.indexOf(items[1])).toEqual(1);
		expect(l.indexOf(items[2])).toEqual(2);
		
	});
	it("check insert functions", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		var item2 = {ss:1337}, item3 = {sss:1666}, item4 = {ss2:1557};
		
		expect(function(){l.insertAt(2, item2);}).toThrow();
		
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		// insertAt
				
		var r1 = l.insertAt(1, item2);
		
		expect(onAddSpy).toHaveBeenCalledWith(item2);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(l.first).toEqual(items[0]);
		expect(l.first.next).toEqual(item2);
		expect(item2.previous).toEqual(items[0]);
		expect(l.length).toEqual(5);
		expect(item2.previous).toEqual(items[0]);
		expect(items[1].next).toEqual(items[2]);
		expect(items[1].previous).toEqual(item2);
		expect(l.at(1)).toEqual(item2);
		expect(l.at(2)).toEqual(items[1]);
		expect(r1).toEqual(item2); //test 13
		
		//insertBefore
		
		expect(l.insertBefore(item4, item3)).toEqual(null);
		
		var r2 = l.insertBefore(items[1], item3);
		
		//expect(onAddSpy).toHaveBeenCalledWith(item3);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(item2.previous).toEqual(items[0]);
		expect(item2.next).toEqual(item3);
		expect(item3.previous).toEqual(item2);
		expect(item3.next).toEqual(items[1]);
		expect(items[1].previous).toEqual(item3);
		expect(l.length).toEqual(6);
		expect(r2).toEqual(item3);
		
		//insertAfter
		
		var r3 = l.insertAfter(item3, item4);
		
		//expect(onAddSpy).toHaveBeenCalledWith(item4);
		expect(onAddSpy.calls.length).toEqual(3);
		expect(item4.previous).toEqual(item3);
		expect(item2.next).toEqual(item3);
		expect(item3.previous).toEqual(item2);
		expect(item4.next).toEqual(items[1]);
		expect(items[1].previous).toEqual(item4);
		expect(l.length).toEqual(7);
		expect(r3).toEqual(item4);
		
		
	});
	
	it("check pop, remove and removeByIndex", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		var onRemoveSpy = jasmine.createSpy("onRemove");
		l.onRemove.add(onRemoveSpy);
		
		expect(l.pop()).toEqual(null);
		expect(function(){l.removeByIndex(0);}).toThrow();
		expect(l.remove(items[0])).toEqual(null);
		
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		expect(l.last).toEqual(items[3]);
		
		// pop
		var r1 = l.pop();
		
		expect(onRemoveSpy).toHaveBeenCalledWith(items[3]);
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(3);
		expect(r1).toEqual(items[3]);
		expect(items[3].next).toEqual(null);
		expect(items[3].previous).toEqual(null);
		expect(items[2].next).toEqual(null);
		expect(l.last).toEqual(items[2]);
		
		// removeByIndex
		
		var r2 = l.removeByIndex(1);
		
		expect(onRemoveSpy).toHaveBeenCalledWith(items[1]);
		expect(onRemoveSpy.calls.length).toEqual(2);
		expect(l.length).toEqual(2);
		expect(r2).toEqual(items[1]);
		expect(items[0].next).toEqual(items[2]);
		expect(items[2].previous).toEqual(items[0]);
		expect(items[1].previous).toEqual(null);
		expect(items[1].next).toEqual(null);
		expect(l.at(1)).toEqual(items[2]);
		
		l.push(items[1]);
		
		var r3 = l.remove(items[2]);
		
		// remove (at this point list is like items[0], items[2], items[1]
		
		expect(onRemoveSpy).toHaveBeenCalledWith(items[2]);
		expect(onRemoveSpy.calls.length).toEqual(3);
		expect(l.length).toEqual(2);
		expect(r3).toEqual(items[2]);
		expect(items[0].next).toEqual(items[1]);
		expect(items[1].previous).toEqual(items[0]);
		expect(items[2].previous).toEqual(null);
		expect(items[2].next).toEqual(null);
		expect(l.at(1)).toEqual(items[2]); //30
		expect(l.last).toEqual(items[1]);
		expect(l.first).toEqual(items[0]);
		
	});
	it("checks shift and unshift", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		var item2 = {ss:1337};
		
		var onRemoveSpy = jasmine.createSpy("onRemove");
		l.onRemove.add(onRemoveSpy);
		
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		// shift
		
		var r1 = l.shift();
		
		expect(onRemoveSpy).toHaveBeenCalledWith(items[0]);
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(r1).toEqual(items[0]);
		expect(l.first).toEqual(items[1]);
		expect(l.at(0)).toEqual(items[1]);
		expect(l.at(1)).toEqual(items[2]);
		expect(items[0].previous).toEqual(null);
		expect(items[0].next).toEqual(null);
		expect(items[1].previous).toEqual(null);
		expect(l.length).toEqual(3);
		
		// unshift
		
		var r2 = l.unshift(item2);
		
//		expect(onAddSpy).toHaveBeenCalledWith(items[0]);
//		expect(onAddSpy.calls.length).toEqual(5);
//		//expect(r2).toEqual(item2);
//		expect(item2.previous).toEqual(null);
//		expect(item2.next).toEqual(items[1]);
//		expect(items[1].previous).toEqual(item2);
//		expect(l.length).toEqual(4);
//		expect(l.first).toEqual(item2);
//		expect(l.at(0)).toEqual(item2);
//		expect(l.at(1)).toEqual(items[1]);
		
	});
	xit("checks indexOf", function(){
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
	xit("checks shift nd unshift functions", function(){
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
	xit("checks at and insertAt functions", function(){
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
	xit("checks clear and put functions", function(){
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