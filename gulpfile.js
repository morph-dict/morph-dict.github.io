/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 03.11.2015 22:56
 */

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    symlink = require('gulp-watch'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    fs = require('fs'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify');


var DEBUG_ROOT = './debug';
var SRC_ROOT = './src';
var PROD_ROOT = '.';


gulp.task('html', function(){
    var files = SRC_ROOT + '/**.html';
    return gulp.src(files)
        .pipe(gulp.dest(PROD_ROOT))

});

gulp.task('scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.js', {
        debug: false,
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    bundler = bundler.transform(reactify, {"es6": true});

    return bundler.bundle()
        .on('error',  gutil.log)
        .pipe(source('app.js'))
        .on('error', gutil.log)
        .pipe(streamify(uglify()))
        .on('error', gutil.log)
        .pipe(gulp.dest(PROD_ROOT + '/scripts'))
        .on('error', gutil.log)
});

gulp.task('default', ['html', 'scripts']);


//***************** Debug *****************

gulp.task('debug_html', function(){
    var files = SRC_ROOT + '/**.html';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(gulp.dest(DEBUG_ROOT))

});

gulp.task('debug_data', function(cb){
    fs.mkdir(DEBUG_ROOT, function(e){
        if(e !== null && e.code !== 'EEXIST') {
            throw e;
        }
        else {
            fs.symlink('../data', DEBUG_ROOT+'/data', function(e){
                if(e !== null && e.code !== 'EEXIST') {
                    throw e;
                }
                else {
                    cb();
                }
            })
        }
    });
});

gulp.task('debug_scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.js', {
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    bundler = bundler.transform(reactify, {"es6": true});

    bundler = watchify(bundler);

    function rebundle() {
        var bundle = bundler.bundle()
            .on('error',  gutil.log)
            .pipe(source('app.js'))
            .on('error', gutil.log)
            .pipe(gulp.dest(DEBUG_ROOT + '/scripts'))
            .on('error', gutil.log);
        return bundle
    }

    bundler.on('update', function() {
        var start = Date.now();
        gutil.log('Rebundle...');
        var bundle = rebundle();
        bundle.on('end', function(){
            gutil.log("Done! Time: " + (Date.now() - start));
        });
    });

    return rebundle();
});

gulp.task('debug', ['debug_data', 'debug_html', 'debug_scripts']);


