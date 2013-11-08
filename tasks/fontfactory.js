/*
 * grunt-fontfactory
 * https://github.com/cameronhunter/grunt-fontfactory
 *
 * Copyright (c) 2013 Cameron Hunter, Nicolas Froidure
 * Licensed under the MIT license.
 */

"use strict";

// http://en.wikipedia.org/wiki/Private_Use_(Unicode)
var UNICODE_PRIVATE_USE_AREA = {
  start: 0xE001,
  end: 0xF8FF
};

var Hogan = require("hogan.js");
var Path = require("path");
var Fs = require("fs");
var Package = require("../package.json");
var FontConversion = {
  svg2ttf: require("svg2ttf"),
  ttf2eot: require("ttf2eot"),
  ttf2woff: require("ttf2woff")
};
var svgicons2svgfont = require("svgicons2svgfont");

// TODO: Check that number of glyphs isn't larger than the unicode private use area
// TODO: Ensure all the glyphs are the same height
// TODO: CamelCase glyph names

module.exports = function(grunt) {

  var options;

  grunt.registerMultiTask("fontfactory", Package.description, function() {
    this.requiresConfig([this.name, this.target, "src"].join("."));
    this.requiresConfig([this.name, this.target, "dest"].join("."));

    options = this.options({
      font: "my-font",
      appendCodepoints: false,
      onlyFonts: false
    });

    var done = this.async();
    this.files.forEach(function (files) {
      var fontDestination = Path.join(files.dest, options.font);
      svgicons2svgfont(files.src, fontDestination + '.svg', {
        fontName: options.font,
        log: grunt.log.ok,
        callback : function(glyphs) {
          if(!options.onlyFonts) {
            createCSS(fontDestination + ".css", options.font, "suit", glyphs);
            createHTML(fontDestination + ".html", options.font, "suit", glyphs);
          }
          var ttf = createTTF(fontDestination + ".ttf",
            Fs.readFileSync(fontDestination + '.svg', {
              encoding: 'utf8'
            }));
          createEOT(fontDestination + ".eot", ttf);
          createWOFF(fontDestination + ".woff", ttf, done);
        }
      });
    });
  });

  function createHTML(filename, font, syntax, glyphs) {
    var HTML = template(syntax + ".html");

    var contents = HTML.render({
      font: font,
      glyphs: glyphs
    });

    grunt.file.write(filename, contents);
    grunt.log.ok("Created: " + filename);
  }

  function createCSS(filename, font, syntax, glyphs) {
    var CSS = template(syntax + ".css");

    var contents = CSS.render({
      font: font,
      glyphs: glyphs
    });

    grunt.file.write(filename, contents);
    grunt.log.ok("Created: " + filename);
  }

  function createTTF(filename, svg) {
    var ttf = FontConversion.svg2ttf(svg);
    var buffer = new Buffer(ttf.buffer)
    grunt.file.write(filename, buffer);
    grunt.log.ok("Created: " + filename);
    return buffer;
  }

  function createWOFF(filename, ttf, callback) {
    try {
      FontConversion.ttf2woff(ttf, {}, function(err, woff) {
        if(err) {
          grunt.log.ok("Error creating: " + filename + ' '+err);
        } else {
          grunt.file.write(filename, woff.buffer);
          grunt.log.ok("Created: " + filename);
        }
        callback();
      });
    } catch (e) {
      callback();
    }
  }

  function createEOT(filename, ttf) {
    var eot = FontConversion.ttf2eot(ttf);
    grunt.file.write(filename, eot);
    grunt.log.ok("Created: " + filename);
  }

  function template(name) {
    return Hogan.compile(grunt.file.read(Path.join(__dirname, "..", "templates", name)));
  }

};
