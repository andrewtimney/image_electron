var gulp = require('gulp');
var babel = require("gulp-babel");

gulp.task("default", function () {
  return gulp.src("views/**/**.jsx")
    .pipe(babel())
    .pipe(gulp.dest("views/build"));
});