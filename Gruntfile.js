var project = require('./package'),
    stringify = require('stringify'),
    colors = require('colors');

module.exports = function(grunt) {

  var config = {

    // expose for templating
    project: project,

    // Browserify
    // ----------
    // Concatenates all of our JS files
    // and allows to use node style
    // CommonJS modules, using `require()`.
    browserify: {

      dev: {
        options: {
          // this option creates
          // source maps for your
          // code.
          debug: true,
          transform: ['reactify']
        },

        src: 'app/scripts/app.jsx',
        dest: 'static/assets/js/<%= project.name %>.js'
      },

      prod: {
        src: 'app/scripts/app.jsx',
        dest: 'static/assets/js/<%= project.name %>.min.js',
        options: {
          transform: ['reactify', 'uglifyify']
        }
      }
    },

    // SASS
    // ----
    // Allows us to write SCSS rather
    // than regular CSS. Concatenates
    // our files using `import`.
    sass: {
      dev: {
        files: [{
          // Destination                               Source
          'static/assets/css/<%= project.name %>.css': 'app/styles/index.scss'
        }],
        options: {
          debug: true
        }
      },
      prod: {
        files: [{
          // Destination                               Source
          'static/assets/css/<%= project.name %>.css': 'app/styles/index.scss'
        }]
      }
    },


    // Watch
    // -----
    // Constantly observes files for
    // changes and executes other tasks
    // when they change.
    watch: {
      js: {
        files: 'app/scripts/**/*.js*',
        tasks: ['browserify:dev'],
        options: {
          livereload: true
        }
      },
      scss: {
        files: 'app/styles/**/*.scss',
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['static/**/*.html'],
        options: {
          livereload: true
        }
      }
    },

    // HTTP Server
    // -----------
    // Lightweight HTTP server that
    // acts as a dev-ready
    // way to serve your static files.
    'http-server': {
      dev: {
        root: './static',
        port: 4242,
        host: 'localhost',
        // This enables `watch` to work
        runInBackground: true
      }
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-notify');

  grunt.registerTask('dev', ['browserify:dev', 'sass:dev']);
  grunt.registerTask('prod', ['browserify:prod', 'sass:prod']);
  grunt.registerTask('default', ['http-server', 'dev', 'watch']);

  // Output a display message to remind
  // the developer of which mode they are in
  var status = {
    dev: [project.name, ':development'.green].join(''),
    prod: [project.name, ':production'.red].join(''),
  };

  var task = grunt.cli.tasks[0];
  console.log('\n' + (status[task] || status.dev) + '\n');
};

