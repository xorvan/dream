function init(){
	//importing packages
	var drawing = dream.visual.drawing,
		filter = dream.visual.filter,
		Bitmap = dream.visual.Bitmap,
		interpolator = dream.behavior.animation.interpolator,
		Tween = dream.behavior.animation.Tween;
	
	
	filterScreen = new dream.Screen(document.getElementById("mainCanvas"), 320, 240, 1600, 1200);
	
	scene = new dream.scenery.Scene;
	
	b1=new Bitmap("pic1.jpg", 100, 40, 400, 350);
	
	blur =  new filter.Blur(5);
	mosaic  =  new filter.Mosaic
	coloradj = new filter.ColorAdjust(null, 100);
	
//	b1.filters.add(blur,"blur");
	b1.filters.add(mosaic,"mosaic");
	b1.filters.add(coloradj);
	dyn1=new Tween({'filters[0].amount' : 50}, 200);
	//b1.behavior.actions.add(dyn1);
	
	p1=new drawing.Circle(720,100,60);
	p1.fillStyle = "#f00";
	scene.assets.addArray([b1, p1]);
	
	filterScreen.scenes.current = scene;
	
	
	//Stats.js
	stats=new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';
	document.body.appendChild(stats.getDomElement() );
	var stp=new dream.behavior.Action(function(){stats.update();});
	scene.behavior.actions.add(stp);
	
}