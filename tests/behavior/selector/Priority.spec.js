describe("PrioritySelector", function(){
	var bt = dream.behavior;
	
	var enemyIsNear = false,
	dragon = jasmine.createSpyObj('dragon', ['defend', 'chooseCastle', 'flyToCastle', 'lootCastle', 'returnHome']);;
	
	var tree = new bt.selector.Priority;
	
	var defense = new bt.selector.Sequence;
	defense.actions.add(new bt.Condition(function(){
		return enemyIsNear;
	}));
	defense.actions.add(new bt.Action(function(){
		dragon.distance = 10;
		dragon.defend();
		enemyIsNear = false;
		return true;
	}));
	
	var attack = new bt.selector.Sequence, flyAction;
	attack.actions.add(new bt.Action(function(){ dragon.chooseCastle(); this.distance = 10; return true;}));
	attack.actions.add(flyAction = new bt.Action(function(){ dragon.flyToCastle(); this.distance--; if(this.distance <=0) return true;}));
	attack.actions.add(new bt.Action(function(){ dragon.lootCastle(); return true;}));
	attack.actions.add(new bt.Action(function(){ dragon.returnHome(); return true;}));
	
	
	tree.actions.add(defense);
	tree.actions.add(attack);
	
	tree.init(dragon);
	
	it("should make dragon to choose a castle to loot, after 1 step", function(){

		spyOn(defense, 'step').andCallThrough();
		spyOn(defense.actions[0], 'step').andCallThrough();
		spyOn(defense.actions[1], 'step').andCallThrough();
		
		spyOn(attack, 'step').andCallThrough();
		spyOn(attack.actions[0], 'step').andCallThrough();
		
		tree.step();
		expect(defense.step).toHaveBeenCalled();
		expect(defense.actions[0].step).toHaveBeenCalled();
		expect(defense.actions[1].step).not.toHaveBeenCalled();
		
		expect(attack.step).toHaveBeenCalled();
		expect(attack.actions[0].step).toHaveBeenCalled();

		expect(dragon.defend.calls.length).toEqual(0);
		expect(dragon.chooseCastle.calls.length).toEqual(1);
		expect(dragon.flyToCastle.calls.length).toEqual(1);
		expect(attack.current).toEqual(flyAction);
		expect(dragon.lootCastle).not.toHaveBeenCalled();
		
		expect(dragon.distance).toEqual(9);
		
	});
	
	it("should make dragon to continue fly, after 2 step", function(){
		
		spyOn(defense, 'step').andCallThrough();
		
		tree.step();
		expect(defense.step).not.toHaveBeenCalled();
		
		
		expect(dragon.defend.calls.length).toEqual(0);
		expect(dragon.chooseCastle.calls.length).toEqual(1);
		expect(dragon.flyToCastle.calls.length).toEqual(2);
		expect(attack.current).toEqual(flyAction);
		expect(dragon.lootCastle).not.toHaveBeenCalled();
		
	});
	
	it("should not make dragon to defend if enemy arrives after 2 step", function(){
		enemyIsNear = true;
		tree.step();
		
		expect(dragon.defend.calls.length).toEqual(0);
		expect(dragon.chooseCastle.calls.length).toEqual(1);
		expect(dragon.flyToCastle.calls.length).toEqual(3);
		expect(attack.current).toEqual(flyAction);
		expect(dragon.lootCastle).not.toHaveBeenCalled();
		
	});
});