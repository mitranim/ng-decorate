'use strict';

/******************************* Dependencies ********************************/

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

/*********************************** Tasks ***********************************/

gulp.task('clear', function(done) {
  del('.tmp', done);
});

gulp.task('compile', ['clear'], function() {
  return gulp.src(['src/**/*.ts', 'def/**/*.ts', 'typings/**/*.ts'])
    .pipe($.plumber())
    .pipe($.typescript({
      typescript: require('typescript'),
      target: 'ES5',
      module: 'commonjs',
      noExternalResolve: true,
      experimentalDecorators: true
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('build', ['compile'], function() {
  return browserify({standalone: 'ng-decorate'})
    .add('.tmp/index')
    .bundle()
    .pipe(source('ng-decorate.js'))
    .pipe(gulp.dest('lib'));
});

gulp.task('watch', ['build'], function() {
  $.watch('**/*.ts', function() {return gulp.start('build')});
});

gulp.task('default', ['watch']);
