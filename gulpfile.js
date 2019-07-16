const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const browserSync = require('browser-sync').create();
const webpackConfig = require('./webpack.config.js');
const webpackProdConfig = require('./webpack.prod.config.js');

const widgetName = 'MyReactWidget';

const paths = {
  name: widgetName,
  app: 'app',
  src: 'src/**/*.*',
  entry: 'src/index.js',
  widgetJS: 'src/Widget.js',
  static: [
    'src/**/*.json',
    'src/**/*.html',
    'src/**/*.jpg',
    'src/**/*.png',
    'src/**/style.css',
    'src/**/strings.js',
  ],
  dest: `app/widgets/${widgetName}`,
  dist: 'dist',
};

// ------------------------ //
//       BROWSERSYNC
// ------------------------ //
const runServer = done => {
  browserSync.init({
    server: {
      baseDir: paths.app,
    },
    https: true,
  });
  done();
};

const reloadServer = done => {
  browserSync.reload({
    stream: true,
  });
  done();
};

// ------------------------ //
//          BABEL
// ------------------------ //
const runBabel = () => {
  return gulp
    .src(paths.widget)
    .pipe(babel())
    .pipe(gulp.dest(paths.dest))
    .pipe(reloadServer);
};

// ------------------------ //
//          WEBPACK
// ------------------------ //
const webpackDev = () => {
  return gulp
    .src(paths.entry)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(paths.dest))
    .pipe(reloadServer);
};

const webpackProd = () => {
  return gulp
    .src(paths.entry)
    .pipe(webpack(webpackProdConfig))
    .pipe(gulp.dest(paths.dest));
};

// ------------------------ //
//       STATIC FILES
// ------------------------ //
const processStatic = () => {
  return gulp
    .src(paths.static)
    .pipe(gulp.dest(paths.dest))
    .pipe(reloadServer);
};

// ------------------------ //
//          WATCH
// ------------------------ //
const watchFiles = () => {
  gulp.watch(paths.src, webpackDev);
  gulp.watch(paths.widgetJS, runBabel);
  gulp.watch(paths.static, processStatic);
};

const serve = gulp.series(compile, startServer);
const watch = gulp.parallel(watchFiles, runServer);

exports.default = watch;

// const defaultTasks = gulp.parallel(serve, watch)
