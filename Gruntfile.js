// Gruntfile for building website and player

module.exports = function(grunt)
{
    grunt.initConfig({
      pkg: grunt.file.readJSON("package.json"),

      copy: {
        files: {
          expand: true,
          cwd: ".",
          src: ["**/*", "!**/.git/**", "!src"],  // Copy all files and folders, EXCEPT .git and src
          dest: "../scratch-web-build/"
        }
      },
      watch: {
        files: '**/*.js',
        tasks: ["copy"]
      },
      shell: {
        gitOperations:
        {
          command: ["cd ../scratch-web-build/", "git add .", "git commit -m \"Grunt auto-build\"" , "git push heroku master"].join("&&"),
          options: { stderr: false, execOptions: {maxBuffer: 90000*1024} }
        }
      },
      jshint: {
        src: ["*.js", "scratch-player/**/*.js", "app/**/*.js"],
        options: {
          reporterOutput: "js-hint-results.txt"
        }
      }

    });

    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");

    grunt.task.registerTask("default", function(arg)
      {
        grunt.log.writeln("Copying folder. If you want for it to be automatically copied, then run 'grunt watch'");
        grunt.task.run("copy");
      });
    grunt.registerTask("build", ["jshint", "copy", "shell"]);
};
