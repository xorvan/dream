describe("Rect", function() {
	var r;
	
	beforeEach(function(){
		r = new dream.geometry.Rect(10,20, 20, 20);
	});
	
	it("should be a class", function() {
		expect(r).toBeDefined();
	});
	it("check default constructor arguments", function() {
		var r1 =new dream.geometry.Rect;
		expect(r1.left).toEqual(0);
		expect(r1.top).toEqual(0);
		expect(r1.width).toEqual(0);
		expect(r1.height).toEqual(0);
	});
	
	
	it("check properties (left, top, width, height, right, bottom, area", function(){
		
		expect(r.left).toEqual(10);
		expect(r.top).toEqual(20);
		expect(r.width).toEqual(20);
		expect(r.height).toEqual(20);
		
		r.left = 12;
		r.top = 22;
		r.width = 30;
		r.height = 30;
		
		expect(r.left).toEqual(12);
		expect(r.top).toEqual(22);
		expect(r.width).toEqual(30);
		expect(r.height).toEqual(30);
		
		expect(r.right).toEqual(42);
		expect(r.bottom).toEqual(52);
		expect(r.area).toEqual(900);
	});
	it("check hasIntersectWith function", function(){
		var rect1 =new dream.geometry.Rect(0, 0, 9, 9);
		var rect2 =new dream.geometry.Rect(10, 10, 20, 20);
		
		var r1 = r.hasIntersectWith(rect1);
		var r2 = r.hasIntersectWith(rect2);
		
		expect(r1).toBeFalsy();
		expect(r2).toBeTruthy();
	});
	it("check getIntersectWith function", function(){
		var rect1 =new dream.geometry.Rect(0, 0, 9, 9);
		var rect2 =new dream.geometry.Rect(10, 10, 20, 20);
		
		var r1 = r.getIntersectWith(rect1);
		var r2 = r.getIntersectWith(rect2);
		
		expect(r1).toBe(false);
		expect(r2.left).toEqual(10);
		expect(r2.top).toEqual(20);
		expect(r2.width).toEqual(20);
		expect(r2.height).toEqual(10);
	});
	it("check isEqualWith function", function(){
		var rect1 =new dream.geometry.Rect(10, 20, 20, 20);
		var rect2 =new dream.geometry.Rect(11, 20, 20, 20);
		
		var r2 = r.isEqualWith(rect1);
		var r3 = r.isEqualWith(rect2);
		
		expect(r2).toBe(true);
		expect(r3).toBe(false);
	});
	it("check covers function", function(){
		var rect1 =new dream.geometry.Rect(8, 15, 20, 20);
		var rect2 =new dream.geometry.Rect(11, 22, 10, 10);
		
		var r2 = r.covers(rect2);
		var r3 = r.covers(rect1);
		
		expect(r2).toBe(true);
		expect(r3).toBe(false);
	});
	it("check clone function", function(){
		var r2 = r.clone();
		
		expect(r2.left).toEqual(r.left);
		expect(r2.top).toEqual(r.top);
		expect(r2.width).toEqual(r.width);
		expect(r2.height).toEqual(r.height);
		
	});
	it("check add function", function(){
		var rect2 = new dream.geometry.Rect(0, 0, 15, 25);
		
		var r2 = r.add(rect2);
		
		expect(r2.left).toEqual(0);
		expect(r2.top).toEqual(0);
		expect(r2.width).toEqual(30);
		expect(r2.height).toEqual(40);
		
	});
	
	it("check toString function", function(){
		var r1 = r.toString();
		
		expect(r1).toEqual("Rect[10, 20, 20, 20]");
	});
	
 });