/*
 * grunt-svgfont
 * https://github.com/cameronhunter/grunt-svgfont
 *
 * Copyright (c) 2013 Cameron Hunter
 * Licensed under the MIT license.
 */

"use strict";

// Link: http://en.wikipedia.org/wiki/Private_Use_(Unicode)
var UNICODE_PRIVATE_USE_AREA = {
  start: 0xE000,
  end: 0xF8FF
};

var DOMParser = require("xmldom").DOMParser;
var Hogan = require("hogan.js");
var Path = require("path");
var StringUtils = require("strutil");
var Temp = require('temporary');

module.exports = function(grunt) {

  var dom = new DOMParser();
  var temp = new Temp.Dir();
  var fontTemplate = Path.join(__dirname, "..", "templates", "font.svg");
  var font = Hogan.compile(grunt.file.read(fontTemplate));

  grunt.registerMultiTask("svgfont", "Create an SVG font from multiple SVG glyph files", function() {

    var options = this.options({
      font: "my-svg-font"
    });

    this.files.forEach(function(files) {
      // TODO: Check that number of glyphs isn't larger than the unicode private use area
      // TODO: Provide some stability between builds when choosing the unicode codepoints
      // TODO: Ensure all the glyphs are the same height
      // TODO: Create CSS file
      // TODO: Create HTML demo file

      // Create glyphs from SVG files
      var glyphs = files.src.map(function(file, index) {
        var svg = parseSVG(grunt.file.read(file));
        var name = Path.basename(file).replace(/\.svg$/i, '');
        var character = String.fromCharCode(UNICODE_PRIVATE_USE_AREA.start + index);

        return grunt.util._.merge(svg, {
          name: name,
          character: StringUtils.escapeToNumRef(character, 16)
        });
      });

      // Create SVG font file
      grunt.file.write(Path.join(temp.path, options.font + ".svg"), font.render({
        font: options.font,
        canvasSize: glyphs[0].height,
        glyphs: glyphs
      }));
    });

  });

  function parseSVG(contents) {
    var doc = dom.parseFromString(contents, "application/xml");

    // TODO: Handle possibility of no svg element
    var svg = doc.getElementsByTagName("svg")[0];

    // TODO: Handle possibility of 'px'
    var width  = svg.getAttribute("width");
    var height = svg.getAttribute("height");

    // TODO: Handle possibility of no/multiple paths
    var path = svg.getElementsByTagName("path")[0];

    return {
      width: svg.getAttribute("width"),
      height: svg.getAttribute("height"),
      d: path.getAttribute("d")
    };
  }

};
