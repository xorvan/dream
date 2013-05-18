describe("LinkedList", function() {
	var l;
	
	beforeEach(function(){
		l = new dream.collection.LinkedList;
		onRemoveSpy = jasmine.createSpy("onRemove");
		l.onRemove.add(onRemoveSpy);
		
		onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
	});
	
	it("should be a class", function() {
		expect(l).toBeDefined();
	});
	
	it("should not add none objects and duplicates", function(){
		var items = [{s:12}, {s:13}, "ss", 275];
		
		l.push(items[2]);
		
		expect(onAddSpy).not.toHaveBeenCalled();
		expect(l.length).toEqual(0);
		expect(l.first).toBeFalsy();
		expect(l.last).toBeFalsy();
		
		
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
	
	it("check push function", function(){	
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		expect(l.length).toEqual(0);
		
		var r1 = l.push(items[2]);
		
		expect(onAddSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(1);
		expect(r1).toEqual(1);
			
		});
	it("check add function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		
		expect(l.length).toEqual(0);
		
		var r1 = l.add(items[1]);
		
		expect(onAddSpy).toHaveBeenCalledWith(items[1]);
		expect(onAddSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(1);
		expect(r1).toEqual(items[1]);
		
		var r2 = l.add(items[3]);
		
		expect(onAddSpy).toHaveBeenCalledWith(items[3]);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(l.length).toEqual(2);
		expect(r2).toEqual(items[3]);
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
		
		// insertAt
				
		var r1 = l.insertAt(1, item2);
		
		expect(onAddSpy.calls.length).toEqual(5);
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
		expect(onAddSpy.calls.length).toEqual(6);
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
		expect(onAddSpy.calls.length).toEqual(7);
		expect(item4.previous).toEqual(item3);
		expect(item2.next).toEqual(item3);
		expect(item3.previous).toEqual(item2);
		expect(item4.next).toEqual(items[1]);
		expect(items[1].previous).toEqual(item4);
		expect(l.length).toEqual(7);
		expect(r3).toEqual(item4);
		
		
	});
	it("check pop function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		
		expect(l.pop()).toEqual(null);
		
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
		expect(items[2].previous).toEqual(items[1]);
		expect(items[2].next).toEqual(null);
	});
	it("check removeByIndex function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		
		expect(function(){l.removeByIndex(0);}).toThrow();
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		var r1 = l.removeByIndex(1);
		
		expect(onRemoveSpy).toHaveBeenCalledWith(items[1]);
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(3);
		expect(r1).toEqual(items[1]);
		expect(items[0].next).toEqual(items[2]);
		expect(items[2].previous).toEqual(items[0]);
		expect(items[1].previous).toEqual(null);
		expect(items[1].next).toEqual(null);
		expect(l.at(1)).toEqual(items[2]);
	});
	it("check remove function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		expect(l.remove(items[0])).toBe(null);
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		var r1 = l.remove(items[2]);
		
		expect(onRemoveSpy).toHaveBeenCalledWith(items[2]);
		expect(onRemoveSpy.calls.length).toEqual(1);
		expect(l.length).toEqual(3);
		expect(r1).toEqual(items[2]);
		expect(items[1].next).toEqual(items[3]);
		expect(items[3].previous).toEqual(items[1]);
		expect(items[2].previous).toEqual(null);
		expect(items[2].next).toEqual(null);
		expect(l.at(2)).toEqual(items[3]); 
		expect(l.last).toEqual(items[3]);
		expect(l.first).toEqual(items[0]);
		
	});
	it("checks shift function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
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
	});
	it("checks unshift function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		var item2 = {ss:1337};
		
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		var r1 = l.unshift(item2);
		
		//expect(onAddSpy).toHaveBeenCalledWith(item2);
		expect(onAddSpy.calls.length).toEqual(5);
		expect(r1).toEqual(item2);
		expect(item2.previous).toEqual(null);
		expect(item2.next).toEqual(items[0]);
		expect(items[0].previous).toEqual(item2);
		expect(l.length).toEqual(5);
		expect(l.first).toEqual(item2);
		expect(l.at(0)).toEqual(item2);
		expect(l.at(1)).toEqual(items[0]);
		
	});
	it("checks clear function", function(){
		var items = [{s:12}, {s2:13}, {s3:"ss"}, {s4:[1,2,3]}];
		l.push(items[0]);
		l.push(items[1]);
		l.push(items[2]);
		l.push(items[3]);
		
		l.clear();
		
		expect(onRemoveSpy.calls.length).toEqual(4);
		expect(l.length).toEqual(0);
		expect(l.first).toEqual(null);
		expect(l.last).toEqual(null);
		
	});
 });