module.exports = function(grunt) {

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    temp: ".tmp",

    bump: {
      options: {
        files: ["package.json"],
        commit: true,
        commitMessage: "Release v%VERSION%",
        commitFiles: ["-a"],
        createTag: true,
        tagName: "v%VERSION%",
        tagMessage: "Version %VERSION%",
        push: true,
        pushTo: "origin",
        gitDescribeOptions: "--tags --always --abbrev=1 --dirty=-d"
      }
    },

    clean: {
      tests: ["<%= temp %>"],
    },

    fontfactory: {
      test: {
        options: {
          font: "my-test-font",
          onlyFonts: true
        },
        src: "test/fixtures/originalicons/*.svg",
        dest: "<%= temp %>"
      },
      testcleanicons: {
        options: {
          font: "test-cleanicons-font",
          onlyFonts: true
        },
        src: "test/fixtures/cleanicons/*.svg",
        dest: "<%= temp %>"
      },
      testprefixedicons: {
        options: {
          font: "test-prefixedicons-font",
          onlyFonts: true,
          appendCodepoints: true
        },
        src: "test/fixtures/prefixedicons/*.svg",
        dest: "<%= temp %>"
      }
    },

    nodeunit: {
      tests: ["test/*_test.js"],
    }
  });

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["test"]);
  grunt.registerTask("test", [
    "clean",
    "fontfactory:test",
    "fontfactory:testcleanicons",
    "fontfactory:testprefixedicons",
    "nodeunit",
    // "clean"
  ]);
};
