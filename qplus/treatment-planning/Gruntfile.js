module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'requestWebsite/public/listener.js', 'main.js','server.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          style: 'expanded'
        },
        files: {                         // Dictionary of files
          'requestWebsite/public/styles/styles.css': 'requestWebsite/public/styles.scss'       // 'destination': 'source'
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true
        },
        src: ['test/**/*.js']
      },
    },
    watch: {
      css: {
				files: 'requestWebsite/public/*.scss',
				tasks: ['sass'],
        options: {
          livereload: true,
        }
			},
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });
grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['watch']);

};
