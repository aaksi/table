const {src, dest, watch, parallel, series} = require('gulp');

const scss      = require('gulp-sass');
const concat    = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify      = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const cssmin = require('gulp-cssmin');


function browsersync(){
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    }); 
}

function cleanDist(){
    return del('dist')
}

function images(){
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))

}




function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'node_modules/tabbyjs/dist/js/tabby.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}


function styles(){
    return src(['app/scss/style.scss'])
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function libs(){
    return src([
        'node_modules/normalize.css/normalize.css',
        'node_modules/slick-carousel/slick/slick.css',
        // 'node_modules/tabbyjs/dist/css/tabby-ui.css',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.css'])
        .pipe(concat('libs.min.css'))
        .pipe(cssmin())
        .pipe(dest('app/css'))
    
}

function build(){
    return src([
        'app/css/style.min.css',
        'app/css/libs.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching(){
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/main.js' ,'!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
    
}


exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist= cleanDist;
exports.libs= libs;


exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching, libs);