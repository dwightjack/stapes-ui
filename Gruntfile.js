/*jshint node:true */

module.exports = function(grunt) {
	'use strict';

	require('load-grunt-tasks')(grunt);


	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// Project configuration.
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= pkg.license %> */<%= "\\n" %>'
		},

		clean: {
			dist: ['dist']
		},

		concat: {
			options: {
				stripBanners: false
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.js' : ['src/intro.js','src/core.js', 'src/sandbox.js', 'src/module.js', 'src/outro.js']
				}
			}
		},

		uglify: {
			options: {
				preserveComments: 'some',
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
				}
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['src/**/*.js', 'test/**/*.js', '!src/{ou,in}tro.js']
		},

		jasmine: {
			test: {
				src: ['dist/**/*.js', '!dist/**/*.min.js'],
				options: {
					specs: 'test/*.spec.js',
					vendor: [
						'bower_components/jquery/dist/jquery.js',
						'bower_components/stapes/stapes.js',
						'bower_components/jasmine-jquery/lib/jasmine-jquery.js'
					]
				}
			}
		},

		watch: {
			src: {
				files: '<%= jshint.files %>',
				tasks: ['dev']
			}
		}

	});

	grunt.registerTask('dev', ['clean', 'jshint', 'concat', 'jasmine:test']);

	grunt.registerTask('dist', ['dev', 'uglify']);

	// Default task.
	grunt.registerTask('default', ['dist']);

};
