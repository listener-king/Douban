var gulp = require('gulp');
//html
var htmlmin = require('gulp-htmlmin');
var useref = require('gulp-useref');
//css
var minifyCss = require('gulp-minify-css');
// css+ js
var concat = require('gulp-concat');
//js uglify
var uglify = require('gulp-uglify');
//判断
var gulpIf = require('gulp-if');
//记录依赖
var rev = require('gulp-rev');
//
//收集依赖替换
var collector = require('gulp-rev-collector');
//
//img
var imageMin = require('gulp-imagemin');
//
//改名
var rename = require('gulp-rename');
//css 前缀
var autoprefixer = require('gulp-autoprefixer'); //补充前缀

//html
gulp.task('html', function() {
    var htmlOptions = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    return gulp.src('./src/views/**/*.html', { base: './src' })
        .pipe(htmlmin())
        .pipe(rev())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(rename('html-manifest.json'))
        .pipe(gulp.dest('dist/rev'))
});


//css js
gulp.task('useref', function() {
    return gulp.src('./src/index.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.js', rev()))
        .pipe(gulpIf('*.css', minifyCss()))
        .pipe(gulpIf('*.css', autoprefixer()))
        .pipe(gulpIf('*.css', rev()))
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(rename('css-js-manifest.json'))
        .pipe(gulp.dest('dist/rev'))

});

//替换
//
//
//img
gulp.task('img', function() {
    return gulp.src('./src/assets/img/*.*', { base: './src' })
        .pipe(imageMin())
        .pipe(rev())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(rename('img-manifest.json'))
        .pipe(gulp.dest('dist/rev'))
})


gulp.task('default', ['img', 'html', 'useref'], function() {
    gulp.src(['./dist/rev/html-manifest.json', './dist/assets/js/*.js'])
        .pipe(collector())
        .pipe(gulp.dest('dist/assets/js'));

    gulp.src(['./dist/rev/*.json', './dist/index.html'])
        .pipe(collector())
        .pipe(gulp.dest('dist'));
    gulp.src(['./dist/rev/img-manifest.json', './dist/views/**/*.html'], { base: './dist' })
        .pipe(collector())
        .pipe(gulp.dest('dist'));

})
