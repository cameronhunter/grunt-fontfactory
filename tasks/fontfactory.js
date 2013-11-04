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

var DOMParser = require("xmldom").DOMParser;
var Hogan = require("hogan.js");
var Path = require("path");
var Fs = require("fs");
var StringUtils = require("strutil");
var Package = require("../package.json");
var FontConversion = {
  svg2ttf: require("svg2ttf"),
  ttf2eot: require("ttf2eot"),
  ttf2woff: require("ttf2woff")
};
var SVGPathData = require("svg-pathdata");

// TODO: Check that number of glyphs isn't larger than the unicode private use area
// TODO: Provide some stability between builds when choosing the unicode codepoints
// TODO: Ensure all the glyphs are the same height
// TODO: CamelCase glyph names

module.exports = function(grunt) {

  var dom = new DOMParser();
  var font = template("font.svg");
  var options;

  grunt.registerMultiTask("fontfactory", Package.description, function() {
    this.requiresConfig([this.name, this.target, "src"].join("."));
    this.requiresConfig([this.name, this.target, "dest"].join("."));

    options = this.options({
      font: "my-font"
    });

    var done = this.async();

    this.files.forEach(function(files) {
      var fontDestination = Path.join(files.dest, options.font);

      var glyphs = readGlyphs(files);

      var svg = createSVG(fontDestination + ".svg", options.font, glyphs);
      var ttf = createTTF(fontDestination + ".ttf", svg);
      createEOT(fontDestination + ".eot", ttf);
      createWOFF(fontDestination + ".woff", ttf, done);

      if(!options.onlyFonts) {
        createCSS(fontDestination + ".css", options.font, "suit", glyphs);
        createHTML(fontDestination + ".html", options.font, "suit", glyphs);
      }
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

  function readGlyphs(files) {
    var usedCodePoints = [];
    return files.src.map(function(file) {
      var matches = Path.basename(file).match(/^(?:u([0-9a-f]{4})\-)?(.*).svg$/i);
      if(matches&&matches[1]) {
        usedCodePoints.push(parseInt(matches[1], 16));
        return {
          name: matches[2],
          codepoint: matches[1],
          character: StringUtils.escapeToNumRef(
            String.fromCharCode(parseInt(matches[1], 16)),
            16),
          file: file
        };
      } else if(matches) {
        return {
          name: matches[2],
          codepoint: 0,
          character: '',
          file: file
        };
      }
    }).map(function(glyph) {
      var svg = parseSVG(grunt.file.read(glyph.file));
      // Find a free codepoint and rename the file
      if(0 === glyph.codepoint) {
        for(var i = UNICODE_PRIVATE_USE_AREA.start,
          j=UNICODE_PRIVATE_USE_AREA.end; i<j; i++) {
          if(-1 === usedCodePoints.indexOf(i)) {
            glyph.codepoint = i.toString(16);
            glyph.character = StringUtils.escapeToNumRef(
              String.fromCharCode(i), 16);
            usedCodePoints.push(i);
            if(options.appendCodepoints) {
              Fs.renameSync(glyph.file, Path.dirname(glyph.file) + '/'
                + 'u' + i.toString(16).toUpperCase() + '-' + glyph.name + '.svg');
              grunt.log.ok("Saved codepoint: " + 'u'
                + i.toString(16).toUpperCase() +' for ' + glyph.name + '.svg');
            }
            break;
          }
        }
      }
      return grunt.util._.merge(svg, glyph);
    });
  }

  function createSVG(filename, fontname, glyphs) {
    var contents = font.render({
      font: fontname,
      canvasSize: glyphs[0].height,
      glyphs: glyphs
    });

    grunt.file.write(filename, contents);
    grunt.log.ok("Created: " + filename);
    return contents;
  }

  function createTTF(filename, svg) {
    var ttf = FontConversion.svg2ttf(svg);
    var buffer = new Buffer(ttf.buffer)
    grunt.file.write(filename, buffer);
    grunt.log.ok("Created: " + filename);
    return buffer;
  }

  function createWOFF(filename, ttf, callback) {
    FontConversion.ttf2woff(ttf, {}, function(err, woff) {
      grunt.file.write(filename, woff.buffer);
      grunt.log.ok("Created: " + filename);
      callback();
    });
  }

  function createEOT(filename, ttf) {
    var eot = FontConversion.ttf2eot(ttf);
    grunt.file.write(filename, eot);
    grunt.log.ok("Created: " + filename);
  }

  function template(name) {
    return Hogan.compile(grunt.file.read(Path.join(__dirname, "..", "templates", name)));
  }

  function parseSVG(contents) {
    // TODO: Ignore/error on invalid content?
    var doc = dom.parseFromString(contents, "application/xml");

    // TODO: Handle possibility of no svg element
    var svg = doc.getElementsByTagName("svg")[0];

    // TODO: Handle possibility of "px"
    var width  = svg.getAttribute("width");
    var height = svg.getAttribute("height");

    // TODO: Handle possibility of no/multiple paths
    var path = svg.getElementsByTagName("path")[0];

    var parser = new SVGPathData.Parser(function(command) {
      var origY = command.y || 0;
      if('undefined' !== command.y && command.y !== 0) {
        if(notFirst && command.relative) {
          command.y = -command.y;
        } else {
          command.y = height - command.y;
        }
      }
      if('undefined' !== command.y1 && command.y1 !== 0) {
        if(notFirst && command.relative) {
          command.y1 = -command.y1;
        } else {
          command.y1 = height - command.y1;
        }
      }
      if('undefined' !== command.y2 && command.y2 !== 0) {
        if(notFirst && command.relative) {
          command.y2 = -command.y2;
        } else {
          command.y2 = height - command.y2;
        }
      }
      if('undefined' !== command.rY && command.rY !== 0) {
        if(notFirst && command.relative) {
          command.rY = -command.rY;
        } else {
          command.rY = height - command.rY;
        }
      }
      notFirst = true;
      encoder.write(command);
    })
    , encoder = new SVGPathData.Encoder(function(chunk){
      d += ' ' + chunk;
    })
    , d = ''
    , notFirst = false;
    parser.read(path.getAttribute("d")).end();
    return {
      width: svg.getAttribute("width"),
      height: svg.getAttribute("height"),
      d: d
    };
  }

};
