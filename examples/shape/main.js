function init(){
	//importing packages
	var drawing = dream.visual.drawing,
		interpolator = dream.dynamic.interpolator,
		Tween = dream.dynamic.Tween;
	
	
	shapeScreen = new dream.Screen(document.getElementById("mainCanvas"), 320, 240, 1600, 1200);
	
	scene = shapeScreen.scenes.current = new dream.scenery.Scene;
	
	var p1 = scene.assets.add(new drawing.Poly(200,150,100,0));
	//with(p1){
		p1.fillStyle = new drawing.Color("#f00");
		p1.dynamics.add(new Tween({sides:12, "fillStyle.blue":255}, new interpolator.Sine, 700, true)).play();
	
	with(rect1 = scene.assets.add(new drawing.Rect(150,300,150,150), 'rect1')){
		anchorX = anchorY = 75;
		fillStyle = new drawing.LinearGradient([new drawing.ColorStop(0.25, new drawing.Color("#00aaaa")), 
		                                        new drawing.ColorStop(0.75, new drawing.Color("#aa0000"))], 0, 0, 1, 1);
		tr = dynamics.add(new Tween({
			rotation: 180,
			"fillStyle.colorStops[0].position":.5, 
			"fillStyle.colorStops[1].position":.5,
			"fillStyle.colorStops[0].color.red":255,
			"fillStyle.colorStops[1].color.blue":255
		}, new interpolator.Sine, 200,  true)).play();

	};
	p2 = new dream.visual.drawing.Poly(300,70,70,6);
	p2.fillStyle=new dream.visual.drawing.Color(125,125,255,0.8);
	p2.dynamics.add(new Tween({'fillStyle.brightness':0}, new interpolator.Sine, 500,  true)).play();

	//p2.dynamics.add(new dream.visual.animation.Tween({'fillStyle.brightness':0},200,null, true))
	
	
	scene.assets.add(p2, 'p2');
	

	p5 = new drawing.Poly(100,100,80,6);
	p5.strokeStyle = new drawing.Color("#5f6");
	p5.lineStyle = new drawing.LineStyle(5,drawing.LineStyle.Cap.BUTT);
	p5.z = 1;
	
	p5.dynamics.add(new Tween({left: 500, scale: 0.5}, new interpolator.ElasticInOut(1, 0.4).withReverse, 200,  true)).play();
	scene.assets.add(p5, 'p5');
	
	gr1 = new dream.visual.drawing.LinearGradient([new dream.visual.drawing.ColorStop(0.25,"#00aaaa"), new dream.visual.drawing.ColorStop(0.75, "#aa0000")], 0, 0, 0, 1);			
	//p5.fillStyle=gr1;
	//p5.strokeStyle=gr1;
	
	c1 = new dream.visual.drawing.Circle(250,250,60);
	c1.fillStyle = new drawing.LinearGradient([new drawing.ColorStop(0, new drawing.Color("#52a23a")), 
	                                        new drawing.ColorStop(1, new drawing.Color("#e2f29a"))], 0, 0, 1, 0);
	e1 = new dream.visual.drawing.Ellipse(500, 300, 100, 65);
	e1.fillStyle = "#f57";
	e1.dynamics.add(new Tween({radiusX: 250, radiusY: 10}, new interpolator.ElasticOut(1, 0.3).withReverse, 300,  true)).play();
	scene.assets.add(e1);
	
	scene.assets.add(c1);
	
	//e1=new dream.visual.drawing.Ellipse(200,10,60,100);
	//e1.fillStyle="#aa5";
	//scene.assets.add(e1);
	
	cs1 = new dream.visual.drawing.CircleSlice(500,90,70,0);
	cs1.fillStyle = "#49f";
	cs1.strokeStyle = "#658";
	cs1.dynamics.add(new Tween({angle:360}, null, 200, true)).play();
	cs1.fillStyle = new dream.visual.drawing.Color("#49f")
	cs1.fillStyle.hue=355;
	cs1.dynamics.add(new Tween({'fillStyle.hue':0},null, 500, true)).play();
	scene.assets.add(cs1);
	
	cc=new dream.visual.drawing.Circle(0,0,40);
	cc.scaleX = 2;
	cc.rotation = 45;
	cs1.mask = cc;
	
	
	s1=new dream.visual.drawing.Star(430,175,50,50,5);
	s1.fillStyle = new drawing.RadialGradient([new drawing.ColorStop(0, new drawing.Color("#8b0596")), 
		                                        new drawing.ColorStop(1, new drawing.Color("#Eb55F9"))], .5, .5, 0, .5, .5, .4);
	s1.strokeStyle = "#8b0596";
	s1.dynamics.add(new Tween({radius:125, rotation:90}, new interpolator.Sine, 300, true)).play();
	scene.assets.add(s1);
	
	//some text
	
	t1=new dream.visual.drawing.Text(550,20,"salam mehdi")
	scene.assets.add(t1);
	
	//Stats.js
	stats=new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';
	document.body.appendChild(stats.getDomElement() );
	var stp=new dream.dynamic.Dynamic(function(){stats.update();});
	scene.dynamics.add(stp).play();
}