let gulp = require('gulp');
let connect = require('gulp-connect');
let os = require('os')

gulp.task('connect', () => 
    connect.server({
        root: './dist',
        livereload: true
    })
);

gulp.task('reload', () => {
    return gulp.src('./dist/**/*.html').pipe(connect.reload());
});

gulp.task('copy', () => {
    gulp.src('./@(core|+([0123456789]).+(?))/**/*.@(html|js|json|glsl?)').pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
    gulp.watch(['./@(core|+([0123456789]).+(?))/**/*.@(html|js|json|glsl?)'], ['copy']);
    gulp.watch(['./dist/**/*.@(html|js|json|glsl?)'], ['reload']);
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

gulp.task('default', ['connect', 'copy', 'watch', 'compile']);
