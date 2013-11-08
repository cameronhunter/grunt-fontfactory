var grunt = require("grunt");

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.svgfont = {
  setUp: function(done) {
    done();
  },
  svg_font_file_creation: function(test) {
    test.expect(1);

    var actual = grunt.file.read("test/results/test-cleanicons-font.svg");
    var expected = grunt.file.read("test/expected/test-cleanicons-font.svg");
    test.equal(actual, expected, "should describe what the default behavior is.");

    test.done();
  }
};
