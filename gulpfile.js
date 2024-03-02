const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const grupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
gulp.task('clean', function (done) {
    if (fs.existsSync('./dist/'))
        return gulp
            .src('./dist/', { read: false })
            .pipe(clean({ force: true }));
    done();
});
const plumberHtmlConfig = {
    errorHandler: notify.onError({
        title: 'HTML',
        message: 'Error <%= error.message %>',
        sound: false,
    }),
};
gulp.task('html', function () {
    return gulp
        .src('./src/*.html')
        .pipe(plumber(plumberHtmlConfig))
        .pipe(
            fileInclude({
                prefix: '@@',
                basepath: '@file',
            })
        )
        .pipe(gulp.dest('./dist/'));
});

const plumberSassConfig = {
    errorHandler: notify.onError({
        title: 'Styles',
        message: 'Error <%= error.message %>',
        sound: false,
    }),
};
gulp.task('sass', function () {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(plumber(plumberSassConfig))
        .pipe(sourceMaps.init())
        .pipe(sass())
        .pipe(grupMedia())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copyImages', function () {
    return gulp.src('./src/img/**/*').pipe(gulp.dest('./dist/img/'));
});

const serverOptions = {
    livereload: true,
    open: true,
};

gulp.task('startserver', function () {
    return gulp.src('./dist/').pipe(server(serverOptions));
});

gulp.task('watch', function () {
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('./src/**/*.html', gulp.parallel('html'));
    gulp.watch('./src/img/**/*', gulp.parallel('copyImages'));
});

gulp.task(
    'default',
    gulp.series(
        'clean',
        gulp.parallel('html', 'sass', 'copyImages'),
        'startserver',
        'watch'
    )
);
