//////////////////////////////////////////////////////
// 	Calling required packages
//////////////////////////////////////////////////////
var gulp = require('gulp'), 						//	https://npmjs.com/package/gulp
    sass = require('gulp-sass'),					//	https://npmjs.com/package/gulp-sass
    browserSync = require('browser-sync').create(),	//	https://npmjs.com/package/browser-sync
    concat = require('gulp-concat'),				//	https://npmjs.com/package/gulp-concat
    uglify = require('gulp-uglifyjs'), 				//	https://npmjs.com/package/gulp-uglify
    htmlmin = require('gulp-htmlmin'), 				//	https://npmjs.com/package/gulp-htmlmin
    cssnano = require('gulp-cssnano'),				//	https://npmjs.com/package/gulp-cssnano
    rename = require('gulp-rename'),				//	https://npmjs.com/package/gulp-rename
    imagemin = require('gulp-imagemin'),			//	https://npmjs.com/package/gulp-imagemin
    pngquant = require('imagemin-pngquant'),		//	https://npmjs.com/package/imagemin-pngquant
    autoprefixer = require('gulp-autoprefixer'),	//	https://npmjs.com/package/gulp-autoprefixer
    jade = require('gulp-jade'),					//	https://npmjs.com/package/gulp-jade
    sourcemaps = require('gulp-sourcemaps'),		//	https://npmjs.com/package/gulp-sourcemaps
    del = require('del');							//	https://npmjs.com/package/del

//////////////////////////////////////////////////////
//	Declaring variables
//////////////////////////////////////////////////////
var appDirectory 	= 'app'
	buildDirectory 	= 'build',
	taskClean 		= 'clean',
	taskJade		= 'jade',
	taskHtmlMin		= 'htmlminify',
	taskSass		= 'sass',
	taskCssnano		= 'cssnano',
	taskUglifyjs	= 'uglifyjs',
	taskImg			= 'img',
	taskBrowserSync = 'browser-sync',
	taskWatch		= 'watch',
	taskBuild		= 'build';
	
//////////////////////////////////////////////////////
// 	The task for deleting a build directory.
//////////////////////////////////////////////////////
gulp.task (taskClean, function () {
    return del.sync( buildDirectory );
});

//////////////////////////////////////////////////////
// 	The task for converting the jade code into html.
//////////////////////////////////////////////////////
gulp.task (taskJade, function () {
    var YOUR_LOCALS = {};
    return gulp.src
		([
			appDirectory + '/jade/*.jade',
			'!' + appDirectory + '/jade/includes' 
		])
        .pipe(jade({ locals: YOUR_LOCALS }))
        .pipe(gulp.dest( appDirectory ))
        .pipe(browserSync.reload({ stream: true }))
});

//////////////////////////////////////////////////////
// 	The task for minify your html.
// 	Pre-executed taskJade.
//////////////////////////////////////////////////////
gulp.task (taskHtmlMin, [taskJade], function () {
    return gulp.src( appDirectory + '/**/*.html' )
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest( appDirectory ))
        .pipe(browserSync.reload({ stream: true }))
});

//////////////////////////////////////////////////////
//	The task for converting the sass code into css.
//////////////////////////////////////////////////////
gulp.task (taskSass, function () {
    return gulp.src( appDirectory + '/sass/main.sass' )
        .pipe(sass())
        .pipe(gulp.dest( appDirectory + '/css' ))
        .pipe(browserSync.reload({ stream: true }))
});

//////////////////////////////////////////////////////
//	The task for minify your css and add sourcemaps.
//	Pre-executed taskSass.
//////////////////////////////////////////////////////
gulp.task (taskCssnano, [taskSass], function () {
    return gulp.src( appDirectory + '/css/main.css')
        .pipe(sourcemaps.init())
        // .pipe(autoprefixer(['last 15 versions'], {cascade: true}))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest( appDirectory + '/css'))
        .pipe(browserSync.reload({ stream: true }))
});

//////////////////////////////////////////////////////
//	The task for minify your js and add sourcemaps.
//////////////////////////////////////////////////////
gulp.task (taskUglifyjs, function () {
    return gulp.src( appDirectory + '/js/main.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest( appDirectory + '/js'))
        .pipe(browserSync.reload({ stream: true }))
});

//////////////////////////////////////////////////////
//	The task for minify your images
//////////////////////////////////////////////////////
gulp.task (taskImg, function () {
    return gulp.src( appDirectory + '/src/images/**/*')
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest( appDirectory + '/src/images' ));
});

//////////////////////////////////////////////////////
//	The task is to activate synchronization between
//	your browser and browsers on the local network.
//	The ip will be available on the link after launch.
//////////////////////////////////////////////////////
gulp.task (taskBrowserSync, function () {
    browserSync.init({
        server: {
            baseDir: appDirectory
        },
        open: false,
        notify: false
    });
});

//////////////////////////////////////////////////////
//	The task for tracking changes in specified 
//	directories and calling the specified tasks.
//	Pre-executed taskBrowserSync.
//////////////////////////////////////////////////////
gulp.task (taskWatch, [taskBrowserSync], function () {
    gulp.watch( appDirectory + '/jade/**/*.jade', [taskHtmlMin] );
    gulp.watch( appDirectory + '/sass/**/*.sass', [taskCssnano] );
    gulp.watch( appDirectory + '/js/**/main.js', [taskUglifyjs] );
});

//////////////////////////////////////////////////////
//	The task for building a project.
//	Pre-execution tasks: taskClean, taskHtmlMin, 
//	taskUglifyjs, taskCssnano, taskImg.
//////////////////////////////////////////////////////
gulp.task (taskBuild, [taskClean, taskHtmlMin, taskUglifyjs, taskCssnano, taskImg] , function () {
    let buildCSS = gulp.src( appDirectory + '/css/**/*.css' ).pipe(gulp.dest( buildDirectory + '/css')),
		buildFonts = gulp.src( appDirectory + '/fonts/**/*' ).pipe(gulp.dest( buildDirectory + '/fonts')),
		buildJS = gulp.src( appDirectory + '/js/**/*.js' ).pipe(gulp.dest( buildDirectory + '/js')),
		buildHtml = gulp.src([ appDirectory + '/index.html',  appDirectory + '/robots.txt',  appDirectory + '/sitemap.xml',  appDirectory + '/favicon.ico' ]).pipe(gulp.dest( buildDirectory )),
		buildSrc = gulp.src( appDirectory + '/src/**/*' ).pipe(gulp.dest( buildDirectory + '/src')); });

//////////////////////////////////////////////////////
//	The task for development is called by the command
//	'gulp', for this you need write next: 
//	'npm i -g gulp'
//////////////////////////////////////////////////////
gulp.task ('default', [taskHtmlMin, taskUglifyjs, taskCssnano, taskImg, taskWatch]);