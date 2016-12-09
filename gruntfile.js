module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            "docs/*"
          ]
        }]
      }
    },
    copy: {
      build: {
        files: [{
          expand: true,
          dot: true,
          cwd: "app",
          src: [
            "assets/**/*",
            "js/scripts/timbre.js"
          ],
          dest: "docs"
        }]
      }
    },
//    browserify: {
//      dist: {
//        files: {
//          'build/js/main.js': ['app/js/main.js']
//        },
//        options: {
//          // transform: [
//          //   function(file) {
//          //     return stringify({extensions: ['.obj']}).call(stringify, file);
//          //   }
//          // ]
//          transform: [
//            [
//              'stringify',
//              {
//                appliesTo: { includeExtensions: [ '.obj' ] }
//              }
//            ]
//          ]
//        }
//      }
//    },
    jade: {
      compile: {
        options: {
          data: {
            debug: false,
            page: "main"
          }
        },
        files: {
          "docs/index.html": "app/views/main.jade"
        }
      }
    },
    stylus: {
      compile: {
        options: {
          paths: ['public/css/main.styl'],
          use: [
            require('nib') // use stylus plugin at compile time
          ]
        },
        files: {
          'docs/css/main.css': 'app/css/main.styl'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-browserify');

  // Build Tasks
  grunt.registerTask('build', [
    'clean',
    'copy',
    'jade',
    //'browserify',
    'stylus'
  ]);
};
