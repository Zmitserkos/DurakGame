'use strict';

const gulp = require('gulp');
const del = require('del');

const config = require('../config').clean;

gulp.task('clean', function() {
  return del(config.src);
});
