var gulp = require('gulp');
var exec = require('child_process').exec;
var $ = require('gulp-load-plugins')({
  replaceString: /^gulp(-|\.)([0-9]+)?/
});

const fs          = require('fs');
const del         = require('del');
const path        = require('path');
const mkdirp      = require('mkdirp');
const isparta     = require('isparta');
const rollup      = require('rollup');

const manifest          = require('./package.json');
const config            = manifest.taskConfig;
const threshold         = manifest.threshold;
const mainFile          = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName    = path.basename(mainFile, '.min.js');

const assetSrc          = config.assetSrc;
const assetDest         = config.assetDest;
const pluginSrc         = config.pluginSrc;
const pluginDest        = config.pluginDest;
const srcPath           = 'src/**/*.js';
const testPath          = 'test/**/*.spec.js';
const srcPluginPath     = 'plugins/**/*.plugin.js';
const testPluginPath    = 'plugins/**/*.spec.js';
const setupPath         = 'test/setup/node.js';
const watchPath         = [srcPath, 'src/assets/*', 'test/**/*.js'];

function test() {
  return gulp.src([setupPath, testPath, testPluginPath], {read: false})
    .pipe($.plumber())
    .pipe($.mocha({globals: config.mochaGlobals}));
}

// Remove the build files
gulp.task('clean', function(cb) {
  del([destinationFolder], cb);
});

// Remove our temporary files
gulp.task('clean:tmp', function(cb) {
  del(['tmp'], cb);
});

// Lint our source code
gulp.task('lint:src', function() {
  return gulp.src([srcPath, srcPluginPath])
    .pipe($.plumber())
    .pipe($.eslint({
      configFile: './.eslintrc',
      envs: [
        'node'
      ]
    }))
    .pipe($.eslint.formatEach('stylish', process.stderr))
    .pipe($.eslint.failOnError());
});

// Lint our test code
gulp.task('lint:test', function() {
  return gulp.src([testPath, testPluginPath])
    .pipe($.plumber())
    .pipe($.eslint({
      configFile: './test/.eslintrc',
      envs: [
        'node'
      ]
    }))
    .pipe($.eslint.formatEach('stylish', process.stderr))
    .pipe($.eslint.failOnError());
});

gulp.task('assets', ['clean'], function () {
  return gulp.src([assetSrc + '/**/*'], { "base" : assetSrc})
    .pipe(gulp.dest(assetDest));
});

gulp.task('plugins', ['clean'], function () {
  return gulp.src([pluginSrc + '/**/*'], { "base" : pluginSrc})
    .pipe($.rename({extname: '.min.js'}))
    .pipe($.uglify())
    .pipe(gulp.dest(pluginDest));
});

// Build two versions of the library
gulp.task('build', ['lint:src', 'clean', 'assets', 'plugins'], function(done) {
  mkdirp.sync(destinationFolder);
  rollup.rollup({
    entry: config.entryFileName + '.js',
    external: ['jade', 'fs-extra', 'babel-runtime']
  }).then(function(bundle) {
    var res = bundle.generate({
      sourceMap: 'inline',
      sourceMapFile: exportFileName + '.js',
      format: 'umd',
      moduleName: config.exportVarName
    });

    $.file(exportFileName + '.js', res.code, { src: true })
      .pipe($.plumber())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.babel({ blacklist: ['useStrict'], optional: ['runtime'] }))
      .pipe($.rename(exportFileName + '.min.js'))
      .pipe($.uglify())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .on('end', done);
  });
});

gulp.task('coverage', ['lint:src', 'lint:test'], function(done) {
  require('babel/register')({ modules: 'common' });
  gulp.src([srcPath, srcPluginPath])
    .pipe($.plumber())
    .pipe($.istanbul({ instrumenter: isparta.Instrumenter, includeUntested: true }))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
      .pipe($.istanbul.writeReports())
      .on('end', done);
    });
});

// Lint and run our tests
gulp.task('test', ['lint:src', 'lint:test'], function() {
  require('babel/register')({ modules: 'common' });
  return test();
});

// Just run the tests without lint
gulp.task('mocha', function() {
  require('babel/register')({ modules: 'common' });
  return test();
});

// Make demo
gulp.task('demo', ['build', 'demo:frameset', 'demo:serve', 'demo:watch'], function (done) {
  exec('./bin/spectreport -j test/setup/fixtures -o ./demo/test.html', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
});

// Many CI/CD projects use a frameset, so we want to run our demo in a frameset
gulp.task('demo:frameset', function (done) {
  var frameset = '<style type="text/css"> body { margin: 0; padding: 0; }' +
    '.frame { display: block; width: 100vw; height: 100vh; max-width: 100%;' +
    '  margin: 0; padding: 0; border: 0 none; box-sizing: border-box; }' +
    '</style><iframe src="./test.html" class="frame" />';
  fs.writeFile('./demo/index.html', frameset, done);
});

gulp.task('demo:serve', function () {
  $.connect.server({
    root: 'demo',
    livereload: true
  });
});

gulp.task('demo:watch', function () {
  return gulp.watch(watchPath, ['demo']);
});

// An alias of test
gulp.task('default', ['test']);

// Watcher
gulp.task('watch', function () {
  return gulp.watch(watchPath, ['coverage', 'build']);
});
