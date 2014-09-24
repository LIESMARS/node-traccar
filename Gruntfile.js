module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['traccar.js', 'config.js', 'mongodbhandler.js', 'postgishandler.js', 'redishandler.js', 'sqlclientfactory.js', 'utility.js']
    },
    uglify: {
      options: {
        banner: '// <%= pkg.name %>.js - v<%= pkg.version %>\n' +
                '// (c) 2014 Casey Thomas, MIT License \n'
      },
      dist: {
        files: {
          'traccar.min.js': ['<banner>', 'traccar.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('all', ['jshint', 'uglify']);
  grunt.registerTask('default', ['jshint', 'uglify']);
};