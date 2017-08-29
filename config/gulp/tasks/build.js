'use strict';

const gulp = require('gulp');

gulp.task('build', [/*'clean',*/ 'favicon:copy', 'images', 'styles', 'scripts']);
