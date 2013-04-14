function init(){
	//importing packages
	var drawing = dream.visual.drawing,
		interpolator = dream.dynamic.interpolator,
		Tween = dream.dynamic.Tween;
	
	
	pathScreen = new dream.Screen(document.getElementById("mainCanvas"), 320, 240, 1600, 1200);
	
	scene = pathScreen.scenes.current = new dream.scenery.Scene;
	
	// s2 = "M20,10 L 100 50 L 150 120 Z"
	s= "M -30,20  Q 120 0 110 60 T 220 70 T 270 40 C 299 -20 310 90 335 31 S 400 30 400 60 z";
	pp = new dream.geometry.Path(s);
	// L 150 90 Z M 20,20

	p2 = new dream.visual.drawing.Poly(300,70,70,6);
	p2.fillStyle=new dream.visual.drawing.Color(125,125,255,0.8);
	p2.dynamics.add(new Tween({'fillStyle.brightness':0}, new interpolator.Sine, 500,  true)).play();
	scene.assets.add(p2, 'p2');	
	fr = new drawing.Freehand(200, 200, pp);
//	fr.dynamics.add(new Tween({
//		'$path.segments.last.previous.cp1.top':300,
//		'$path.segments.last.previous.cp1.left':100,
//		'$path.segments.last.previous.cp2.left':100,
//		'$path.segments.last.previous.cp2.top':-300,
//		'$path.segments.last.previous.previous.dest.left':+100
//		}, new interpolator.Sine, 100, true)).play();
	fr.lineStyle = new drawing.LineStyle(3);
	fr.strokeStyle="#f4f";
	//fr.fillStyle="#359";
	scene.assets.add(fr);
	
	c =new  drawing.Circle(200,200, 5);
	c.fillStyle = "#45f";
			
	scene.assets.add(c);
	
	c.dynamics.add(new dream.dynamic.PathTween(pp, new dream.transform.Translation(fr.origin.left, fr.origin.top), 0, 1, null,  180, true, 1),"pth").play();
	
	// adding segment
	aa=new dream.geometry.pathSegment.QuadraticBezier(120,10,130,30);
	pp.segments.insertAt(2, aa);
	
	
	loglength = function(stp){
		var stp = stp || 0.01;
	//pp.segments.at(1).getLength(stp);pp.segments.at(2).getLength(stp);pp.segments.at(3).getLength(stp);
	console.log(pp.segments.at(1).getLength(stp),pp.segments.at(2).getLength(stp),pp.segments.at(3).getLength(stp));
	};
	//Stats.js
	stats=new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';
	document.body.appendChild(stats.getDomElement() );
	var stp=new dream.dynamic.Dynamic(function(){stats.update();});
	scene.dynamics.add(stp).play();
	
}