# grunt-fontfactory [![Build Status](https://secure.travis-ci.org/cameronhunter/grunt-fontfactory.png)](http://travis-ci.org/cameronhunter/grunt-fontfactory)

Create a font from multiple SVG glyph files.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-fontfactory --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-fontfactory');
```

## The "fontfactory" task

### Overview
In your project's Gruntfile, add a section named `fontfactory` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  fontfactory: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### src
Type: `string`

SVG glyphs. Wildcards are supported.

#### dest
Type: `string`

Directory for resulting font.

#### options.font
Type: `String`
Default value: `'my-font'`

A string value that is used to name your font-family.

#### options.onlyFonts
Type: `Boolean`
Default value: `false`

Allow to generate only fonts.

#### options.appendCodepoints
Type: `Boolean`
Default value: `false`

Allow to append codepoints to icon files in order to always keep the same codepoints.

### Example

```js
grunt.initConfig({
  fontfactory: {
    options: {
      font: "my-font-name"
    },
    src: 'glyphs/*.svg',
    dest: 'font/'
  },
})
```

### Useful Links

* [MDN - SVG Fonts](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/SVG_fonts)
* Browser support: [@font-face](http://caniuse.com/#feat=fontface), [TTF](http://caniuse.com/#feat=ttf), [SVG](http://caniuse.com/#feat=svg-fonts), [WOFF](http://caniuse.com/#feat=woff), [EOT](http://caniuse.com/#feat=eot)
