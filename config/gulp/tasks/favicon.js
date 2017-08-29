'use strict';

const gulp = require('gulp');
const favicons = require("gulp-favicons");
const path = require('path');

const config = require('../config').favicon;

gulp.task('favicon', function () {
  return gulp.src(path.resolve(config.src))
    .pipe(favicons(config.favicons))
    .pipe(gulp.dest(path.resolve(config.dest)));
});
