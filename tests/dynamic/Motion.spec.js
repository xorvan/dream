describe("Motion", function(){
	
	var motion = new dream.dynamic.Motion("left", 10, 2);
	
	var obj = new dream.visual.Graphic;
	
	obj.left = 0;
	obj.dynamics.add(motion).play();
	
	it("should add velocity to prop and add acceleration to velocity after first run", function(){
		obj.step();
		expect(obj.left).toEqual(10);
		expect(motion.velocity).toEqual(12);
	});

});