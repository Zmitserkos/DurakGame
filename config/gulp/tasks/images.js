'use strict';

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

const config = require('../config').images;

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('images', function() {
  return gulp.src(config.src)
    .pipe(gulpIf(!isDevelopment, imagemin(config.imagemin([pngquant()]))))
    .pipe(gulp.dest(config.dest));
});
