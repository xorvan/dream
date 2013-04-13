var express = require('express')
  , srcSeq = require('./srcSeq')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , appInfo = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8'))
;

module.exports = appInfo;

app.configure(function() {
  var hourMs = 1000*60*60;
  app.set('views', __dirname);
  app.set('view engine', 'jade');
  app.use(express.static(__dirname , { maxAge: hourMs }));
  app.use(express.directory(__dirname, {icons:true} ));
  app.use(express.errorHandler());
});

app.get("/benchs/:name", function (req, res) {
  var name = req.params.name, 
  	scripts = req.query.built != undefined ? 
  			["/build/dream." + appInfo.version + ".min.js"] : 
  			srcSeq.files.map(function(s){return "/"+s;});
  
  res.render('benchs/' + name, {scripts:scripts});
});

app.get("/examples/:name/run", function (req, res) {
	var name = req.params.name, 
	scripts = req.query.built != undefined ? 
			["/build/dream." + appInfo.version + ".min.js"] : 
				srcSeq.files.map(function(s){return "/"+s;});
			
			res.render('examples/' + name+"/index.jade", {scripts:scripts});
});

app.get("/benchs/index", function (req, res) {
	  res.render('benchs/index.jade');
	});

app.listen(8080, function(){
	  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});