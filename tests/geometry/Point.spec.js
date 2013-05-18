describe("Point", function() {
	var p;
	
	beforeEach(function(){
		p = new dream.geometry.Point(10,20);
		onChangeSpy = jasmine.createSpy("onRemove");
		p.onChange.add(onChangeSpy);
	});
	
	it("should be a class", function() {
		expect(p).toBeDefined();
	});
	it("check default constructor arguments", function() {
		var p1 =new dream.geometry.Point;
		expect(p1.left).toEqual(0);
		expect(p1.top).toEqual(0);
	});
	
	
	it("check left and top properties and onChange event", function(){
		
		expect(p.left).toEqual(10);
		expect(p.top).toEqual(20);
		
		p.left = 12;
		expect(p.left).toEqual(12);
		expect(onChangeSpy.calls.length).toEqual(1);
		p.top = 32;
		expect(p.top).toEqual(32);
		expect(onChangeSpy.calls.length).toEqual(2);
	});
	it("check isIn function", function(){
		var rect1 =new dream.geometry.Rect(0,0,20,40);
		var rect2 =new dream.geometry.Rect(-20,-20,0,0);
		
		var r1 = p.isIn(rect1);
		var r2 = p.isIn(rect2);
		
		expect(r1).toBeTruthy();
		expect(r2).toBeFalsy();
	});
	it("check clone function", function(){
		var p2 = p.clone();
		
		expect(p2.left).toEqual(p.left);
		expect(p2.top).toEqual(p.top);
		
	});
	
	it("check toString function", function(){
		var r1 = p.toString();
		
		expect(r1).toEqual("Point[10, 20]");
	});
	
 });