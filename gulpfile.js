/* eslint-disable arrow-body-style */
const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const browserSync = require('browser-sync').create();
const webpackConfig = require('./webpack.config.js');
const webpackProdConfig = require('./webpack.prod.config.js');

const PATHS = {
  name: 'MyReactWidget',
  app: 'app',
  src: 'src/**/*.*',
  entry: 'src/index.js',
  widget: 'src/Widget.js',
  other: [
    'src/**/*.json',
    'src/**/*.html',
    'src/**/*.jpg',
    'src/**/*.png',
    'src/**/style.css',
    'src/**/strings.js',
  ],
  dest: 'app/widgets/MyReactWidget',
  dist: 'dist',
};

// ------------------------ //
//          BABEL
// ------------------------ //
gulp.task('babel', () => {
  return gulp
    .src(PATHS.widget)
    .pipe(babel())
    .pipe(gulp.dest(PATHS.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
});

// ------------------------ //
//         WEBPACK
// ------------------------ //
gulp.task('webpack', () => {
  return gulp
    .src(PATHS.entry)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(PATHS.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
});

gulp.task('webpack-prod', () => {
  return gulp
    .src(PATHS.entry)
    .pipe(webpack(webpackProdConfig))
    .pipe(gulp.dest(PATHS.dest));
});

// ------------------------ //
//        GULP TASKS
// ------------------------ //
gulp.task('other-files', () => {
  return gulp
    .src(PATHS.other)
    .pipe(gulp.dest(PATHS.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
});

// Local Server
gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: PATHS.app,
    },
    https: true,
  });
});

// Copy widget folders to dist
gulp.task('deploy', ['webpack-prod', 'babel', 'other-files'], () => {
  return gulp
    .src(path.join(PATHS.dest, '/**/*'))
    .pipe(gulp.dest(path.join(PATHS.dist, PATHS.name)));
});

// Launch Server and Watch for file changes
gulp.task('default', ['browserSync', 'webpack', 'babel', 'other-files'], () => {
  gulp.watch(PATHS.src, ['webpack']);
  gulp.watch(PATHS.widget, ['babel']);
  gulp.watch(PATHS.other, ['other-files']);
});
