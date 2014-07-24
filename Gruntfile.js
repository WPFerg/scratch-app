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
        options: {
          reporterOutput: "js-hint-results.txt",
          "-W097": false, // 'use strict' as a function
          "-W041": false, // == null
          "-W069": false, // dot notation over ['Something']
          undef: false, // x,y,z is undefined
          eqeqeq: false, // === over ==
          eqnull: false,
          asi: true,
          globals: {
            "$": false,
            "runtime":false,
            "Runtime":false,
            "XMLHttpRequest":false,
            "SoundDecoder":false,
            "Instr":false,
            "OffsetBuffer":false,
            "SoundPrims":false,
            "SensingPrims":false,
            "Stage":false,
            "Sprite":false,
            "List":false,
            "Reporter":false,
            "interp":false,
            "Interpreter":false,
            "WAVFile":false,
            "window":false,
            "document": false,
            "Point": false,
            "Color":false,
            "Rectangle":false,
            "Timer":false,
            "Thread":false,
            "console":false,
            "io":false,
            "IO":false,
            "Primitives":false,
            "setTimeout":false,
            "setInterval":false,
            "Scalar":false,
            "SoundBank":false,
            "projectId":false
          }
        },
        src: ["*.js", "scratch-player/js/**/*.js", "app/*.js"],
        exclude: ["**/bower_components/**/*.js"],
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
