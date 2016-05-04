var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var jsdoc = require("gulp-jsdoc3");
var clean = require('gulp-clean');

gulp.task('test', function() {
    return gulp.src(['test/*.js'], {
            read: false
        })
        .pipe(mocha({
            reporter: 'list'
        }))
        .on('error', gutil.log);
});
gulp.task('clean', function () {
  return gulp.src('./docs/**/*.js', {read: false})
    .pipe(clean());
});
gulp.task('docs',['clean'], function (cb) {
    gulp.src(['./src/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});
gulp.task('lint', function() {
    return gulp.src(['./src/*.js', './test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch-lint', function() {
    gulp.watch(['./src/*.js', 'test/**'], ['lint']);
});

gulp.task('default', ['test','lint','docs'], function(done) {
    // place code for your default task here
    gulp.watch(['./src/**/*.js', 'test/*.js'], ['test','lint','docs']);
});