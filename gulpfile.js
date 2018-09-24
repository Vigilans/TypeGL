let gulp = require('gulp');
let connect = require('gulp-connect');
let os = require('os')

gulp.task('connect', () => 
    connect.server({
        root: './',
        livereload: true
    })
);

gulp.task('reload', () => {
    return gulp.src('./**/*.html').pipe(connect.reload());
});

gulp.task('watch', () => {
    gulp.watch(['./**/*.js'], ['reload']);
});

gulp.task('compile', () => {
    const cmd = os.platform() == 'win32' ? 'tsc.cmd' : 'tsc';
    const childProcess = require('child_process');
    const child = childProcess.spawn(cmd, []);
    child.stdout.on('data', function (chunk) {
        console.log('[tsc]', chunk + '');
    });
    child.stderr.on('data', function (chunk) {
        console.log('[tsc]', chunk);
    });
    child.on('exit', function (code, signal) {
        console.log('[tsc]', chunk);
    });
    return child;
});

gulp.task('default', ['connect', 'watch', 'compile']);
