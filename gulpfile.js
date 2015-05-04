'use strict'

/******************************* Dependencies ********************************/

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

/*********************************** Tasks ***********************************/

gulp.task('build', function() {
  return gulp.src(['src/**/*.ts', '!**/*.d.ts'])
    // Proper stack printing.
    .pipe($.plumber(function(error) {
      console.log(error.stack || error.message || error)
      console.log('\x07')
    }))
    .pipe($.babel({stage: 0, modules: 'common'}))
    .pipe(gulp.dest('lib'))
})

gulp.task('watch', ['build'], function() {
  $.watch('src/**/*.ts', function() {return gulp.start('build')})
})

gulp.task('default', ['watch'])
