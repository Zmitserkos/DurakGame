'use strict';

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const shorthand = require('gulp-shorthand');
const cssnano = require('gulp-cssnano');

const config = require('../config').styles;

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('styles', function() {
  return gulp.src(config.src)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer(config.autoprefixer))
    .pipe(gulpIf(!isDevelopment, shorthand()))
    .pipe(gulpIf(!isDevelopment, cssnano()))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.dest));
});
