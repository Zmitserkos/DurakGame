'use strict';

const gulp = require('gulp');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const uglify = require('gulp-uglify');

const config = require('../config').scripts;
const webpackConfig = require('../../../webpack.config.js');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('scripts', function() {
  return gulp.src(config.src)
    .pipe(webpackStream(webpackConfig), webpack)
    //.pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulp.dest(config.dest));
});
