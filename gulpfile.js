var gulp = require('gulp');
var babel = require("gulp-babel");
var runElectron = require("gulp-run-electron");

gulp.task("babel", function () {
  return gulp.src("views/**/**.jsx")
    .pipe(babel())
    .pipe(gulp.dest("views/build"));
});

gulp.task('default', ['babel'], function(){
  gulp.src(".")
    .pipe(runElectron([], {}));
});