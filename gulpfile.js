'use strict'

/******************************* Dependencies ********************************/

var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var del = require('del')

/*********************************** Tasks ***********************************/

gulp.task('clear', function(done) {
  del('lib', done)
})

gulp.task('build', ['clear'], function() {
  return gulp.src(['src/**/*.ts', '!**/*.d.ts'])
    .pipe($.babel({modules: 'system'}))
    .pipe(gulp.dest('lib'))
})

gulp.task('watch', ['build'], function() {
  $.watch('src/**/*.ts', function() {return gulp.start('build')})
})

gulp.task('default', ['watch'])
