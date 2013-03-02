(function(){

var Probe = function(id){
	this.id = id;
	this.min = undefined;
	this.max = 0;
	this.avg = 0;
	this.cnt = 0;
};

var $ = Probe.prototype;

$.inc = function(){
	this.cnt++;
};
$.dec = function(){
	this.cnt--;
};

$.set = function(val){
	this.cnt = val;
};

$.update = function(){
	if(this.min == undefined)
		this.min = this.cnt;
	this.max = Math.max(this.max, this.cnt);
	this.min = Math.min(this.min, this.cnt);
};

$.toString = function(){
	return this.id + ":  " + this.cnt+" ("+this.min+"-"+this.max+")";
};

var Stat = function(){
	this.probes = new dream.collection.Dict;
	this.element = window.document.createElement("div");
	var self = this;
	window.setInterval(function(){
		var probe, div;
		self.element.innerHTML = "";
		for (var i=0; i < self.probes.length; i++){
			probe = self.probes[i];
			probe.cnt *= 5;
			probe.update();
			div = window.document.createElement("div");
			div.style.color = "blue";
			div.innerHTML = probe+"";
			self.element.appendChild(div);
			probe.cnt = 0;
		};
	},200);
};

var $ = Stat.prototype;

$.update = function(){
	var probe, div;
	this.element.innerHTML = "";
	for (var i=0; i < this.probes.length; i++){
		probe = this.probes[i];
		probe.update();
		div = window.document.createElement("div");
		div.style.color = "blue";
		div.innerHTML = probe+"";
		this.element.appendChild(div);
	};
		
	
};
	
//export

dream.bench = {};
	

dream.bench.Stat = Stat;
dream.bench.Probe = Probe;
	
})();







