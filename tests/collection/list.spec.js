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
	
	it("should call onAdd when adding a new item", function(){
		var item = "myItem";
		var onAddSpy = jasmine.createSpy("onAdd");
		l.onAdd.add(onAddSpy);
		l.add(item);
		l.push(item);
		
		expect(onAddSpy).toHaveBeenCalledWith(item);
		expect(onAddSpy.calls.length).toEqual(2);
		expect(l.length).toEqual(2);
	});
 });