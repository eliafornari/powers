import gulp from "gulp";
import browserify from "browserify";
import source from "vinyl-source-stream";
import sass from "gulp-ruby-sass";
import connect from "gulp-connect";


gulp.task('connect', function () {
	connect.server({
		root: 'public',
		port: 9000
	})
})

gulp.task("default", ["transpile"]);

gulp.task("transpile", () => {

  return browserify("src/app.js")
    .transform("babelify")
    .bundle()
    .on("error", function(error){
      console.error( "\nError: ", error.message, "\n");
      this.emit("end");
    })
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));

});

gulp.task("sass", function() {
	return sass('sass/*.scss')
  .pipe(gulp.dest('dist'))

})



gulp.task("watch", ["transpile"], () => {
  gulp.watch("src/**/*", ["transpile"]);
  gulp.watch('sass/**/*', ['sass'])
});
