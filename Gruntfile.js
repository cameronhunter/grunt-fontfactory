module.exports = function(grunt) {

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    temp: ".tmp",

    clean: {
      tests: ["<%= temp %>"],
    },

    fontfactory: {
      test: {
        options: {
          font: "my-test-font"
        },
        src: "test/fixtures/*.svg",
        dest: "<%= temp %>"
      }
    },

    nodeunit: {
      tests: ["test/*_test.js"],
    }
  });

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["test"]);
  grunt.registerTask("test", ["clean", "fontfactory", "nodeunit", "clean"]);
};
