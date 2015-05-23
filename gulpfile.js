'use strict';

/******************************* Dependencies ********************************/

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

/*********************************** Tasks ***********************************/

gulp.task('clear', function(done) {
  del('lib', done);
});

gulp.task('build', ['clear'], function() {
  var filter = $.filter('**/index.js');

  return gulp.src(['src/**/*.ts', 'def/**/*.ts', 'typings/**/*.ts'])
    .pipe($.plumber(function(error) {
      console.log(error.stack || error.message || error);
      console.log('\x07');
    }))
    .pipe($.typescript({
      typescript: require('typescript'),
      target: 'ES5',
      module: 'commonjs',
      noExternalResolve: true
    }))
    .pipe(filter)
    // Allow SystemJS to consume our named exports the ES6 way.
    .pipe($.replace(/$/,
      "\nObject.defineProperty(exports, '__esModule', {\n" +
      "  value: true\n" +
      "});\n"
    ))
    .pipe(filter.restore())
    .pipe(gulp.dest('lib'));
});

gulp.task('watch', ['build'], function() {
  $.watch('**/*.ts', function() {return gulp.start('build')});
});

gulp.task('default', ['watch']);
