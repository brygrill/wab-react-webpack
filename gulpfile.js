const path = require('path');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const del = require('del');
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
  out: `app/widgets/${widgetName}`,
  dist: 'dist',
};

// ------------------------ //
//       BROWSERSYNC
// ------------------------ //
const startServer = done => {
  browserSync.init({
    server: {
      baseDir: paths.app,
    },
    https: true,
  });
  done();
};

// ------------------------ //
//          BABEL
// ------------------------ //
const babel = () => {
  return gulp
    .src(paths.widgetJS)
    .pipe(gulpBabel())
    .pipe(gulp.dest(paths.out))
    .pipe(browserSync.stream());
};

// ------------------------ //
//          WEBPACK
// ------------------------ //
const compile = () => {
  return gulp
    .src(paths.entry)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(paths.out))
    .pipe(browserSync.stream());
  // .pipe(reloadServer);
};

const compileProd = () => {
  return gulp
    .src(paths.entry)
    .pipe(webpack(webpackProdConfig))
    .pipe(gulp.dest(paths.out));
};

// ------------------------ //
//       STATIC FILES
// ------------------------ //
const processStatic = () => {
  return gulp
    .src(paths.static)
    .pipe(gulp.dest(paths.out))
    .pipe(browserSync.stream());
};

// ------------------------ //
//          WATCH
// ------------------------ //
const watch = () => {
  gulp.watch(paths.src, compile);
  gulp.watch(paths.widgetJS, babel);
  gulp.watch(paths.static, processStatic);
};

// ------------------------ //
//          DEPLOY
// ------------------------ //
const clean = () => {
  return del([paths.dist]);
};

const build = () => {
  console.log(path.join(paths.out, '/**/*'));
  console.log(path.join(paths.dist, paths.name));
  return gulp
    .src(paths.out, '/**/*')
    .pipe(gulp.dest(path.join(paths.dist, paths.name)));
};

// ------------------------ //
//          TASKS
// ------------------------ //
const serve = gulp.series(
  gulp.parallel(compile, babel, processStatic),
  startServer,
);
const deploy = gulp.series(
  gulp.parallel(compileProd, babel, processStatic),
  build,
);

const defaultTasks = gulp.parallel(serve, watch);

exports.clean = clean;
exports.compileProd = compileProd;
exports.build = build;
exports.deploy = deploy;
exports.default = defaultTasks;
