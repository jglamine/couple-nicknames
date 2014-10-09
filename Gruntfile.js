/*!
 * FireShell Gruntfile
 * http://getfireshell.com
 * @author Todd Motto
 */

'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

/**
 * Grunt module
 */
module.exports = function (grunt) {

  /**
   * Dynamically load npm tasks
   */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  /**
   * FireShell Grunt config
   */
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    /**
     * Set project info
     */
    project: {
      src: 'src',
      app: 'app',
      assets: '<%= project.app %>/assets',
      css: [
        '<%= project.src %>/scss/style.scss'
      ],
      js: [
        '<%= project.src %>/js/*.js'
      ]
    },

    /**
     * Connect port/livereload
     * https://github.com/gruntjs/grunt-contrib-connect
     * Starts a local webserver and injects
     * livereload snippet
     */
    connect: {
      livereload: {
        options: {
          port: 9000,
          hostname: '*',
          middleware: function (connect) {
            return [lrSnippet, mountFolder(connect, 'app')];
          }
        }
      },
      dist: {
        options: {
          port: 9001,
          hostname: '*',
          keepalive: true,
          middleware: function (connect) {
            return [mountFolder(connect, 'dist')];
          }
        }
      }
    },

    /**
     * Clean files and folders
     * https://github.com/gruntjs/grunt-contrib-clean
     * Remove generated files for clean deploy
     */
    clean: {
      dist: [
        '<%= project.assets %>/css/style.unprefixed.css',
        '<%= project.assets %>/css/style.prefixed.css'
      ]
    },

    /**
     * JSHint
     * https://github.com/gruntjs/grunt-contrib-jshint
     * Manage the options inside .jshintrc file
     */
    jshint: {
      files: [
        //'src/js/*.js',
        'Gruntfile.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /**
     * Concatenate JavaScript files
     * https://github.com/gruntjs/grunt-contrib-concat
     * Imports all .js files
     */
    concat: {
      dev: {
        files: {
          '<%= project.assets %>/js/scripts.min.js': '<%= project.js %>'
        }
      },
      options: {
        stripBanners: true,
        nonull: true
      }
    },

    copy: {
      html: {
        src: '<%= project.app %>/index.html',
        dest: 'dist/index.html'
      },
      icon: {
        src: '<%= project.app %>/favicon.ico',
        dest: 'dist/favicon.ico'
      },
      handlebars: {
        src: '<%= project.src %>/components/handlebars/handlebars.runtime.js',
        dest: '<%= project.assets %>/components/handlebars.runtime.js'
      },
    },

    /**
     * Uglify (minify) JavaScript files
     * https://github.com/gruntjs/grunt-contrib-uglify
     * Compresses and minifies all JavaScript files into one
     */
    uglify: {
      dist: {
        files: {
          '<%= project.assets %>/js/scripts.min.js': '<%= project.js %>'
        }
      }
    },

    handlebars: {
      compile: {
        options: {
          namespace: 'Handlebars.templates'
        },
        files: {
          '<%= project.assets %>/js/templates.js': '<%= project.src %>/templates/*.hbs'
        }
      }
    },

    /**
     * Compile Sass/SCSS files
     * https://github.com/gruntjs/grunt-contrib-sass
     * Compiles all Sass/SCSS files
     */
    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          '<%= project.assets %>/css/style.unprefixed.css': '<%= project.css %>'
        }
      },
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          '<%= project.assets %>/css/style.unprefixed.css': '<%= project.css %>'
        }
      }
    },

    useminPrepare: {
      html: '<%= project.app %>/index.html',
      options: {
        dest: 'dist'
      }
    },

    usemin: {
      html: 'dist/index.html'
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },

    /**
     * Autoprefixer
     * Adds vendor prefixes automatically
     * https://github.com/nDmitry/grunt-autoprefixer
     */
    autoprefixer: {
      options: {
        browsers: [
          'last 2 version',
          'safari 6',
          'ie 9',
          'opera 12.1',
          'ios 6',
          'android 4'
        ]
      },
      dev: {
        files: {
          '<%= project.assets %>/css/style.min.css': ['<%= project.assets %>/css/style.unprefixed.css']
        }
      },
      dist: {
        files: {
          '<%= project.assets %>/css/style.prefixed.css': ['<%= project.assets %>/css/style.unprefixed.css']
        }
      }
    },

    /**
     * Build bower components
     */
    bower: {
      dev: {
        dest: '<%= project.assets %>/components/'
      }
    },

    /**
     * Opens the web server in the browser
     * https://github.com/jsoverson/grunt-open
     */
    open: {
      server: {
        path: 'http://localhost:<%= connect.livereload.options.port %>'
      }
    },

    /**
     * Runs tasks against changed watched files
     * https://github.com/gruntjs/grunt-contrib-watch
     * Watching development files and run concat/compile tasks
     * Livereload the browser once complete
     */
    watch: {
      handlebars: {
        files: '<%= project.src %>/templates/*.hbs',
        tasks: ['handlebars:compile']
      },
      concat: {
        files: '<%= project.src %>/js/{,*/}*.js',
        tasks: ['concat:dev', 'jshint']
      },
      sass: {
        files: '<%= project.src %>/scss/{,*/}*.{scss,sass}',
        tasks: ['sass:dev', 'autoprefixer:dev']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= project.app %>/{,*/}*.html',
          '<%= project.assets %>/css/*.css',
          '<%= project.assets %>/js/{,*/}*.js',
          '<%= project.assets %>/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }
  });

  /**
   * Default task
   * Run `grunt` on the command line
   */
  grunt.registerTask('default', [
    'sass:dev',
    'bower:dev',
    'copy:handlebars',
    'autoprefixer:dev',
    'jshint',
    'concat:dev',
    'handlebars:compile',
    'connect:livereload',
    'open:server',
    'watch'
  ]);

  /**
   * Build task
   * Run `grunt build` on the command line
   * Then compress all JS/CSS files
   */
  grunt.registerTask('build', [
    'copy:html',
    'copy:icon',
    'sass:dist',
    'bower:dev',
    'copy:handlebars',
    'autoprefixer:dist',
    'clean:dist',
    'handlebars:compile',
    //'jshint',
    'useminPrepare',
    'concat',
    'uglify',
    'cssmin',
    'usemin',
    'htmlmin:dist'
  ]);

};
