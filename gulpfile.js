'use strict';

/**
 * Requires gulp 4.0:
 *   "gulp": "git://github.com/gulpjs/gulp#4.0"
 */

/******************************* Dependencies ********************************/

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

/*********************************** Tasks ***********************************/

gulp.task('clear', function(done) {
  del(['lib', 'dist'], function(_) {done()});
});

gulp.task('compile', function() {
  return gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
    .pipe($.typescript({
      target: 'ES5',
      module: 'commonjs',
      noExternalResolve: true
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('bundle', function() {
  return browserify({standalone: 'ng-decorate'})
    .add('lib/index')
    .bundle()
    .pipe(source('ng-decorate.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series('clear', 'compile', 'bundle'));

gulp.task('watch', function() {
  $.watch('src/**/*.ts', gulp.series('build'));
  $.watch('typings/**/*.ts', gulp.series('build'));
});

gulp.task('default', gulp.series('build', 'watch'));
