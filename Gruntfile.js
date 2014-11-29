module.exports = function(grunt) {
  var srcSeq = require("./srcSeq").files;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %>  <%= pkg.version %>  <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: srcSeq,
        dest: 'build/dream.min.js'
      }
    },
	
	jshint: {
	options: {
		"undef": true,
		"unused": true,
		"asi": true,
      },
    files: ['src/**/*.js', 'tests/**/*.js', 'examples/**/*.js']
  },
  
   yuidoc: {
    compile: {
      name: '<%= pkg.name %>',
      description: '<%= pkg.description %>',
      version: '<%= pkg.version %>',
      url: '<%= pkg.homepage %>',
      options: {
        paths: 'src',
        outdir: 'doc'
      }
    }
  },
	
	jasmine: {
    pivotal: {
      src: srcSeq,
      options: {
        specs: 'tests/**/*.spec.js',
      //  helpers: 'tests/*Helper.js'
      }
    }
  }
	
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('doc', ['yuidoc']);
  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['test', 'build', 'doc']);
};