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
        changeToBuildFolder:
        {
          command: "cd ../scratch-web-build/"
        },
        gitOperations:
        {
          command: ["git add .", "git commit -m \"Grunt auto-build\""].join("&&")
        },
        pushToHeroku:
        {
          command: "git push heroku master"
        }
      }

    });

    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.task.registerTask("default", function(arg)
      {
        grunt.log.writeln("Copying folder. If you want for it to be automatically copied, then run 'grunt watch'");
        grunt.task.run("copy");
      });
    grunt.registerTask("build", ["copy", "shell"]);
}
