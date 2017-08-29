'use strict';

const gulp = require('gulp');

const config = require('../config').faviconCopy;

gulp.task('favicon:copy', function () {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest));
});
