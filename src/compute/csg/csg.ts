//@ts-nocheck

// flatten the given argument into a single flat array
// the argument can be composed of multiple depths of values and arrays

import { CSG } from '@jscad/csg';

const { Plane, Vector3D, Line2D, Line3D } = CSG;

const flatten = (arr) => {
   return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
};

var flatten_1 = flatten;

/**
 * Apply the given color to the given objects.
 * @param {Array} color - RGBA color values, where each value is between 0 and 1.0
 * @param {Object|Array} objects - the objects of which to color
 * @returns {Object|Array} the same
 * @alias module:color.color
 *
 * @example
 * let redSphere = color([1,0,0], sphere()) // red
 * let greenCircle = color([0,1,0], circle()) // green
 * let blueArc = color([0,0,1], arc()) // blue
 */
const color = (color, ...objects) => {
  if (!Array.isArray(color)) throw new Error('color must be an array')
  if (color.length < 3) throw new Error('color must contain R, G and B values')
  if (color.length === 3) color = [color[0], color[1], color[2], 1.0]; // add alpha

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    object.color = color;
    return object
  });
  return results.length === 1 ? results[0] : results
};

var color_1 = color;

/**
 * @alias module:color.cssColors
 * @see CSS color table from http://www.w3.org/TR/css3-color/
 */
const cssColors = {
  // basic color keywords
  'black': [ 0 / 255, 0 / 255, 0 / 255 ],
  'silver': [ 192 / 255, 192 / 255, 192 / 255 ],
  'gray': [ 128 / 255, 128 / 255, 128 / 255 ],
  'white': [ 255 / 255, 255 / 255, 255 / 255 ],
  'maroon': [ 128 / 255, 0 / 255, 0 / 255 ],
  'red': [ 255 / 255, 0 / 255, 0 / 255 ],
  'purple': [ 128 / 255, 0 / 255, 128 / 255 ],
  'fuchsia': [ 255 / 255, 0 / 255, 255 / 255 ],
  'green': [ 0 / 255, 128 / 255, 0 / 255 ],
  'lime': [ 0 / 255, 255 / 255, 0 / 255 ],
  'olive': [ 128 / 255, 128 / 255, 0 / 255 ],
  'yellow': [ 255 / 255, 255 / 255, 0 / 255 ],
  'navy': [ 0 / 255, 0 / 255, 128 / 255 ],
  'blue': [ 0 / 255, 0 / 255, 255 / 255 ],
  'teal': [ 0 / 255, 128 / 255, 128 / 255 ],
  'aqua': [ 0 / 255, 255 / 255, 255 / 255 ],
    // extended color keywords
  'aliceblue': [ 240 / 255, 248 / 255, 255 / 255 ],
  'antiquewhite': [ 250 / 255, 235 / 255, 215 / 255 ],
    // 'aqua': [ 0 / 255, 255 / 255, 255 / 255 ],
  'aquamarine': [ 127 / 255, 255 / 255, 212 / 255 ],
  'azure': [ 240 / 255, 255 / 255, 255 / 255 ],
  'beige': [ 245 / 255, 245 / 255, 220 / 255 ],
  'bisque': [ 255 / 255, 228 / 255, 196 / 255 ],
    // 'black': [ 0 / 255, 0 / 255, 0 / 255 ],
  'blanchedalmond': [ 255 / 255, 235 / 255, 205 / 255 ],
    // 'blue': [ 0 / 255, 0 / 255, 255 / 255 ],
  'blueviolet': [ 138 / 255, 43 / 255, 226 / 255 ],
  'brown': [ 165 / 255, 42 / 255, 42 / 255 ],
  'burlywood': [ 222 / 255, 184 / 255, 135 / 255 ],
  'cadetblue': [ 95 / 255, 158 / 255, 160 / 255 ],
  'chartreuse': [ 127 / 255, 255 / 255, 0 / 255 ],
  'chocolate': [ 210 / 255, 105 / 255, 30 / 255 ],
  'coral': [ 255 / 255, 127 / 255, 80 / 255 ],
  'cornflowerblue': [ 100 / 255, 149 / 255, 237 / 255 ],
  'cornsilk': [ 255 / 255, 248 / 255, 220 / 255 ],
  'crimson': [ 220 / 255, 20 / 255, 60 / 255 ],
  'cyan': [ 0 / 255, 255 / 255, 255 / 255 ],
  'darkblue': [ 0 / 255, 0 / 255, 139 / 255 ],
  'darkcyan': [ 0 / 255, 139 / 255, 139 / 255 ],
  'darkgoldenrod': [ 184 / 255, 134 / 255, 11 / 255 ],
  'darkgray': [ 169 / 255, 169 / 255, 169 / 255 ],
  'darkgreen': [ 0 / 255, 100 / 255, 0 / 255 ],
  'darkgrey': [ 169 / 255, 169 / 255, 169 / 255 ],
  'darkkhaki': [ 189 / 255, 183 / 255, 107 / 255 ],
  'darkmagenta': [ 139 / 255, 0 / 255, 139 / 255 ],
  'darkolivegreen': [ 85 / 255, 107 / 255, 47 / 255 ],
  'darkorange': [ 255 / 255, 140 / 255, 0 / 255 ],
  'darkorchid': [ 153 / 255, 50 / 255, 204 / 255 ],
  'darkred': [ 139 / 255, 0 / 255, 0 / 255 ],
  'darksalmon': [ 233 / 255, 150 / 255, 122 / 255 ],
  'darkseagreen': [ 143 / 255, 188 / 255, 143 / 255 ],
  'darkslateblue': [ 72 / 255, 61 / 255, 139 / 255 ],
  'darkslategray': [ 47 / 255, 79 / 255, 79 / 255 ],
  'darkslategrey': [ 47 / 255, 79 / 255, 79 / 255 ],
  'darkturquoise': [ 0 / 255, 206 / 255, 209 / 255 ],
  'darkviolet': [ 148 / 255, 0 / 255, 211 / 255 ],
  'deeppink': [ 255 / 255, 20 / 255, 147 / 255 ],
  'deepskyblue': [ 0 / 255, 191 / 255, 255 / 255 ],
  'dimgray': [ 105 / 255, 105 / 255, 105 / 255 ],
  'dimgrey': [ 105 / 255, 105 / 255, 105 / 255 ],
  'dodgerblue': [ 30 / 255, 144 / 255, 255 / 255 ],
  'firebrick': [ 178 / 255, 34 / 255, 34 / 255 ],
  'floralwhite': [ 255 / 255, 250 / 255, 240 / 255 ],
  'forestgreen': [ 34 / 255, 139 / 255, 34 / 255 ],
    // 'fuchsia': [ 255 / 255, 0 / 255, 255 / 255 ],
  'gainsboro': [ 220 / 255, 220 / 255, 220 / 255 ],
  'ghostwhite': [ 248 / 255, 248 / 255, 255 / 255 ],
  'gold': [ 255 / 255, 215 / 255, 0 / 255 ],
  'goldenrod': [ 218 / 255, 165 / 255, 32 / 255 ],
    // 'gray': [ 128 / 255, 128 / 255, 128 / 255 ],
    // 'green': [ 0 / 255, 128 / 255, 0 / 255 ],
  'greenyellow': [ 173 / 255, 255 / 255, 47 / 255 ],
  'grey': [ 128 / 255, 128 / 255, 128 / 255 ],
  'honeydew': [ 240 / 255, 255 / 255, 240 / 255 ],
  'hotpink': [ 255 / 255, 105 / 255, 180 / 255 ],
  'indianred': [ 205 / 255, 92 / 255, 92 / 255 ],
  'indigo': [ 75 / 255, 0 / 255, 130 / 255 ],
  'ivory': [ 255 / 255, 255 / 255, 240 / 255 ],
  'khaki': [ 240 / 255, 230 / 255, 140 / 255 ],
  'lavender': [ 230 / 255, 230 / 255, 250 / 255 ],
  'lavenderblush': [ 255 / 255, 240 / 255, 245 / 255 ],
  'lawngreen': [ 124 / 255, 252 / 255, 0 / 255 ],
  'lemonchiffon': [ 255 / 255, 250 / 255, 205 / 255 ],
  'lightblue': [ 173 / 255, 216 / 255, 230 / 255 ],
  'lightcoral': [ 240 / 255, 128 / 255, 128 / 255 ],
  'lightcyan': [ 224 / 255, 255 / 255, 255 / 255 ],
  'lightgoldenrodyellow': [ 250 / 255, 250 / 255, 210 / 255 ],
  'lightgray': [ 211 / 255, 211 / 255, 211 / 255 ],
  'lightgreen': [ 144 / 255, 238 / 255, 144 / 255 ],
  'lightgrey': [ 211 / 255, 211 / 255, 211 / 255 ],
  'lightpink': [ 255 / 255, 182 / 255, 193 / 255 ],
  'lightsalmon': [ 255 / 255, 160 / 255, 122 / 255 ],
  'lightseagreen': [ 32 / 255, 178 / 255, 170 / 255 ],
  'lightskyblue': [ 135 / 255, 206 / 255, 250 / 255 ],
  'lightslategray': [ 119 / 255, 136 / 255, 153 / 255 ],
  'lightslategrey': [ 119 / 255, 136 / 255, 153 / 255 ],
  'lightsteelblue': [ 176 / 255, 196 / 255, 222 / 255 ],
  'lightyellow': [ 255 / 255, 255 / 255, 224 / 255 ],
    // 'lime': [ 0 / 255, 255 / 255, 0 / 255 ],
  'limegreen': [ 50 / 255, 205 / 255, 50 / 255 ],
  'linen': [ 250 / 255, 240 / 255, 230 / 255 ],
  'magenta': [ 255 / 255, 0 / 255, 255 / 255 ],
    // 'maroon': [ 128 / 255, 0 / 255, 0 / 255 ],
  'mediumaquamarine': [ 102 / 255, 205 / 255, 170 / 255 ],
  'mediumblue': [ 0 / 255, 0 / 255, 205 / 255 ],
  'mediumorchid': [ 186 / 255, 85 / 255, 211 / 255 ],
  'mediumpurple': [ 147 / 255, 112 / 255, 219 / 255 ],
  'mediumseagreen': [ 60 / 255, 179 / 255, 113 / 255 ],
  'mediumslateblue': [ 123 / 255, 104 / 255, 238 / 255 ],
  'mediumspringgreen': [ 0 / 255, 250 / 255, 154 / 255 ],
  'mediumturquoise': [ 72 / 255, 209 / 255, 204 / 255 ],
  'mediumvioletred': [ 199 / 255, 21 / 255, 133 / 255 ],
  'midnightblue': [ 25 / 255, 25 / 255, 112 / 255 ],
  'mintcream': [ 245 / 255, 255 / 255, 250 / 255 ],
  'mistyrose': [ 255 / 255, 228 / 255, 225 / 255 ],
  'moccasin': [ 255 / 255, 228 / 255, 181 / 255 ],
  'navajowhite': [ 255 / 255, 222 / 255, 173 / 255 ],
    // 'navy': [ 0 / 255, 0 / 255, 128 / 255 ],
  'oldlace': [ 253 / 255, 245 / 255, 230 / 255 ],
    // 'olive': [ 128 / 255, 128 / 255, 0 / 255 ],
  'olivedrab': [ 107 / 255, 142 / 255, 35 / 255 ],
  'orange': [ 255 / 255, 165 / 255, 0 / 255 ],
  'orangered': [ 255 / 255, 69 / 255, 0 / 255 ],
  'orchid': [ 218 / 255, 112 / 255, 214 / 255 ],
  'palegoldenrod': [ 238 / 255, 232 / 255, 170 / 255 ],
  'palegreen': [ 152 / 255, 251 / 255, 152 / 255 ],
  'paleturquoise': [ 175 / 255, 238 / 255, 238 / 255 ],
  'palevioletred': [ 219 / 255, 112 / 255, 147 / 255 ],
  'papayawhip': [ 255 / 255, 239 / 255, 213 / 255 ],
  'peachpuff': [ 255 / 255, 218 / 255, 185 / 255 ],
  'peru': [ 205 / 255, 133 / 255, 63 / 255 ],
  'pink': [ 255 / 255, 192 / 255, 203 / 255 ],
  'plum': [ 221 / 255, 160 / 255, 221 / 255 ],
  'powderblue': [ 176 / 255, 224 / 255, 230 / 255 ],
    // 'purple': [ 128 / 255, 0 / 255, 128 / 255 ],
    // 'red': [ 255 / 255, 0 / 255, 0 / 255 ],
  'rosybrown': [ 188 / 255, 143 / 255, 143 / 255 ],
  'royalblue': [ 65 / 255, 105 / 255, 225 / 255 ],
  'saddlebrown': [ 139 / 255, 69 / 255, 19 / 255 ],
  'salmon': [ 250 / 255, 128 / 255, 114 / 255 ],
  'sandybrown': [ 244 / 255, 164 / 255, 96 / 255 ],
  'seagreen': [ 46 / 255, 139 / 255, 87 / 255 ],
  'seashell': [ 255 / 255, 245 / 255, 238 / 255 ],
  'sienna': [ 160 / 255, 82 / 255, 45 / 255 ],
    // 'silver': [ 192 / 255, 192 / 255, 192 / 255 ],
  'skyblue': [ 135 / 255, 206 / 255, 235 / 255 ],
  'slateblue': [ 106 / 255, 90 / 255, 205 / 255 ],
  'slategray': [ 112 / 255, 128 / 255, 144 / 255 ],
  'slategrey': [ 112 / 255, 128 / 255, 144 / 255 ],
  'snow': [ 255 / 255, 250 / 255, 250 / 255 ],
  'springgreen': [ 0 / 255, 255 / 255, 127 / 255 ],
  'steelblue': [ 70 / 255, 130 / 255, 180 / 255 ],
  'tan': [ 210 / 255, 180 / 255, 140 / 255 ],
    // 'teal': [ 0 / 255, 128 / 255, 128 / 255 ],
  'thistle': [ 216 / 255, 191 / 255, 216 / 255 ],
  'tomato': [ 255 / 255, 99 / 255, 71 / 255 ],
  'turquoise': [ 64 / 255, 224 / 255, 208 / 255 ],
  'violet': [ 238 / 255, 130 / 255, 238 / 255 ],
  'wheat': [ 245 / 255, 222 / 255, 179 / 255 ],
    // 'white': [ 255 / 255, 255 / 255, 255 / 255 ],
  'whitesmoke': [ 245 / 255, 245 / 255, 245 / 255 ],
    // 'yellow': [ 255 / 255, 255 / 255, 0 / 255 ],
  'yellowgreen': [ 154 / 255, 205 / 255, 50 / 255 ]
};

var cssColors_1 = cssColors;

/**
 * Converts a CSS color name to RGB color.
 *
 * @param {String} s - the CSS color name
 * @return {Array} the RGB color, or undefined if not found
 * @alias module:color.colorNameToRgb
 * @example
 * let mysphere = color(colorNameToRgb('lightblue'), sphere())
 */
const colorNameToRgb = s => {
  return cssColors_1[s.toLowerCase()]
};

var colorNameToRgb_1 = colorNameToRgb;

/**
 * Converts CSS color notations (string of hex values) to RGB values.
 *
 * @see https://www.w3.org/TR/css-color-3/
 * @param {String} notation - color notation
 * @return {Array} RGB color values
 * @alias module:color.hexToRgb
 *
 * @example
 * let mysphere = color(hexToRgb('#000080'), sphere()) // navy blue
 */
const hexToRgb = (notation) => {
  notation = notation.replace('#', '');
  if (notation.length < 6) throw new Error('the given notation must contain 3 or more hex values')

  const r = parseInt(notation.substring(0, 2), 16) / 255;
  const g = parseInt(notation.substring(2, 4), 16) / 255;
  const b = parseInt(notation.substring(4, 6), 16) / 255;
  if (notation.length >= 8) {
    const a = parseInt(notation.substring(6, 8), 16) / 255;
    return [r, g, b, a]
  }
  return [r, g, b]
};

var hexToRgb_1 = hexToRgb;

/**
 * Convert hue values to a color component (ie one of r, g, b)
 * @param  {Number} p
 * @param  {Number} q
 * @param  {Number} t
 * @alias module:color.hueToColorComponent
 */
const hueToColorComponent = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
};

var hueToColorComponent_1 = hueToColorComponent;

/**
 * Converts HSL color values to RGB color values.
 *
 * @see http://en.wikipedia.org/wiki/HSL_color_space.
 * @param {Array} values - HSL color values
 * @return {Array} RGB color values
 * @alias module:color.hslToRgb
 *
 * @example
 * let mysphere = color(hslToRgb([0.9166666666666666, 1, 0.5]), sphere())
 */
const hslToRgb = (values) => {
  if (!Array.isArray(values)) throw new Error('values must be an array')
  if (values.length < 3) throw new Error('values must contain H, S and L values')

  let h = values[0];
  let s = values[1];
  let l = values[2];

  let r = l; // default is achromatic
  let g = l;
  let b = l;

  if (s !== 0) {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hueToColorComponent_1(p, q, h + 1 / 3);
    g = hueToColorComponent_1(p, q, h);
    b = hueToColorComponent_1(p, q, h - 1 / 3);
  }

  if (values.length > 3) {
    // add alpha value if provided
    let a = values[3];
    return [r, g, b, a]
  }
  return [r, g, b]
};

var hslToRgb_1 = hslToRgb;

/**
 * Converts HSV color values to RGB color values.
 *
 * @see http://en.wikipedia.org/wiki/HSV_color_space.
 * @param {Array} values - HSV color values
 * @return {Array} RGB color values
 * @alias module:color.hsvToRgb
 *
 * @example
 * let mysphere = color(hsvToRgb([0.9166666666666666, 1, 1]), sphere())
 */
const hsvToRgb = (values) => {
  if (!Array.isArray(values)) throw new Error('values must be an array')
  if (values.length < 3) throw new Error('values must contain H, S and V values')

  let h = values[0];
  let s = values[1];
  let v = values[2];

  let r = 0;
  let g = 0;
  let b = 0;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break
    case 1:
      r = q;
      g = v;
      b = p;
      break
    case 2:
      r = p;
      g = v;
      b = t;
      break
    case 3:
      r = p;
      g = q;
      b = v;
      break
    case 4:
      r = t;
      g = p;
      b = v;
      break
    case 5:
      r = v;
      g = p;
      b = q;
      break
  }

  if (values.length > 3) {
    // add alpha value if provided
    let a = values[3];
    return [r, g, b, a]
  }
  return [r, g, b]
};

var hsvToRgb_1 = hsvToRgb;

/**
 * Convert the given RGB color values to CSS color notation (string)
 * @see https://www.w3.org/TR/css-color-3/
 * @param {Array} values - RGB color values
 * @return {String} CSS color notation
 * @alias module:color.rgbToHex
 */
const rgbToHex = (values) => {
  if (!Array.isArray(values)) throw new Error('values must be an array')
  if (values.length < 3) throw new Error('values must contain R, G and B values')

  let r = values[0] * 255;
  let g = values[1] * 255;
  let b = values[2] * 255;

  let s = `#${Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1, 7)}`;

  if (values.length > 3) {
    // convert alpha to opacity
    s = s + Number(values[3] * 255).toString(16);
  }
  return s
};

var rgbToHex_1 = rgbToHex;

/**
 * Converts an RGB color value to HSL.
 *
 * @see http://en.wikipedia.org/wiki/HSL_color_space.
 * @see http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * @param {Number[]} values - RGB color values
 * @return {Number[]} HSL color values
 * @alias module:color.rgbToHsl
 */
const rgbToHsl = (values) => {
  if (!Array.isArray(values)) throw new Error('values must be an array')
  if (values.length < 3) throw new Error('values must contain R, G and B values')

  let r = values[0];
  let g = values[1];
  let b = values[2];

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break
      case g:
        h = (b - r) / d + 2;
        break
      case b:
        h = (r - g) / d + 4;
        break
    }
    h /= 6;
  }

  if (values.length > 3) {
    // add alpha value if provided
    let a = values[3];
    return [h, s, l, a]
  }
  return [h, s, l]
};

var rgbToHsl_1 = rgbToHsl;

/**
 * Converts an RGB color value to HSV.
 *
 * @see http://en.wikipedia.org/wiki/HSV_color_space.
 * @param {Number[]} values - RGB color values
 * @return {Number[]} HSV color values
 * @alias module:color.rgbToHsv
 */
const rgbToHsv = (values) => {
  if (!Array.isArray(values)) throw new Error('values must be an array')
  if (values.length < 3) throw new Error('values must contain R, G and B values')

  let r = values[0];
  let g = values[1];
  let b = values[2];

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h;
  let s;
  let v = max;

  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break
      case g:
        h = (b - r) / d + 2;
        break
      case b:
        h = (r - g) / d + 4;
        break
    }
    h /= 6;
  }

  if (values.length > 3) {
    // add alpha if provided
    let a = values[3];
    return [h, s, v, a]
  }
  return [h, s, v]
};

var rgbToHsv_1 = rgbToHsv;

/**
 * @module color
 */
var color$1 = {
  color: color_1,
  colorNameToRgb: colorNameToRgb_1,
  cssColors: cssColors_1,
  hexToRgb: hexToRgb_1,
  hslToRgb: hslToRgb_1,
  hsvToRgb: hsvToRgb_1,
  hueToColorComponent: hueToColorComponent_1,
  rgbToHex: rgbToHex_1,
  rgbToHsl: rgbToHsl_1,
  rgbToHsv: rgbToHsv_1
};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
const create = () => {
  return new Float32Array(3) // 0, 0, 0
};

var create_1 = create;

/**
 * Calculates the absolute value of the give vector
 *
 * @param {vec3} [out] - receiving vector
 * @param {vec3} vec - given value
 * @returns {vec3} absolute value of the vector
 */
const abs = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  out[0] = Math.abs(vec[0]);
  out[1] = Math.abs(vec[1]);
  out[2] = Math.abs(vec[2]);
  return out
};

var abs_1 = abs;

/**
 * Adds two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const add = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out
};

var add_1 = add;

/**
 * Normalize a vec3
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - vector to normalize
 * @returns {vec3} out
 */
const normalize = (...params) => {
  let a;
  let out;
  if (params.length === 1) {
    a = params[0];
    out = create_1();
  } else {
    out = params[0];
    a = params[1];
  }
  const x = a[0];
  const y = a[1];
  const z = a[2];
  let len = x * x + y * y + z * z;
  if (len > 0) {
    // TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out
};

var normalize_1 = normalize;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {Number} dot product of a and b
 */
const dot = (a, b) => {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
};

var dot_1 = dot;

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {Number} the angle in radians
 */
const angle = (a, b) => {
  const tempA = normalize_1(a);
  const tempB = normalize_1(b);

  const cosine = dot_1(tempA, tempB);
  return cosine > 1.0 ? 0 : Math.acos(cosine)
};

var angle_1 = angle;

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x - X component
 * @param {Number} y - Y component
 * @param {Number} z - Z component
 * @returns {vec3} a new 3D vector
 */
const fromValues = (x, y, z) => {
  const out = create_1();
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out
};

var fromValues_1 = fromValues;

/** The resolution of space, currently one hundred nanometers.
 *  This should be 1 / EPS.
 * @default
 */
const spatialResolution = 1e5;

/** Epsilon used during determination of near zero distances.
 *  This should be 1 / spacialResolution.
 * @default
 */
const EPS = 1e-5;

var constants = {
  EPS,
  spatialResolution
};

const { spatialResolution: spatialResolution$1 } = constants;

// Quantize values for use in spatial coordinates, and so on.
const quantizeForSpace = (value) => (Math.round(value * spatialResolution$1) / spatialResolution$1);

var quantizeForSpace_1 = quantizeForSpace;

const canonicalize = (vector) => fromValues_1(quantizeForSpace_1(vector[0]),
                                            quantizeForSpace_1(vector[1]),
                                            vector[2] === undefined ? 0 : quantizeForSpace_1(vector[2]));

var canonicalize_1 = canonicalize;

/**
 * Create a clone of the given vector
 *
 * @param {vec3} [out] - receiving vector
 * @param {vec3} vec - vector to clone
 * @returns {vec3} clone of the vector
 */
const clone = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  out[0] = vec[0];
  out[1] = vec[1];
  out[2] = vec[2];
  return out
};

var clone_1 = clone;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const cross = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];

  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out
};

var cross_1 = cross;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {Number} distance between a and b
 */
const distance = (a, b) => {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  const z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z)
};

var distance_1 = distance;

/**
 * Divides two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const divide = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out
};

var divide_1 = divide;

const equals = (a, b) => {
  return (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2])
};

var equals_1 = equals;

/**
 * Creates a new vec3 initialized with the values in the given array
 * @param {Number[]} data - array of numerical values
 * @returns {vec3} a new 3D vector
 */
const fromArray = (data) => {
  const out = create_1();
  out[0] = data[0];
  out[1] = data[1];
  out[2] = data[2];
  return out
};

var fromArray_1 = fromArray;

/** create a vec3 from a single scalar value
 * all components of the resulting vec3 have the value of the
 * input scalar
 * @param  {Float} scalar
 * @returns {Vec3}
 */
const fromScalar = (scalar) => {
  return fromValues_1(scalar, scalar, scalar)
};

var fromScalar_1 = fromScalar;

// extend to a 3D vector by adding a z coordinate:
const fromVector2 = (vec2, z = 0) => {
  return fromValues_1(vec2[0], vec2[1], z)
};

var fromVec2 = fromVector2;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a - vector to calculate length of
 * @returns {Number} length of a
 */
const length = (a) => {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return Math.sqrt(x * x + y * y + z * z)
};

var length_1 = length;

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {Number} t - interpolant (0.0 to 1.0) applied between the two inputs
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const lerp = (...params) => {
  let out;
  let t;
  let a;
  let b;
  if (params.length === 3) {
    out = create_1();
    t = params[0];
    a = params[1];
    b = params[2];
  } else {
    out = params[0];
    t = params[1];
    a = params[2];
    b = params[3];
  }
  out[0] = a[0] + t * (b[0] - a[0]);
  out[1] = a[1] + t * (b[1] - a[1]);
  out[2] = a[2] + t * (b[2] - a[2]);
  return out
};

var lerp_1 = lerp;

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const max = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out
};

var max_1 = max;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const min = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out
};

var min_1 = min;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const multiply = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out
};

var multiply_1 = multiply;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - vector to negate
 * @returns {vec3} out
 */
const negate = (...params) => {
  let out;
  let a;
  if (params.length === 1) {
    out = create_1();
    a = params[0];
  } else {
    out = params[0];
    a = params[1];
  }
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out
};

var negate_1 = negate;

// find a vector that is somewhat perpendicular to this one
const random = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  abs_1(out, vec);
  if ((out[0] <= out[1]) && (out[0] <= out[2])) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
  } else if ((out[1] <= out[0]) && (out[1] <= out[2])) {
    out[0] = 0;
    out[1] = 1;
    out[2] = 0;
  } else {
    out[0] = 0;
    out[1] = 0;
    out[2] = 1;
  }
  return out
};

var random_1 = random;

/**
 * Rotate vector 3D vector around the x-axis
 * @param {vec3} [out] - the receiving vec3
 * @param {Number} angle - the angle of rotation
 * @param {vec3} origin - the origin of the rotation
 * @param {vec3} vector - the vec3 point to rotate
 * @returns {vec3} out
 */
const rotateX = (...params) => {
  let out;
  let angle;
  let vector;
  let origin;
  if (params.length === 3) {
    out = create_1();
    angle = params[0];
    origin = params[1];
    vector = params[2];
  } else {
    out = params[0];
    angle = params[1];
    origin = params[2];
    vector = params[3];
  }
  const p = [];
  const r = [];

  // translate point to the origin
  p[0] = vector[0] - origin[0];
  p[1] = vector[1] - origin[1];
  p[2] = vector[2] - origin[2];

  // perform rotation
  r[0] = p[0];
  r[1] = p[1] * Math.cos(angle) - p[2] * Math.sin(angle);
  r[2] = p[1] * Math.sin(angle) + p[2] * Math.cos(angle);

  // translate to correct position
  out[0] = r[0] + origin[0];
  out[1] = r[1] + origin[1];
  out[2] = r[2] + origin[2];

  return out
};

var rotateX_1 = rotateX;

/**
 * Rotate vector 3D vector around the y-axis
 * @param {vec3} [out] - the receiving vec3
 * @param {Number} angle - the angle of rotation
 * @param {vec3} origin - the origin of the rotation
 * @param {vec3} vector - the vec3 point to rotate
 * @returns {vec3} out
 */
const rotateY = (...params) => {
  let out;
  let angle;
  let vector;
  let origin;
  if (params.length === 3) {
    out = create_1();
    angle = params[0];
    origin = params[1];
    vector = params[2];
  } else {
    out = params[0];
    angle = params[1];
    origin = params[2];
    vector = params[3];
  }
  const p = [];
  const r = [];

  // translate point to the origin
  p[0] = vector[0] - origin[0];
  p[1] = vector[1] - origin[1];
  p[2] = vector[2] - origin[2];

  // perform rotation
  r[0] = p[2] * Math.sin(angle) + p[0] * Math.cos(angle);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(angle) - p[0] * Math.sin(angle);

  // translate to correct position
  out[0] = r[0] + origin[0];
  out[1] = r[1] + origin[1];
  out[2] = r[2] + origin[2];

  return out
};

var rotateY_1 = rotateY;

/**
 * Rotate vector 3D vector around the z-axis
 * @param {vec3} [out] - the receiving vec3
 * @param {Number} angle - the angle of rotation in radians
 * @param {vec3} origin - the origin of the rotation
 * @param {vec3} vector - the vec3 point to rotate
 * @returns {vec3} out
 */
const rotateZ = (...params) => {
  let out;
  let angle;
  let vector;
  let origin;
  if (params.length === 3) {
    out = create_1();
    angle = params[0];
    origin = params[1];
    vector = params[2];
  } else {
    out = params[0];
    angle = params[1];
    origin = params[2];
    vector = params[3];
  }
  const p = [];
  const r = [];
  // Translate point to the origin
  p[0] = vector[0] - origin[0];
  p[1] = vector[1] - origin[1];

  // perform rotation
  r[0] = (p[0] * Math.cos(angle)) - (p[1] * Math.sin(angle));
  r[1] = (p[0] * Math.sin(angle)) + (p[1] * Math.cos(angle));

  // translate to correct position
  out[0] = r[0] + origin[0];
  out[1] = r[1] + origin[1];
  out[2] = vector[2];

  return out
};

var rotateZ_1 = rotateZ;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} [out] - the receiving vector
 * @param {Number} amount - amount to scale the vector by
 * @param {vec3} vector - the vector to scale
 * @returns {vec3} out
 */
const scale = (...params) => {
  let out;
  let vector;
  let amount;
  if (params.length === 2) {
    out = create_1();
    amount = params[0];
    vector = params[1];
  } else {
    out = params[0];
    amount = params[1];
    vector = params[2];
  }
  out[0] = vector[0] * amount;
  out[1] = vector[1] * amount;
  out[2] = vector[2] * amount;
  return out
};

var scale_1 = scale;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {Number} squared distance between a and b
 */
const squaredDistance = (a, b) => {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  const z = b[2] - a[2];
  return x * x + y * y + z * z
};

var squaredDistance_1 = squaredDistance;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a - vector to calculate squared length of
 * @returns {Number} squared length of a
 */
const squaredLength = (a) => {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return x * x + y * y + z * z
};

var squaredLength_1 = squaredLength;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} [out] - the receiving vector
 * @param {vec3} a - the first operand
 * @param {vec3} b - the second operand
 * @returns {vec3} out
 */
const subtract = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out
};

var subtract_1 = subtract;

const toString = (vec) => {
  return `[${vec[0].toFixed(7)}, ${vec[1].toFixed(7)}, ${vec[2].toFixed(7)}]`
};

var toString_1 = toString;

/**
 * Transforms the given vec3 with the given mat4.
 * 4th vector component is implicitly '1'
 * @param {vec3} [out] - the receiving vector
 * @param {mat4} matrix - the transform matrix
 * @param {vec3} vector - the vector to transform
 * @returns {vec3} the transformed vector
 */
const transform = (...params) => {
  let out;
  let vector;
  let matrix;
  if (params.length === 2) {
    out = create_1();
    matrix = params[0];
    vector = params[1];
  } else {
    out = params[0];
    matrix = params[1];
    vector = params[2];
  }

  const x = vector[0];
  const y = vector[1];
  const z = vector[2];
  let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  w = w || 1.0;
  out[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w;
  out[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w;
  out[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w;
  return out
};

var transform_1 = transform;

/**
 * Calculates the unit vector of the given vector
 *
 * @param {vec3} [out] - the optional receiving vector
 * @param {vec3} vector - the base vector for calculations
 * @returns {vec3} unit vector of the given vector
 */
const unit = (...params) => {
  let out;
  let vector;
  if (params.length === 1) {
    out = create_1();
    vector = params[0];
  } else {
    out = params[0];
    vector = params[1];
  }
  const magnitude = length_1(vector); // calculate the magnitude
  out[0] = vector[0] / magnitude;
  out[1] = vector[1] / magnitude;
  out[2] = vector[2] / magnitude;
  return out
};

var unit_1 = unit;

var vec3 = {
  abs: abs_1,
  add: add_1,
  angle: angle_1,
  canonicalize: canonicalize_1,
  clone: clone_1,
  create: create_1,
  cross: cross_1,
  distance: distance_1,
  divide: divide_1,
  dot: dot_1,
  equals: equals_1,
  fromArray: fromArray_1,
  fromScalar: fromScalar_1,
  fromValues: fromValues_1,
  fromVec2: fromVec2,
  length: length_1,
  lerp: lerp_1,
  max: max_1,
  min: min_1,
  multiply: multiply_1,
  negate: negate_1,
  normalize: normalize_1,
  random: random_1,
  rotateX: rotateX_1,
  rotateY: rotateY_1,
  rotateZ: rotateZ_1,
  scale: scale_1,
  squaredDistance: squaredDistance_1,
  squaredLength: squaredLength_1,
  subtract: subtract_1,
  toString: toString_1,
  transform: transform_1,
  unit: unit_1
};

/**
 * Create a new connector.
 * A connector allows two objects to be connected at predefined positions.
 *
 * For example a servo motor and a servo horn can both have a connector called 'shaft'.
 * The horn can be moved and rotated to any position, and then the servo horn
 * is attached to the servo motor at the proper position, such that the two connectors match.
 * Connectors are children of the solid, transform-wise, so transformations are applied
 * to both solid and connector(s).  (parent => child relationship)
 *
 * @property {vec3} point - the position of the connector (relative to its parent)
 * @property {vec3} axis - the direction (unit vector) of the connector
 * @property {vec3} normal - the direction (unit vector) perpendicular to axis, that defines the "12 o'clock" orientation of the connector
 * @example
 * let myconnector = create()
 */
const create$1 = () => {
  return {
    point: vec3.create(),
    axis: vec3.unit([0, 0, 1]),
    normal: vec3.unit([1, 0, 0])
  }
};

var create_1$1 = create$1;

/**
 * Create a connector from the given point, axis and normal.
 * @param {vec3} point - the point of the connector, relative to the parent geometry
 * @param {vec3} axis - the axis (directional vector) of the connector
 * @param {vec3} normal - the normal (directional vector) of the connector, perpendicular to the axis
 * @returns {connector} a new connector
 */
const fromPointAxisNormal = (point, axis, normal) => {
  let connector = create_1$1();
  connector.point = vec3.fromArray(point);
  connector.axis = vec3.unit(axis);
  connector.normal = vec3.unit(normal);
  return connector
};

var fromPointAxisNormal_1 = fromPointAxisNormal;

/**
 * Return a string representing the given connector.
 *
 * @param {connector} connector - the connector of reference
 * @returns {string} string representation
 */
const toString$1 = (connector) => {
  const point = connector.point;
  const axis = connector.axis;
  const normal = connector.normal;
  return `connector: point: [${point[0].toFixed(7)}, ${point[1].toFixed(7)}, ${point[2].toFixed(7)}],  axis: [${axis[0].toFixed(7)}, ${axis[1].toFixed(7)}, ${axis[2].toFixed(7)}], normal: [${normal[0].toFixed(7)}, ${normal[1].toFixed(7)}, ${normal[2].toFixed(7)}]`
};

var toString_1$1 = toString$1;

/**
 * Transform the give connector using the given matrix.
 * @param {mat4} matrix - a transform matrix
 * @param {connector} connector - the connector to transform
 * @returns {connector} a new connector
 */
const transform$1 = (matrix, connector) => {
  const newpoint = vec3.transform(matrix, connector.point);
  const newaxis = vec3.subtract(
    vec3.transform(matrix, vec3.add(connector.point, connector.axis)),
    newpoint
  );
  const newnormal = vec3.subtract(
    vec3.transform(matrix, vec3.add(connector.point, connector.normal)),
    newpoint
  );
  return fromPointAxisNormal_1(newpoint, newaxis, newnormal)
};

var transform_1$1 = transform$1;

/**
 * Represents a unbounded line in 2D space, positioned at a point of origin.
 * A line is parametrized by its normal vector (perpendicular to the line, rotated 90 degrees counter clockwise)
 * and w. The line passes through the point of origin, i.e. scale(w, <normal>).
 * Equation: a point (P) is on line (L) if dot(L.normal, P) == L.w
*/

/**
 * Create a unbounded 2D line, positioned at 0,0, and running along the X axis.
 *
 * @returns {line2} a new unbounded 2D line
 */
const create$2 = () => {
  const out = new Float32Array(3);
  out[0] = 0; // normal
  out[1] = 1;
  out[2] = 0; // distance
  return out
};

var create_1$2 = create$2;

/**
 * Create a clone of the given 2D line.
 *
 * @param {line2} [out] - receiving line
 * @param {line2} line - line to clone
 * @returns {line2} clone of the line
 */
const clone$1 = (...params) => {
  let out;
  let line;
  if (params.length === 1) {
    out = create_1$2();
    line = params[0];
  } else {
    out = params[0];
    line = params[1];
  }
  out[0] = line[0];
  out[1] = line[1];
  out[2] = line[2];
  return out
};

var clone_1$1 = clone$1;

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
const create$3 = () => {
  return new Float32Array(2) // 0, 0
};

var create_1$3 = create$3;

/**
 * Calculates the absolute value of the give vector
 *
 * @param {vec2} [out] - receiving vector
 * @param {vec2} vec - given value
 * @returns {vec2} absolute value of the vector
 */
const abs$1 = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1$3();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  out[0] = Math.abs(vec[0]);
  out[1] = Math.abs(vec[1]);
  return out
};

var abs_1$1 = abs$1;

/**
 * Adds two vec2's
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const add$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$3();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out
};

var add_1$1 = add$1;

const angleRadians = (vector) => {
  // y=sin, x=cos
  return Math.atan2(vector[1], vector[0])
};

var angleRadians_1 = angleRadians;

var angle$1 = angleRadians_1;

/*
 * Calculate the area under the given points
 */
const area = (points) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    let j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return (area / 2.0)
};

var area_1 = area;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

var clamp_1 = clamp;

// radians = degrees * PI / 180
const degToRad = degrees => degrees * 0.017453292519943295;

var degToRad_1 = degToRad;

/*
 * Calculate the intersect point of the two line segments (p1-p2 and p3-p4), end points included.
 * Note: If the line segments do NOT intersect then undefined is returned.
 * @see http://paulbourke.net/geometry/pointlineplane/
 * @param {vec2} p1 - first point of first line segment
 * @param {vec2} p2 - second point of first line segment
 * @param {vec2} p3 - first point of second line segment
 * @param {vec2} p4 - second point of second line segment
 * @returns {vec2} intersection point of the two line segments, or undefined
 */
const intersect = (p1, p2, p3, p4) => {
  // Check if none of the lines are of length 0
  if ((p1[0] === p2[0] && p1[1] === p2[1]) || (p3[0] === p4[0] && p3[1] === p4[1])) {
    return undefined
  }

  let denominator = ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]));

  // Lines are parallel
  if (Math.abs(denominator) < Number.MIN_VALUE) {
    return undefined
  }

  let ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denominator;
  let ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return undefined
  }

  // Return the x and y coordinates of the intersection
  let x = p1[0] + ua * (p2[0] - p1[0]);
  let y = p1[1] + ua * (p2[1] - p1[1]);

  return [x, y]
};

var intersect_1 = intersect;

// degrees = radians * 180 / PI
const radToDeg = radians => radians * 57.29577951308232;

var radToDeg_1 = radToDeg;

const solve2Linear = function (a, b, c, d, u, v) {
  let det = a * d - b * c;
  let invdet = 1.0 / det;
  let x = u * d - b * v;
  let y = -u * c + a * v;
  x *= invdet;
  y *= invdet;
  return [x, y]
};

var solve2Linear_1 = solve2Linear;

var utils = {
  area: area_1,
  clamp: clamp_1,
  degToRad: degToRad_1,
  intersect: intersect_1,
  radToDeg: radToDeg_1,
  solve2Linear: solve2Linear_1
};

const { radToDeg: radToDeg$1 } = utils;

const angleDegrees = vector => {
  return radToDeg$1(angleRadians_1(vector))
};

var angleDegrees_1 = angleDegrees;

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
const fromValues$1 = (x, y) => {
  const out = create_1$3();
  out[0] = x;
  out[1] = y;
  return out
};

var fromValues_1$1 = fromValues$1;

const canonicalize$1 = (vector) => fromValues_1$1(quantizeForSpace_1(vector[0]),
                                            quantizeForSpace_1(vector[1]));

var canonicalize_1$1 = canonicalize$1;

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} [out] - receiving vector
 * @param {vec2} vec - given vector to clone
 * @returns {vec2} clone of the vector
 */
const clone$2 = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1$3();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  out[0] = vec[0];
  out[1] = vec[1];
  return out
};

var clone_1$2 = clone$2;

/**
 * Computes the cross product (3D) of two 2D vectors
 *
 * @param {vec3} [out] - the receiving vec3
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec3} cross product
 */
const cross$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = vec3.create();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = 0;
  out[1] = 0;
  out[2] = a[0] * b[1] - a[1] * b[0];
  // alternative return vec3.cross(out, vec3.fromVec2(a), vec3.fromVec2(b))
  return out
};

var cross_1$1 = cross$1;

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
const distance$1 = (a, b) => {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return Math.sqrt(x * x + y * y)
};

var distance_1$1 = distance$1;

/**
 * Divides two vec2's
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const divide$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$3();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out
};

var divide_1$1 = divide$1;

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
const dot$1 = (a, b) => {
  return a[0] * b[0] + a[1] * b[1]
};

var dot_1$1 = dot$1;

const equals$1 = (a, b) => {
  return (a[0] === b[0]) && (a[1] === b[1])
};

var equals_1$1 = equals$1;

const fromAngleRadians = (radians) => {
  return fromValues_1$1(Math.cos(radians), Math.sin(radians))
};

var fromAngleRadians_1 = fromAngleRadians;

// this is just an alias
var fromAngle = fromAngleRadians_1;

const fromAngleDegrees = (degrees) => {
  const radians = Math.PI * degrees / 180;
  return fromValues_1$1(Math.cos(radians), Math.sin(radians))
};

var fromAngleDegrees_1 = fromAngleDegrees;

/**
 * Creates a new vec2 initialized with the values in the given array
 * @param {Number[]} data - array of numerical values
 * @returns {vec2} a new 2D vector
 */
const fromArray$1 = (data) => {
  const out = create_1$3();
  out[0] = data[0];
  out[1] = data[1];
  return out
};

var fromArray_1$1 = fromArray$1;

/** Create a vec2 from a single scalar value
 * @param  {Float} scalar
 * @returns {Vec2} a new vec2
 */
const fromScalar$1 = (scalar) => {
  return fromValues_1$1(scalar, scalar)
};

var fromScalar_1$1 = fromScalar$1;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
const length$1 = (a) => {
  const x = a[0];
  const y = a[1];
  return Math.sqrt(x * x + y * y)
};

var length_1$1 = length$1;

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} [out] - the receiving vector
 * @param {Number} t - interpolation amount between the two inputs
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const lerp$1 = (...params) => {
  let out;
  let t;
  let a;
  let b;
  if (params.length === 3) {
    out = create_1$3();
    t = params[0];
    a = params[1];
    b = params[2];
  } else {
    out = params[0];
    t = params[1];
    a = params[2];
    b = params[3];
  }
  const ax = a[0];
  const ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out
};

var lerp_1$1 = lerp$1;

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const max$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$3();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out
};

var max_1$1 = max$1;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const min$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$3();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out
};

var min_1$1 = min$1;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const multiply$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$3();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out
};

var multiply_1$1 = multiply$1;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - vector to negate
 * @returns {vec2} out
 */
const negate$1 = (...params) => {
  let out;
  let a;
  if (params.length === 1) {
    out = create_1$3();
    a = params[0];
  } else {
    out = params[0];
    a = params[1];
  }
  out[0] = -a[0];
  out[1] = -a[1];
  return out
};

var negate_1$1 = negate$1;

/**
 * Rotates a vec2 by an angle
 *
 * @param {vec2} [out] - the receiving vector
 * @param {Number} angle - the angle of rotation (in radians)
 * @param {vec2} vector - the vector to rotate
 * @returns {vec2} out
 */
const rotate = (...params) => {
  let out;
  let vector;
  let angle;
  if (params.length === 2) {
    out = create_1$3();
    angle = params[0];
    vector = params[1];
  } else {
    out = params[0];
    angle = params[1];
    vector = params[2];
  }

  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const x = vector[0];
  const y = vector[1];

  out[0] = x * c - y * s;
  out[1] = x * s + y * c;

  return out
};

var rotate_1 = rotate;

/**
 * Calculates the normal value of the give vector
 * The normal value is the given vector rotated 90 degress.
 *
 * @param {vec2} [out] - receiving vector
 * @param {vec2} vec - given value
 * @returns {vec2} normal value of the vector
 */
const normal = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    vec = params[0];
    return rotate_1((Math.PI / 2), vec)
  }
  out = params[0];
  vec = params[1];
  return rotate_1(out, (Math.PI / 2), vec)
};
// old : Vector2D.Create(this._y, -this._x)

var normal_1 = normal;

/**
 * Normalize the given vector.
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - vector to normalize
 * @returns {vec2} normalized (unit) vector
 */
const normalize$1 = (...params) => {
  let a;
  let out;
  if (params.length === 1) {
    out = create_1$3();
    a = params[0];
  } else {
    out = params[0];
    a = params[1];
  }
  const x = a[0];
  const y = a[1];
  let len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
  }
  return out
};

// old this.dividedBy(this.length())

var normalize_1$1 = normalize$1;

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} [out] - the receiving vector
 * @param {Number} amount - amount to scale the vector by
 * @param {vec2} vector - the vector to scale
 * @returns {vec2} out
 */
const scale$1 = (...params) => {
  let out;
  let vector;
  let amount;
  if (params.length === 2) {
    out = create_1$3();
    amount = params[0];
    vector = params[1];
  } else {
    out = params[0];
    amount = params[1];
    vector = params[2];
  }
  out[0] = vector[0] * amount;
  out[1] = vector[1] * amount;
  return out
};

var scale_1$1 = scale$1;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
const squaredDistance$1 = (a, b) => {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return x * x + y * y
};

var squaredDistance_1$1 = squaredDistance$1;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
const squaredLength$1 = (a) => {
  const x = a[0];
  const y = a[1];
  return x * x + y * y
};

var squaredLength_1$1 = squaredLength$1;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} [out] - the receiving vector
 * @param {vec2} a - the first operand
 * @param {vec2} b - the second operand
 * @returns {vec2} out
 */
const subtract$1 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$3();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out
};

var subtract_1$1 = subtract$1;

const toString$2 = (vec) => {
  return `[${vec[0].toFixed(7)}, ${vec[1].toFixed(7)}]`
};

var toString_1$2 = toString$2;

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} [out] - the receiving vector
 * @param {mat4} matrix - matrix to transform with
 * @param {vec2} vector - the vector to transform
 * @returns {vec2} out
 */
const transform$2 = (...params) => {
  let out;
  let matrix;
  let vector;
  if (params.length === 2) {
    out = create_1$3();
    matrix = params[0];
    vector = params[1];
  } else {
    out = params[0];
    matrix = params[1];
    vector = params[2];
  }
  const x = vector[0];
  const y = vector[1];
  out[0] = matrix[0] * x + matrix[4] * y + matrix[12];
  out[1] = matrix[1] * x + matrix[5] * y + matrix[13];
  return out
};

var transform_1$2 = transform$2;

var vec2 = {
  abs: abs_1$1,
  add: add_1$1,
  angle: angle$1,
  angleDegrees: angleDegrees_1,
  angleRadians: angleRadians_1,
  canonicalize: canonicalize_1$1,
  clone: clone_1$2,
  create: create_1$3,
  cross: cross_1$1,
  distance: distance_1$1,
  divide: divide_1$1,
  dot: dot_1$1,
  equals: equals_1$1,
  fromAngle: fromAngle,
  fromAngleDegrees: fromAngleDegrees_1,
  fromAngleRadians: fromAngleRadians_1,
  fromArray: fromArray_1$1,
  fromScalar: fromScalar_1$1,
  fromValues: fromValues_1$1,
  length: length_1$1,
  lerp: lerp_1$1,
  max: max_1$1,
  min: min_1$1,
  multiply: multiply_1$1,
  negate: negate_1$1,
  normal: normal_1,
  normalize: normalize_1$1,
  rotate: rotate_1,
  scale: scale_1$1,
  squaredDistance: squaredDistance_1$1,
  squaredLength: squaredLength_1$1,
  subtract: subtract_1$1,
  toString: toString_1$2,
  transform: transform_1$2
};

/**
 * Return the direction of the given line.
 *
 * @param {line2} line - the 2D line for calculations
 * @return {vec2} a new relative vector in the direction of the line
 */
const direction = (line) => {
  const vector = vec2.normal(line);
  vec2.negate(vector, vector);
  return vector
};

var direction_1 = direction;

/**
 * Return the origin of the given line.
 *
 * @param {line2} line the 2D line of reference
 * @return {vec2} the origin of the line
 */
const origin = (line) => {
  const point = vec2.scale(line[2], line);
  return point
};

var origin_1 = origin;

/**
 * Determine the closest point on the given line to the given point.
 * Thanks to @khrismuc
 *
 * @param {vec2} point the point of reference
 * @param {line2} line the 2D line for calculations
 * @returns {vec2} a new point
 */
const closestPoint = (point, line) => {
  // linear function of AB
  const a = origin_1(line);
  const b = direction_1(line);
  const m1 = (b[1] - a[1]) / (b[0] - a[0]);
  const t1 = a[1] - m1 * a[0];
  // linear function of PC
  const m2 = -1 / m1; // perpendicular
  const t2 = point[1] - m2 * point[0];
  // c.x * m1 + t1 === c.x * m2 + t2
  const x = (t2 - t1) / (m1 - m2);
  const y = m1 * x + t1;

  const closest = vec2.fromValues(x, y);
  return closest
};

var closestPoint_1 = closestPoint;

/**
 * Calculate the distance (positive) between the given point and line
 *
 * @param {vec2} point the point of reference
 * @param {line2} line the 2D line of reference
 * @return {Number} distance between line and point
 */
const distanceToPoint = (point, line) => {
  let distance = vec2.dot(point, line);
  distance = Math.abs(distance - line[2]);
  return distance
};

var distanceToPoint_1 = distanceToPoint;

/**
 * Compare the given 2D lines for equality
 *
 * @param {line2} a - the first line to compare
 * @param {line2} b - the second line to compare
 * @return {boolean} true if lines are equal
 */
const equals$2 = (line1, line2) => {
  return (line1[0] === line2[0]) && (line1[1] === line2[1] && (line1[2] === line2[2]))
};

var equals_1$2 = equals$2;

/**
 * Creates a new unbounded 2D line initialized with the given values.
 *
 * @param {Number} x X coordinate of the unit normal
 * @param {Number} y Y coordinate of the unit normal
 * @param {Number} w length (positive) of the normal segment
 * @returns {line2} a new unbounded 2D line
 */
const fromValues$2 = (x, y, w) => {
  const out = create_1$2();
  out[0] = x;
  out[1] = y;
  out[2] = w;
  return out
};

var fromValues_1$2 = fromValues$2;

/**
 * Create a new 2D line that passes through the given points
 *
 * @param {vec2} p1 start point of the 2D line
 * @param {vec2} p2 end point of the 2D line
 * @returns {line2} a new unbounded 2D line
 */
const fromPoints = (p1, p2) => {
  const vector = vec2.subtract(p2, p1); // directional vector

  vec2.normal(vector, vector);
  vec2.normalize(vector, vector); // normalized

  const distance = vec2.dot(p1, vector);

  return fromValues_1$2(vector[0], vector[1], distance)
};

var fromPoints_1 = fromPoints;

const { solve2Linear: solve2Linear$1 } = utils;

/**
 * Return the point of intersection between the given lines.
 *
 * The point will have Infinity values if the lines are paralell.
 * The point will have NaN values if the lines are the same.
 *
 * @param {line2} line1 a 2D line for reference
 * @param {line2} line2 a 2D line for reference
 * @return {vec2} the point of intersection
 */
const intersectToLine = (line1, line2) => {
  const point = solve2Linear$1(line1[0], line1[1], line2[0], line2[1], line1[2], line2[2]);
  return vec2.clone(point)
};

var intersectPointOfLines = intersectToLine;

/**
 * Create a new line in the opposite direction as the given.
 *
 * @param {line2} [out] - receiving line
 * @param {line2} line the 2D line to reverse
 * @returns {line2} a new unbounded 2D line
 */
const reverse = (...params) => {
  let out;
  let line;
  if (params.length === 1) {
    out = create_1$2();
    line = params[0];
  } else {
    out = params[0];
    line = params[1];
  }

  const normal = vec2.negate(line);
  const distance = -line[2];
  return clone_1$1(out, fromValues_1$2(normal[0], normal[1], distance))
};

var reverse_1 = reverse;

/**
 * Return a string representing the given line.
 *
 * @param {line2} line the 2D line of reference
 * @returns {string} string representation
 */
const toString$3 = (line) => {
  return `line2: (${line[0].toFixed(7)}, ${line[1].toFixed(7)}, ${line[2].toFixed(7)})`
  // return `line2: (${line[0]}, ${line[1]}, ${line[2]})`
};

var toString_1$3 = toString$3;

/**
 * Transforms the given 2D line using the given matrix.
 *
 * @param {line2} [out] - receiving line
 * @param {mat4} matrix matrix to transform with
 * @param {line2} line the 2D line to transform
 * @returns {line2} a new unbounded 2D line
 */
const transform$3 = (...params) => {
  let out;
  let matrix;
  let line;
  if (params.length === 2) {
    out = create_1$2();
    matrix = params[0];
    line = params[1];
  } else {
    out = params[0];
    matrix = params[1];
    line = params[2];
  }

  const org = origin_1(line);
  const dir = direction_1(line);

  vec2.transform(org, matrix, org);
  vec2.transform(dir, matrix, dir);

  return clone_1$1(out, fromPoints_1(org, dir))
};

var transform_1$3 = transform$3;

/**
 * Determine the X coordinate of the given line at the Y coordinate.
 *
 * The X coordinate will be Infinity if the line is parallel to the X axis.
 *
 * @param {Number} y the Y coordinate on the line
 * @param {line2} line the 2D line of reference
 * @return {Number} the X coordinate on the line
 */
const xAtY = (y, line) => {
  // px = (distance - normal.y * y) / normal.x
  let x = (line[2] - (line[1] * y)) / line[0];
  if (Number.isNaN(x)) {
    const org = origin_1(line);
    x = org[0];
  }
  return x
};

var xAtY_1 = xAtY;

var line2 = {
  clone: clone_1$1,
  closestPoint: closestPoint_1,
  create: create_1$2,
  direction: direction_1,
  distanceToPoint: distanceToPoint_1,
  equals: equals_1$2,
  fromPoints: fromPoints_1,
  fromValues: fromValues_1$2,
  intersectPointOfLines: intersectPointOfLines,
  origin: origin_1,
  reverse: reverse_1,
  toString: toString_1$3,
  transform: transform_1$3,
  xAtY: xAtY_1
};

/**
 * Create a line in 3D space from the given data.
 *
 * The point can be any random point on the line.
 * The direction must be a vector with positive or negative distance from the point.
 * See the logic of fromPoints for appropriate values.
 *
 * @param {vec3} point start point of the line segment
 * @param {vec3} direction direction of the line segment
 * @returns {line3} a new unbounded 3D line
 */
const fromPointAndDirection = (point, direction) => {
  const unit = vec3.unit(direction);
  return [point, unit]
};

var fromPointAndDirection_1 = fromPointAndDirection;

/**
 * Create an unbounded 3D line, positioned at 0,0,0 and lying on the X axis.
 *
 * @returns {line3} a new unbounded 3D line
 */
const create$4 = () => {
  const point = vec3.create(); // 0, 0, 0
  const direction = vec3.fromValues(0, 0, 1);
  return fromPointAndDirection_1(point, direction)
};

var create_1$4 = create$4;

/**
 * Create a clone of the given 3D line.
 *
 * @param {line3} [out] - receiving line
 * @param {line3} line - line to clone
 * @returns {line3} clone of the line
 */
const clone$3 = (...params) => {
  let out;
  let line;
  if (params.length === 1) {
    out = create_1$4();
    line = params[0];
  } else {
    out = params[0];
    line = params[1];
  }
  vec3.clone(out[0], line[0]);
  vec3.clone(out[1], line[1]);
  return out
};

var clone_1$3 = clone$3;

/**
 * Determine the closest point on the given line to the given point.
 *
 * @param {vec3} point the point of reference
 * @param {line3} line the 3D line for calculations
 * @returns {vec3} a new point
 */
const closestPoint$1 = (point, line) => {
  const lpoint = line[0];
  const ldirection = line[1];

  const a = vec3.dot(vec3.subtract(point, lpoint), ldirection);
  const b = vec3.dot(ldirection, ldirection);
  const t = a / b;

  const closestpoint = vec3.add(lpoint, vec3.scale(t, ldirection));
  return closestpoint
};

var closestPoint_1$1 = closestPoint$1;

/**
 * Return the direction of the given line.
 *
 * @param {line3} line - the 3D line for calculations
 * @return {vec3} the relative vector in the direction of the line
 */
const direction$1 = (line) => {
  return line[1]
};

var direction_1$1 = direction$1;

/**
 * Calculate the distance (positive) between the given point and line
 *
 * @param {vec3} point the point of reference
 * @param {line3} line the 3D line of reference
 * @return {Number} distance between line and point
 */
const distanceToPoint$1 = (point, line) => {
  const closest = closestPoint_1$1(point, line);
  const distancevector = vec3.subtract(point, closest);
  const distance = vec3.length(distancevector);
  return distance
};

var distanceToPoint_1$1 = distanceToPoint$1;

/**
 * Compare the given 3D lines for equality
 *
 * @param {line3} a - the first line to compare
 * @param {line3} b - the second line to compare
 * @return {boolean} true if lines are equal
 */
const equals$3 = (line1, line2) => {
  // compare directions (unit vectors)
  if (!vec3.equals(line1[1], line2[1])) return false

  // compare points
  if (!vec3.equals(line1[0], line2[0])) return false

  // why would lines with the same slope (direction) and different points be equal?
  // let distance = distanceToPoint(line1, line2[0])
  // if (distance > EPS) return false

  return true
};

var equals_1$3 = equals$3;

const { solve2Linear: solve2Linear$2 } = utils;

const { EPS: EPS$1 } = constants;



const fromPlanes = (plane1, plane2) => {
  let direction = vec3.cross(plane1, plane2);
  let length = vec3.length(direction);
  if (length < EPS$1) {
    throw new Error('parallel planes do not intersect')
  }
  length = (1.0 / length);
  direction = vec3.scale(length, direction);

  const absx = Math.abs(direction[0]);
  const absy = Math.abs(direction[1]);
  const absz = Math.abs(direction[2]);
  let origin;
  let r;
  if ((absx >= absy) && (absx >= absz)) {
    // find a point p for which x is zero
    r = solve2Linear$2(plane1[1], plane1[2], plane2[1], plane2[2], plane1[3], plane2[3]);
    origin = vec3.fromValues(0, r[0], r[1]);
  } else if ((absy >= absx) && (absy >= absz)) {
    // find a point p for which y is zero
    r = solve2Linear$2(plane1[0], plane1[2], plane2[0], plane2[2], plane1[3], plane2[3]);
    origin = vec3.fromValues(r[0], 0, r[1]);
  } else {
    // find a point p for which z is zero
    r = solve2Linear$2(plane1[0], plane1[1], plane2[0], plane2[1], plane1[3], plane2[3]);
    origin = vec3.fromValues(r[0], r[1], 0);
  }
  return fromPointAndDirection_1(origin, direction)
};

var fromPlanes_1 = fromPlanes;

/**
 * Creates a new 3D line that passes through the given points.
 *
 * @param {vec3} p1 start point of the line segment
 * @param {vec3} p2 end point of the line segment
 * @returns {line3} a new unbounded 3D line
 */
const fromPoints$1 = (p1, p2) => {
  const direction = vec3.subtract(p2, p1);
  return fromPointAndDirection_1(p1, direction)
};

var fromPoints_1$1 = fromPoints$1;

/**
 * Determine the closest point on the given plane to the given line.
 *
 * The point of intersection will be invalid if parallel to the plane, e.g. NaN.
 *
 * @param {plane} plane the plane of reference
 * @param {line3} line the 3D line of reference
 * @returns {vec3} a new point
 */
const intersectToPlane = (plane, line) => {
  // plane: plane.normal * p = plane.w
  const pnormal = plane;
  const pw = plane[3];

  const lpoint = line[0];
  const ldirection = line[1];

  // point: p = line.point + labda * line.direction
  const labda = (pw - vec3.dot(pnormal, lpoint)) / vec3.dot(pnormal, ldirection);

  const point = vec3.add(lpoint, vec3.scale(labda, ldirection));
  return point
};

var intersectPointOfLineAndPlane = intersectToPlane;

/**
 * Return the origin of the given line.
 *
 * @param {line3} line the 3D line of reference
 * @return {vec3} the origin of the line
 */
const origin$1 = (line) => {
  return line[0]
};

var origin_1$1 = origin$1;

/**
 * Create a new line in the opposite direction as the given.
 *
 * @param {line3} [out] - receiving line
 * @param {line3} line the 3D line to reverse
 * @returns {line3} a new unbounded 3D line
 */
const reverse$1 = (...params) => {
  let out;
  let line;
  if (params.length === 1) {
    out = create_1$4();
    line = params[0];
  } else {
    out = params[0];
    line = params[1];
  }

  const point = vec3.clone(line[0]);
  const direction = vec3.negate(line[1]);
  return clone_1$3(out, fromPointAndDirection_1(point, direction))
};

var reverse_1$1 = reverse$1;

/**
 * Return a string representing the given line.
 *
 * @param {line3} line the 3D line of reference
 * @returns {string} string representation
 */
const toString$4 = (line) => {
  const point = line[0];
  const unit = line[1];
  return `line3: point: (${point[0].toFixed(7)}, ${point[1].toFixed(7)}, ${point[2].toFixed(7)}) unit: (${unit[0].toFixed(7)}, ${unit[1].toFixed(7)}, ${unit[2].toFixed(7)})`
};

var toString_1$4 = toString$4;

/**
 * Transforms the given 3D line using the given matrix.
 *
 * @param {mat4} matrix matrix to transform with
 * @param {line3} line the 3D line to transform
 * @returns {line3} a new unbounded 3D line
 */
const transform$4 = (...params) => {
  let out;
  let matrix;
  let line;
  if (params.length === 2) {
    out = create_1$4();
    matrix = params[0];
    line = params[1];
  } else {
    out = params[0];
    matrix = params[1];
    line = params[2];
  }

  const point = line[0];
  const direction = line[1];
  const pointPlusDirection = vec3.add(point, direction);

  const newpoint = vec3.transform(matrix, point);
  const newPointPlusDirection = vec3.transform(matrix, pointPlusDirection);
  const newdirection = vec3.subtract(newPointPlusDirection, newpoint);

  return clone_1$3(out, fromPointAndDirection_1(newpoint, newdirection))
};

var transform_1$4 = transform$4;

var line3 = {
  clone: clone_1$3,
  closestPoint: closestPoint_1$1,
  create: create_1$4,
  direction: direction_1$1,
  distanceToPoint: distanceToPoint_1$1,
  equals: equals_1$3,
  fromPlanes: fromPlanes_1,
  fromPointAndDirection: fromPointAndDirection_1,
  fromPoints: fromPoints_1$1,
  intersectPointOfLineAndPlane: intersectPointOfLineAndPlane,
  origin: origin_1$1,
  reverse: reverse_1$1,
  toString: toString_1$4,
  transform: transform_1$4
};

/**
 * Creates a new identity matrix
 *
 * @returns {mat4} a new 4 by 4 matrix
 */
const create$5 = () => {
  const out = new Float32Array(16);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var create_1$5 = create$5;

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
const add$2 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$5();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out
};

var add_1$2 = add$2;

/**
 * Creates a clone of the given matrix
 *
 * @param {mat4} [out] - receiving matrix
 * @param {mat4} matrix - matrix to clone
 * @returns {mat4} clone of the given matrix
 */
const clone$4 = (...params) => {
  let out;
  let a;
  if (params.length == 1) {
    out = create_1$5();
    a = params[0];
  } else {
    out = params[0];
    a = params[1];
  }
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out
};

var clone_1$4 = clone$4;

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a - the first matrix
 * @param {mat4} b - the second matrix
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
const equals$4 = (a, b) => {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
         a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
         a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
         a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15]
};

var equals_1$4 = equals$4;

const EPSILON = 0.000001;

var constants$1 = {
  EPSILON
};

const { EPSILON: EPSILON$1 } = constants$1;

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} [out] - mat4 receiving operation result
 * @param {Number} rad - the angle to rotate the matrix by
 * @param {vec3} axis - the axis to rotate around
 * @returns {mat4} out
 */
const fromRotation = (...params) => {
  let out;
  let rad;
  let axis;

  if (params.length === 2) {
    out = create_1$5();
    rad = params[0];
    axis = params[1];
  } else {
    out = params[0];
    rad = params[1];
    axis = params[2];
  }
  let [x, y, z] = axis;
  let len = Math.sqrt(x * x + y * y + z * z);

  if (Math.abs(len) < EPSILON$1) { return null }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const t = 1 - c;

  // Perform rotation-specific matrix multiplication
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var fromRotation_1 = fromRotation;

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} [out] - mat4 receiving operation result
 * @param {vec3} v - Scaling vector
 * @returns {mat4} out
 */
const fromScaling = (...params) => {
  let out;
  let v;
  if (params.length === 1) {
    out = create_1$5();
    v = params[0];
  } else {
    out = params[0];
    v = params[1];
  }
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var fromScaling_1 = fromScaling;

/**
 * Creates a matrix from the given Tait–Bryan angles.
 * Tait-Bryan Euler angle convention using active, intrinsic rotations around the axes in the order z-y-x.
 * @see https://en.wikipedia.org/wiki/Euler_angles
 * @param {Number} yaw - Z rotation in radians
 * @param {Number} pitch - Y rotation in radians
 * @param {Number} roll - X rotation in radians
 * @returns {mat4} a new matrix
 */
const fromTaitBryanRotation = (yaw, pitch, roll) => {
  // precompute sines and cosines of Euler angles
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const sr = Math.sin(roll);
  const cr = Math.cos(roll);

  // create and populate rotation matrix
  // left-hand-rule rotation
  //const els = [
  //  cp*cy, sr*sp*cy - cr*sy, sr*sy + cr*sp*cy, 0,
  //  cp*sy, cr*cy + sr*sp*sy, cr*sp*sy - sr*cy, 0,
  //  -sp, sr*cp, cr*cp, 0,
  //  0, 0, 0, 1
  //]
  // right-hand-rule rotation
  const els = [
    cp*cy, cp*sy, -sp, 0,
    sr*sp*cy - cr*sy, cr*cy + sr*sp*sy, sr*cp, 0,
    sr*sy + cr*sp*cy, cr*sp*sy - sr*cy, cr*cp, 0,
    0, 0, 0, 1
  ];
  return clone_1$4(els)
};

var fromTaitBryanRotation_1 = fromTaitBryanRotation;

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} [out] - mat4 receiving operation result
 * @param {vec3} v - Translation vector
 * @returns {mat4} out
 */
const fromTranslation = (...params) => {
  let out;
  let v;
  if (params.length === 1) {
    out = create_1$5();
    v = params[0];
  } else {
    out = params[0];
    v = params[1];
  }
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out
};

var fromTranslation_1 = fromTranslation;

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
const fromValues$3 = (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) => {
  const out = create_1$5();
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out
};

var fromValues_1$3 = fromValues$3;

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} [out] - mat4 receiving operation result
 * @param {Number} rad - the angle to rotate the matrix by
 * @returns {mat4} out
 */
const fromXRotation = (...params) => {
  let out;
  let rad;
  if (params.length === 1) {
    out = create_1$5();
    rad = params[0];
  } else {
    out = params[0];
    rad = params[1];
  }
  const s = Math.sin(rad);
  const c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var fromXRotation_1 = fromXRotation;

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} [out] - mat4 receiving operation result
 * @param {Number} rad - the angle to rotate the matrix by
 * @returns {mat4} out
 */
const fromYRotation = (...params) => {
  let out;
  let rad;
  if (params.length === 1) {
    out = create_1$5();
    rad = params[0];
  } else {
    out = params[0];
    rad = params[1];
  }
  const s = Math.sin(rad);
  const c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var fromYRotation_1 = fromYRotation;

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} [out] - mat4 receiving operation result
 * @param {Number} rad - the angle to rotate the matrix by
 * @returns {mat4} out
 */
const fromZRotation = (...params) => {
  let out;
  let rad;
  if (params.length === 1) {
    out = create_1$5();
    rad = params[0];
  } else {
    out = params[0];
    rad = params[1];
  }
  const s = Math.sin(rad);
  const c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var fromZRotation_1 = fromZRotation;

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
const identity = (...params) => {
  let out;
  if (params.length === 1) {
    out = params[0];
  } else {
    out = create_1$5();
  }
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out
};

var identity_1 = identity;

/**
 * determine whether the input matrix is a mirroring transformation
 *
 * @param {mat4} mat the input matrix
 * @returns {boolean} output
 */
const isMirroring = (mat) => {
  const u = [mat[0], mat[4], mat[8]];
  const v = [mat[1], mat[5], mat[9]];
  const w = [mat[2], mat[6], mat[10]];

  // for a true orthogonal, non-mirrored base, u.cross(v) == w
  // If they have an opposite direction then we are mirroring
  const mirrorvalue = dot_1(cross_1(u, v), w);
  const ismirror = (mirrorvalue < 0);
  return ismirror
};

var isMirroring_1 = isMirroring;

/**
 * m the mat4 by the dimensions in the given vec3
 * create an affine matrix for mirroring into an arbitrary plane:
 *
 * @param {mat4} [out] - the receiving matrix (optional)
 * @param {vec3} v - the vec3 to mirror the matrix by
 * @param {mat4} a - the matrix to mirror
 * @returns {mat4} out
 */
const mirror = (...params) => {
  let out;
  let a;
  let v;
  if (params.length === 2) {
    out = create_1$5();
    v = params[0];
    a = params[1];
  } else {
    out = params[0];
    v = params[1];
    a = params[2];
  }

  const x = v[0];
  const y = v[1];
  const z = v[2];

  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out
};

var mirror_1 = mirror;

/**
 * Create an affine matrix for mirroring onto an arbitrary plane
 *
 * @param {mat4} [out] receiving matrix
 * @param {vec4} plane to mirror the matrix by
 * @returns {mat4} out
 */
const mirrorByPlane = (...params) => {
  let out;
  let plane;
  if (params.length === 1) {
    out = create_1$5();
    plane = params[0];
  } else {
    out = params[0];
    plane = params[1];
  }
  const [nx, ny, nz, w] = plane;

  out[0] = (1.0 - 2.0 * nx * nx);
  out[1] = (-2.0 * ny * nx);
  out[2] = (-2.0 * nz * nx);
  out[3] = 0;
  out[4] = (-2.0 * nx * ny);
  out[5] = (1.0 - 2.0 * ny * ny);
  out[6] = (-2.0 * nz * ny);
  out[7] = 0;
  out[8] = (-2.0 * nx * nz);
  out[9] = (-2.0 * ny * nz);
  out[10] = (1.0 - 2.0 * nz * nz);
  out[11] = 0;
  out[12] = (2.0 * nx * w);
  out[13] = (2.0 * ny * w);
  out[14] = (2.0 * nz * w);
  out[15] = 1;

  return out
};

var mirrorByPlane_1 = mirrorByPlane;

/**
 * Multiplies two mat4's
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {mat4} a - the first operand
 * @param {mat4} b - the second operand
 * @returns {mat4} out
 */
const multiply$2 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$5();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  // Cache only the current line of the second matrix
  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
  let b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out
};

var multiply_1$2 = multiply$2;

/**
 * Multiply the input matrix by a Vector2 (interpreted as 2 row, 1 column)
 * (result = M*v)
 * Fourth element is set to 1
 * @param {vec2} vector the input vector
 * @param {mat4} matrix the input matrix
 * @returns {vec2} output
 */
const rightMultiplyVec2 = (vector, matrix) => {
  const [v0, v1] = vector;
  const v2 = 0;
  const v3 = 1;
  let x = v0 * matrix[0] + v1 * matrix[1] + v2 * matrix[2] + v3 * matrix[3];
  let y = v0 * matrix[4] + v1 * matrix[5] + v2 * matrix[6] + v3 * matrix[7];
  const w = v0 * matrix[12] + v1 * matrix[13] + v2 * matrix[14] + v3 * matrix[15];

  // scale such that fourth element becomes 1:
  if (w !== 1) {
    const invw = 1.0 / w;
    x *= invw;
    y *= invw;
  }
  return fromValues_1$1(x, y)
};

var rightMultiplyVec2_1 = rightMultiplyVec2;

/**
 * Multiply the input matrix by a Vector3 (interpreted as 3 row, 1 column)
 * (result = M*v)
 * Fourth element is set to 1
 * @param {vec3} vector the input vector
 * @param {mat4} matrix the input matrix
 * @returns {vec3} output
 */
const rightMultiplyVec3 = (vector, matrix) => {
  const [v0, v1, v2] = vector;
  const v3 = 1;
  let x = v0 * matrix[0] + v1 * matrix[1] + v2 * matrix[2] + v3 * matrix[3];
  let y = v0 * matrix[4] + v1 * matrix[5] + v2 * matrix[6] + v3 * matrix[7];
  let z = v0 * matrix[8] + v1 * matrix[9] + v2 * matrix[10] + v3 * matrix[11];
  const w = v0 * matrix[12] + v1 * matrix[13] + v2 * matrix[14] + v3 * matrix[15];

  // scale such that fourth element becomes 1:
  if (w !== 1) {
    const invw = 1.0 / w;
    x *= invw;
    y *= invw;
    z *= invw;
  }
  return fromValues_1(x, y, z)
};

var rightMultiplyVec3_1 = rightMultiplyVec3;

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {Number} rad - the angle to rotate the matrix by
 * @param {vec3} axis - the axis to rotate around
 * @param {mat4} matrix - the matrix to rotate
 * @returns {mat4} out
 */
const rotate$1 = (...params) => {
  let out;
  let matrix;
  let rad;
  let axis;
  if (params.length === 3) {
    out = create_1$5();
    rad = params[0];
    axis = params[1];
    matrix = params[2];
  } else {
    out = params[0];
    rad = params[1];
    axis = params[2];
    matrix = params[3];
  }

  let [x, y, z] = axis;
  let len = Math.sqrt(x * x + y * y + z * z);

  if (Math.abs(len) < 0.000001) { return null }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const t = 1 - c;

  const a00 = matrix[0];
  const a01 = matrix[1];
  const a02 = matrix[2];
  const a03 = matrix[3];
  const a10 = matrix[4];
  const a11 = matrix[5];
  const a12 = matrix[6];
  const a13 = matrix[7];
  const a20 = matrix[8];
  const a21 = matrix[9];
  const a22 = matrix[10];
  const a23 = matrix[11];

  // Construct the elements of the rotation matrix
  const b00 = x * x * t + c;
  const b01 = y * x * t + z * s;
  const b02 = z * x * t - y * s;
  const b10 = x * y * t - z * s;
  const b11 = y * y * t + c;
  const b12 = z * y * t + x * s;
  const b20 = x * z * t + y * s;
  const b21 = y * z * t - x * s;
  const b22 = z * z * t + c;

  // Perform rotation-specific matrix multiplication
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (matrix !== out) { // If the source and destination differ, copy the unchanged last row
    out[12] = matrix[12];
    out[13] = matrix[13];
    out[14] = matrix[14];
    out[15] = matrix[15];
  }
  return out
};

var rotate_1$1 = rotate$1;

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {Number} angle - the angle to rotate the matrix by (in radian)
 * @param {mat4} matrix - the matrix to rotate
 * @returns {mat4} out
 */
const rotateX$1 = (...params) => {
  let out;
  let angle;
  let matrix;
  if (params.length === 2) {
    out = create_1$5();
    angle = params[0];
    matrix = params[1];
  } else {
    out = params[0];
    angle = params[1];
    matrix = params[2];
  }

  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const a10 = matrix[4];
  const a11 = matrix[5];
  const a12 = matrix[6];
  const a13 = matrix[7];
  const a20 = matrix[8];
  const a21 = matrix[9];
  const a22 = matrix[10];
  const a23 = matrix[11];

  if (matrix !== out) { // If the source and destination differ, copy the unchanged rows
    out[0] = matrix[0];
    out[1] = matrix[1];
    out[2] = matrix[2];
    out[3] = matrix[3];
    out[12] = matrix[12];
    out[13] = matrix[13];
    out[14] = matrix[14];
    out[15] = matrix[15];
  }

  // Perform axis-specific matrix multiplication
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out
};

var rotateX_1$1 = rotateX$1;

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {Number} angle - the angle to rotate the matrix by (in radian)
 * @param {mat4} matrix - the matrix to rotate
 * @returns {mat4} out
 */
const rotateY$1 = (...params) => {
  let out;
  let angle;
  let matrix;
  if (params.length === 2) {
    out = create_1$5();
    angle = params[0];
    matrix = params[1];
  } else {
    out = params[0];
    angle = params[1];
    matrix = params[2];
  }
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const a00 = matrix[0];
  const a01 = matrix[1];
  const a02 = matrix[2];
  const a03 = matrix[3];
  const a20 = matrix[8];
  const a21 = matrix[9];
  const a22 = matrix[10];
  const a23 = matrix[11];

  if (matrix !== out) { // If the source and destination differ, copy the unchanged rows
    out[4] = matrix[4];
    out[5] = matrix[5];
    out[6] = matrix[6];
    out[7] = matrix[7];
    out[12] = matrix[12];
    out[13] = matrix[13];
    out[14] = matrix[14];
    out[15] = matrix[15];
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out
};

var rotateY_1$1 = rotateY$1;

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {Number} angle - the angle to rotate the matrix by (in radian)
 * @param {mat4} matrix - the matrix to rotate
 * @returns {mat4} out
 */
const rotateZ$1 = (...params) => {
  let out;
  let angle;
  let matrix;
  if (params.length === 2) {
    out = create_1$5();
    angle = params[0];
    matrix = params[1];
  } else {
    out = params[0];
    angle = params[1];
    matrix = params[2];
  }
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const a00 = matrix[0];
  const a01 = matrix[1];
  const a02 = matrix[2];
  const a03 = matrix[3];
  const a10 = matrix[4];
  const a11 = matrix[5];
  const a12 = matrix[6];
  const a13 = matrix[7];

  if (matrix !== out) { // If the source and destination differ, copy the unchanged last row
    out[8] = matrix[8];
    out[9] = matrix[9];
    out[10] = matrix[10];
    out[11] = matrix[11];
    out[12] = matrix[12];
    out[13] = matrix[13];
    out[14] = matrix[14];
    out[15] = matrix[15];
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out
};

var rotateZ_1$1 = rotateZ$1;

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {vec3} vector - the vec3 to scale the matrix by
 * @param {mat4} matrix - the matrix to scale
 * @returns {mat4} out
 */
const scale$2 = (...params) => {
  let out;
  let vector;
  let matrix;

  if (params.length === 2) {
    out = create_1$5();
    vector = params[0];
    matrix = params[1];
  } else {
    out = params[0];
    vector = params[1];
    matrix = params[2];
  }

  const x = vector[0];
  const y = vector[1];
  const z = vector[2];

  out[0] = matrix[0] * x;
  out[1] = matrix[1] * x;
  out[2] = matrix[2] * x;
  out[3] = matrix[3] * x;
  out[4] = matrix[4] * y;
  out[5] = matrix[5] * y;
  out[6] = matrix[6] * y;
  out[7] = matrix[7] * y;
  out[8] = matrix[8] * z;
  out[9] = matrix[9] * z;
  out[10] = matrix[10] * z;
  out[11] = matrix[11] * z;
  out[12] = matrix[12];
  out[13] = matrix[13];
  out[14] = matrix[14];
  out[15] = matrix[15];
  return out
};

var scale_1$2 = scale$2;

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {mat4} a - the first operand
 * @param {mat4} b - the second operand
 * @returns {mat4} out
 */
const subtract$2 = (...params) => {
  let out;
  let a;
  let b;
  if (params.length === 2) {
    out = create_1$5();
    a = params[0];
    b = params[1];
  } else {
    out = params[0];
    a = params[1];
    b = params[2];
  }
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out
};

var subtract_1$2 = subtract$2;

const toString$5 = (mat) => {
  return `[${mat[0].toFixed(7)}, ${mat[1].toFixed(7)}, ${mat[2].toFixed(7)}, ${mat[3].toFixed(7)}, ${mat[4].toFixed(7)}, ${mat[5].toFixed(7)}, ${mat[6].toFixed(7)}, ${mat[7].toFixed(7)}, ${mat[8].toFixed(7)}, ${mat[9].toFixed(7)}, ${mat[10].toFixed(7)}, ${mat[11].toFixed(7)}, ${mat[12].toFixed(7)}, ${mat[13].toFixed(7)}, ${mat[14].toFixed(7)}, ${mat[15].toFixed(7)}]`
};

var toString_1$5 = toString$5;

/**
 * Translate matrix mat4 by the given vector
 *
 * @param {mat4} [out] - the receiving matrix
 * @param {vec3} vector - vector to translate by
 * @param {mat4} matrix - the matrix to translate
 * @returns {mat4} out
 */
const translate = (...params) => {
  let out;
  let vector;
  let matrix;
  if (params.length === 2) {
    out = create_1$5();
    vector = params[0];
    matrix = params[1];
  } else {
    out = params[0];
    vector = params[1];
    matrix = params[2];
  }
  const x = vector[0];
  const y = vector[1];
  const z = vector[2];
  let a00;
  let a01;
  let a02;
  let a03;
  let a10;
  let a11;
  let a12;
  let a13;
  let a20;
  let a21;
  let a22;
  let a23;

  if (matrix === out) {
  // 0-11 assignments are unnecessary
    out[12] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
    out[13] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
    out[14] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
    out[15] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  } else {
    a00 = matrix[0]; a01 = matrix[1]; a02 = matrix[2]; a03 = matrix[3];
    a10 = matrix[4]; a11 = matrix[5]; a12 = matrix[6]; a13 = matrix[7];
    a20 = matrix[8]; a21 = matrix[9]; a22 = matrix[10]; a23 = matrix[11];

    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
    out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
    out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

    out[12] = a00 * x + a10 * y + a20 * z + matrix[12];
    out[13] = a01 * x + a11 * y + a21 * z + matrix[13];
    out[14] = a02 * x + a12 * y + a22 * z + matrix[14];
    out[15] = a03 * x + a13 * y + a23 * z + matrix[15];
  }

  return out
};

var translate_1 = translate;

var mat4 = {
  add: add_1$2,
  clone: clone_1$4,
  create: create_1$5,
  equals: equals_1$4,
  fromRotation: fromRotation_1,
  fromScaling: fromScaling_1,
  fromTaitBryanRotation: fromTaitBryanRotation_1,
  fromTranslation: fromTranslation_1,
  fromValues: fromValues_1$3,
  fromXRotation: fromXRotation_1,
  fromYRotation: fromYRotation_1,
  fromZRotation: fromZRotation_1,
  identity: identity_1,
  isMirroring: isMirroring_1,
  mirror: mirror_1,
  mirrorByPlane: mirrorByPlane_1,
  multiply: multiply_1$2,
  rightMultiplyVec2: rightMultiplyVec2_1,
  rightMultiplyVec3: rightMultiplyVec3_1,
  rotate: rotate_1$1,
  rotateX: rotateX_1$1,
  rotateY: rotateY_1$1,
  rotateZ: rotateZ_1$1,
  scale: scale_1$2,
  subtract: subtract_1$2,
  toString: toString_1$5,
  translate: translate_1
};

/**
 * Creates a new vec4 initialized to zero
 *
 * @returns {vec4} a new vector
 */
const create$6 = () => {
  return new Float32Array(4) // 0, 0, 0, 0
};

var create_1$6 = create$6;

/**
 * Create a clone of the given vector
 *
 * @param {vec4} [out] - receiving vector
 * @param {vec4} vector - vector to clone
 * @returns {vec4} clone of vector
 */
const clone$5 = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1$6();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  out[0] = vec[0];
  out[1] = vec[1];
  out[2] = vec[2];
  out[3] = vec[3];
  return out
};

var clone_1$5 = clone$5;

/**
 * Compare the given planes for equality
 *
 * @param {plane} a - the first plane
 * @param {plane} b - the second plane
 * @return {boolean} true if planes are equal
 */
const equals$5 = (a, b) => {
  return ((a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]) && (a[3] === b[3]))
};

var equals_1$5 = equals$5;

/**
 * Flip the given plane
 *
 * @param {plane} [out] - receiving plane
 * @param {plane} vec - plane to flip
 * @return {plane} flipped plane
 */
const flip = (...params) => {
  let out;
  let vec;
  if (params.length === 1) {
    out = create_1$6();
    vec = params[0];
  } else {
    out = params[0];
    vec = params[1];
  }
  out[0] = -vec[0];
  out[1] = -vec[1];
  out[2] = -vec[2];
  out[3] = -vec[3];
  return out
};

var flip_1 = flip;

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new vector
 */
const fromValues$4 = (x, y, z, w) => {
  const out = create_1$6();
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out
};

var fromValues_1$4 = fromValues$4;

/**
 * Create a new plane from the given normal and point values
 * @param {vec3} normal - vector 3D
 * @param {vec3} point - vector 3D
 * @returns {plane} a new plane with properly typed values
 */
const fromNormalAndPoint = (normal, point) => {
  const u = vec3.unit(normal);
  const w = vec3.dot(point, u);

  return fromValues_1$4(u[0], u[1], u[2], w)
};

var fromNormalAndPoint_1 = fromNormalAndPoint;

/**
 * Create a new plane from the given points
 *
 * @param {vec3} a - 3D point
 * @param {vec3} b - 3D point
 * @param {vec3} c - 3D point
 * @returns {plane} a new plane with properly typed values
 */
const fromPoints$2 = (a, b, c) => {
  const ba = vec3.subtract(b, a);
  const ca = vec3.subtract(c, a);
  vec3.cross(ba, ba, ca);
  vec3.unit(ba, ba); // normal part
  const w = vec3.dot(ba, a);
  return fromValues_1$4(ba[0], ba[1], ba[2], w)
};

var fromPoints_1$2 = fromPoints$2;

/** Create a new vec4 from the given scalar value (single)
 *
 * @param  {Number} scalar
 * @returns {vec4} a new vector
 */
const fromScalar$2 = (scalar) => {
  return fromValues_1$4(scalar, scalar, scalar, scalar)
};

var fromScalar_1$2 = fromScalar$2;

/**
 * Convert the given vec4 to a representative string
 *
 * @param {vec4} a vector to convert
 * @returns {String} representative string
 */
const toString$6 = (vec) => {
  return `(${vec[0].toFixed(9)}, ${vec[1].toFixed(9)}, ${vec[2].toFixed(9)}, ${vec[3].toFixed(9)})`
};

var toString_1$6 = toString$6;

/**
 * Transform the given vec4 using the given mat4
 *
 * @param {vec4} [out] - the receiving vector (optional)
 * @param {mat4} matrix - matrix to transform with
 * @param {vec4} vector - the vector to transform
 * @returns {vec4} a new vector or the receiving vector
 */
const transform$5 = (...params) => {
  let out;
  let vector;
  let matrix;
  if (params.length === 2) {
    out = create_1$6();
    matrix = params[0];
    vector = params[1];
  } else {
    out = params[0];
    matrix = params[1];
    vector = params[2];
  }

  const [x, y, z, w] = vector;

  out[0] = Math.fround(matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w);
  out[1] = Math.fround(matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w);
  out[2] = Math.fround(matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w);
  out[3] = Math.fround(matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w);
  return out
};

var transform_1$5 = transform$5;

var vec4 = {
  clone: clone_1$5,
  create: create_1$6,
  fromScalar: fromScalar_1$2,
  fromValues: fromValues_1$4,
  toString: toString_1$6,
  transform: transform_1$5
};

const { EPS: EPS$2 } = constants;



const { fromValues: fromValues$5 } = vec4;

/** Create a new plane from the given points like fromPoints, 
 * but allow the vectors to be on one point or one line
 * in such a case a random plane through the given points is constructed
 * @param {vec3} a - 3D point
 * @param {vec3} b - 3D point
 * @param {vec3} c - 3D point
 * @returns {plane} a new plane with properly typed values
 */
const fromPointsRandom = (a, b, c) => {
  let ba = vec3.subtract(b, a);
  let ca = vec3.subtract(c, a);
  if (vec3.length(ba) < EPS$2) {
    ba = vec3.random(ca);
  }
  if (vec3.length(ca) < EPS$2) {
    ca = vec3.random(ba);
  }
  let normal = vec3.cross(ba, ca);
  if (vec3.length(normal) < EPS$2) {
    // this would mean that ba == ca.negated()
    ca = vec3.random(ba);
    normal = vec3.cross(ba, ca);
  }
  normal = vec3.unit(normal);
  return fromValues$5(normal[0], normal[1], normal[2], vec3.dot(normal, a))
};

var fromPointsRandom_1 = fromPointsRandom;

/**
 * Calculate the distance to the given point
 * @return {Number} signed distance to point
 */
const signedDistanceToPoint = (plane, vector) => {
  return vec3.dot(plane, vector) - plane[3]
};

var signedDistanceToPoint_1 = signedDistanceToPoint;

/**
 * Split the given line by the given plane.
 * Robust splitting, even if the line is parallel to the plane
 * @return {vec3} a new point
 */
const splitLineSegmentByPlane = (plane, p1, p2) => {
  const direction = vec3.subtract(p2, p1);
  let lambda = (plane[3] - vec3.dot(plane, p1)) / vec3.dot(plane, direction);
  if (Number.isNaN(lambda)) lambda = 0;
  if (lambda > 1) lambda = 1;
  if (lambda < 0) lambda = 0;
  const result = vec3.plus(p1, vec3.scale(lambda, direction));
  return result
};

var splitLineSegmentByPlane_1 = splitLineSegmentByPlane;

/**
 * Transform the given plane using the given matrix
 * @return {Array} a new plane with properly typed values
 */
const transform$6 = (matrix, plane) => {
  const ismirror = mat4.isMirroring(matrix);
  // get two vectors in the plane:
  const r = vec3.random(plane);
  const u = vec3.cross(plane, r);
  const v = vec3.cross(plane, u);
  // get 3 points in the plane:
  let point1 = vec3.multiply(plane, [plane[3], plane[3], plane[3]]);
  let point2 = vec3.add(point1, u);
  let point3 = vec3.add(point1, v);
  // transform the points:
  point1 = vec3.transform(matrix, point1);
  point2 = vec3.transform(matrix, point2);
  point3 = vec3.transform(matrix, point3);
  // and create a new plane from the transformed points:
  let newplane = fromPoints_1$2(point1, point2, point3);
  if (ismirror) {
    // the transform is mirroring so mirror the plane
    newplane = flip_1(newplane);
  }
  return newplane
};

var transform_1$6 = transform$6;

var plane = {
  clone: clone_1$5,
  create: create_1$6,
  equals: equals_1$5,
  flip: flip_1,
  fromNormalAndPoint: fromNormalAndPoint_1,
  fromValues: fromValues_1$4,
  fromPoints: fromPoints_1$2,
  fromPointsRandom: fromPointsRandom_1,
  signedDistanceToPoint: signedDistanceToPoint_1,
  splitLineSegmentByPlane: splitLineSegmentByPlane_1,
  toString: toString_1$6,
  transform: transform_1$6
};

export const math = {
  constants: constants,
  line2: line2,
  line3: line3,
  mat4: mat4,
  plane: plane,
  utils: utils,
  vec2: vec2,
  vec3: vec3,
  vec4: vec4
};

/** class OrthoNormalBasis
 * Reprojects points on a 3D plane onto a 2D plane
 * or from a 2D plane back onto the 3D plane
 * @param  {Plane} plane
 * @param  {Vector3D|Vector2D} rightvector
 */
const OrthoNormalBasis = function (plane, rightvector) {
  if (arguments.length < 2) {
    // choose an arbitrary right hand vector, making sure it is somewhat orthogonal to the plane normal:
    rightvector = vec3.random(plane);
  } else {
    rightvector = rightvector;
  }
  this.v = vec3.unit(vec3.cross(plane, rightvector));
  this.u = vec3.cross(this.v, plane);
  this.plane = plane;
  this.planeorigin = vec3.scale(plane[3], plane);
};

// Get an orthonormal basis for the standard XYZ planes.
// Parameters: the names of two 3D axes. The 2d x axis will map to the first given 3D axis, the 2d y
// axis will map to the second.
// Prepend the axis with a "-" to invert the direction of this axis.
// For example: OrthoNormalBasis.GetCartesian("-Y","Z")
//   will return an orthonormal basis where the 2d X axis maps to the 3D inverted Y axis, and
//   the 2d Y axis maps to the 3D Z axis.
OrthoNormalBasis.GetCartesian = function (xaxisid, yaxisid) {
  let axisid = xaxisid + '/' + yaxisid;
  let planenormal, rightvector;
  if (axisid === 'X/Y') {
    planenormal = [0, 0, 1];
    rightvector = [1, 0, 0];
  } else if (axisid === 'Y/-X') {
    planenormal = [0, 0, 1];
    rightvector = [0, 1, 0];
  } else if (axisid === '-X/-Y') {
    planenormal = [0, 0, 1];
    rightvector = [-1, 0, 0];
  } else if (axisid === '-Y/X') {
    planenormal = [0, 0, 1];
    rightvector = [0, -1, 0];
  } else if (axisid === '-X/Y') {
    planenormal = [0, 0, -1];
    rightvector = [-1, 0, 0];
  } else if (axisid === '-Y/-X') {
    planenormal = [0, 0, -1];
    rightvector = [0, -1, 0];
  } else if (axisid === 'X/-Y') {
    planenormal = [0, 0, -1];
    rightvector = [1, 0, 0];
  } else if (axisid === 'Y/X') {
    planenormal = [0, 0, -1];
    rightvector = [0, 1, 0];
  } else if (axisid === 'X/Z') {
    planenormal = [0, -1, 0];
    rightvector = [1, 0, 0];
  } else if (axisid === 'Z/-X') {
    planenormal = [0, -1, 0];
    rightvector = [0, 0, 1];
  } else if (axisid === '-X/-Z') {
    planenormal = [0, -1, 0];
    rightvector = [-1, 0, 0];
  } else if (axisid === '-Z/X') {
    planenormal = [0, -1, 0];
    rightvector = [0, 0, -1];
  } else if (axisid === '-X/Z') {
    planenormal = [0, 1, 0];
    rightvector = [-1, 0, 0];
  } else if (axisid === '-Z/-X') {
    planenormal = [0, 1, 0];
    rightvector = [0, 0, -1];
  } else if (axisid === 'X/-Z') {
    planenormal = [0, 1, 0];
    rightvector = [1, 0, 0];
  } else if (axisid === 'Z/X') {
    planenormal = [0, 1, 0];
    rightvector = [0, 0, 1];
  } else if (axisid === 'Y/Z') {
    planenormal = [1, 0, 0];
    rightvector = [0, 1, 0];
  } else if (axisid === 'Z/-Y') {
    planenormal = [1, 0, 0];
    rightvector = [0, 0, 1];
  } else if (axisid === '-Y/-Z') {
    planenormal = [1, 0, 0];
    rightvector = [0, -1, 0];
  } else if (axisid === '-Z/Y') {
    planenormal = [1, 0, 0];
    rightvector = [0, 0, -1];
  } else if (axisid === '-Y/Z') {
    planenormal = [-1, 0, 0];
    rightvector = [0, -1, 0];
  } else if (axisid === '-Z/-Y') {
    planenormal = [-1, 0, 0];
    rightvector = [0, 0, -1];
  } else if (axisid === 'Y/-Z') {
    planenormal = [-1, 0, 0];
    rightvector = [0, 1, 0];
  } else if (axisid === 'Z/Y') {
    planenormal = [-1, 0, 0];
    rightvector = [0, 0, 1];
  } else {
    throw new Error('OrthoNormalBasis.GetCartesian: invalid combination of axis identifiers. Should pass two string arguments from [X,Y,Z,-X,-Y,-Z], being two different axes.')
  }
  return new OrthoNormalBasis(new Plane(new Vector3D(planenormal), 0), new Vector3D(rightvector))
};

/*
// test code for OrthoNormalBasis.GetCartesian()
OrthoNormalBasis.GetCartesian_Test=function() {
  let axisnames=["X","Y","Z","-X","-Y","-Z"];
  let axisvectors=[[1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0], [0,0,-1]];
  for(let axis1=0; axis1 < 3; axis1++) {
    for(let axis1inverted=0; axis1inverted < 2; axis1inverted++) {
      let axis1name=axisnames[axis1+3*axis1inverted];
      let axis1vector=axisvectors[axis1+3*axis1inverted];
      for(let axis2=0; axis2 < 3; axis2++) {
        if(axis2 != axis1) {
          for(let axis2inverted=0; axis2inverted < 2; axis2inverted++) {
            let axis2name=axisnames[axis2+3*axis2inverted];
            let axis2vector=axisvectors[axis2+3*axis2inverted];
            let orthobasis=OrthoNormalBasis.GetCartesian(axis1name, axis2name);
            let test1=orthobasis.to3D(new Vector2D([1,0]));
            let test2=orthobasis.to3D(new Vector2D([0,1]));
            let expected1=new Vector3D(axis1vector);
            let expected2=new Vector3D(axis2vector);
            let d1=test1.distanceTo(expected1);
            let d2=test2.distanceTo(expected2);
            if( (d1 > 0.01) || (d2 > 0.01) ) {
              throw new Error("Wrong!");
  }}}}}}
  throw new Error("OK");
};
*/

// The z=0 plane, with the 3D x and y vectors mapped to the 2D x and y vector
OrthoNormalBasis.Z0Plane = function () {
  let plane = new Plane(new Vector3D([0, 0, 1]), 0);
  return new OrthoNormalBasis(plane, new Vector3D([1, 0, 0]))
};

OrthoNormalBasis.prototype = {

  getProjectionMatrix: function () {
    return mat4.fromValues(
      this.u[0], this.v[0], this.plane[0], 0,
      this.u[1], this.v[1], this.plane[1], 0,
      this.u[2], this.v[2], this.plane[2], 0,
      0, 0, -this.plane[3], 1
    )
  },

  getInverseProjectionMatrix: function () {
    let p = vec3.scale(this.plane[3], this.plane);
    return mat4.fromValues(
      this.u[0], this.u[1], this.u[2], 0,
      this.v[0], this.v[1], this.v[2], 0,
      this.plane[0], this.plane[1], this.plane[2], 0,
      p[0], p[1], p[2], 1
    )
  },

  to2D: function (point) {
    return vec2.fromValues(vec3.dot(point, this.u), vec3.dot(point, this.v))
  },

  to3D: function (point) {
    const v1 = vec3.scale(point[0], this.u);
    const v2 = vec3.scale(point[1], this.v);

    const v3 = vec3.add(this.planeorigin, v1);
    const v4 = vec3.add(v3, v2);
    return v4
  },

  line3Dto2D: function (line3d) {
    let a = line3d.point;
    let b = line3d.direction.plus(a);
    let a2d = this.to2D(a);
    let b2d = this.to2D(b);
    return Line2D.fromPoints(a2d, b2d)
  },

  line2Dto3D: function (line2d) {
    let a = line2d.origin();
    let b = line2d.direction().plus(a);
    let a3d = this.to3D(a);
    let b3d = this.to3D(b);
    return Line3D.fromPoints(a3d, b3d)
  },

  transform: function (matrix4x4) {
    // todo: this may not work properly in case of mirroring
    let newplane = this.plane.transform(matrix4x4);
    let rightpointTransformed = this.u.transform(matrix4x4);
    let originTransformed = new Vector3D(0, 0, 0).transform(matrix4x4);
    let newrighthandvector = rightpointTransformed.minus(originTransformed);
    let newbasis = new OrthoNormalBasis(newplane, newrighthandvector);
    return newbasis
  }
};

var OrthoNormalBasis_1 = OrthoNormalBasis;

const { mat4: mat4$1, plane: plane$1, vec2: vec2$1, vec3: vec3$1 } = math;





/**
 * Get the transformation matrix that connects the given connectors.
 * @param {Object} options
 * @param {Boolean} [options.mirror=false] - the 'axis' vectors should point in the same direction
 *  true: the 'axis' vectors should point in opposite direction
 * @param {Number} [options.normalRotation=0] - the angle (RADIANS) of rotation between the 'normal' vectors
 * @param {connector} from - connector from which to connect
 * @param {connector} to - connector to which to connected
 * @returns {mat4} - the matrix that transforms (connects) one connector to another
 */
const transformationBetween = (options, from, to) => {
  const defaults = {
    mirror: false,
    normalRotation: 0
  };
  // mirror = !!mirror
  const { mirror, normalRotation } = Object.assign({}, defaults, options);

  // shift to the 0,0 origin
  let matrix = mat4$1.fromTranslation(vec3$1.negate(from.point));

  // align the axis
  let axesplane = plane$1.fromPointsRandom(vec3$1.create(), from.axis, to.axis);
  let axesbasis = new OrthoNormalBasis_1(axesplane);

  let angle1 = vec2$1.angleRadians(axesbasis.to2D(from.axis));
  let angle2 = vec2$1.angleRadians(axesbasis.to2D(to.axis));

  let rotation = angle2 - angle1;
  if (mirror) rotation += Math.PI; // 180 degrees

  // TODO: understand and explain this
  matrix = mat4$1.multiply(matrix, axesbasis.getProjectionMatrix());
  matrix = mat4$1.multiply(matrix, mat4$1.fromZRotation(rotation));
  matrix = mat4$1.multiply(matrix, axesbasis.getInverseProjectionMatrix());
  let usAxesAligned = transform_1$1(matrix, from);
  // Now we have done the transformation for aligning the axes.

  // align the normals
  let normalsplane = plane$1.fromNormalAndPoint(to.axis, vec3$1.create());
  let normalsbasis = new OrthoNormalBasis_1(normalsplane);

  angle1 = vec2$1.angleRadians(normalsbasis.to2D(usAxesAligned.normal));
  angle2 = vec2$1.angleRadians(normalsbasis.to2D(to.normal));

  rotation = angle2 - angle1 + normalRotation;

  matrix = mat4$1.multiply(matrix, normalsbasis.getProjectionMatrix());
  matrix = mat4$1.multiply(matrix, mat4$1.fromZRotation(rotation));
  matrix = mat4$1.multiply(matrix, normalsbasis.getInverseProjectionMatrix());

  // translate to the destination point
  matrix = mat4$1.multiply(matrix, mat4$1.fromTranslation(to.point));

  return matrix
};

var transformationBetween_1 = transformationBetween;

export const connectors = {
  create: create_1$1,
  // extends: require('./extends'),
  fromPointAxisNormal: fromPointAxisNormal_1,
  // normalize: require('./normalize'),
  toString: toString_1$1,
  transform: transform_1$1,
  transformationBetween: transformationBetween_1
};

/**
 * Create a new 2D geometry composed of unordered sides (two connected points).
 * @param {Array} [sides] - list of sides where each side is an array of two points
 * @returns {geom2} a new empty geometry
 */
const create$7 = function (sides) {
  if (sides === undefined) {
    sides = []; // empty contents
  }
  return {
    sides : sides,
    transforms : mat4.identity()
  }
};

var create_1$7 = create$7;

/**
 * Performs a deep clone of the given geometry.
 * @params {geom2} geometry - the geometry to clone
 * @returns {geom2} new geometry
 */
const clone$6 = (geometry) => {
  let out = create_1$7();
  out.sides = geometry.sides.map((side) => {
    return [vec2.clone(side[0]), vec2.clone(side[1])]
  });
  out.transforms = mat4.clone(geometry.transforms);
  return out
};

var clone_1$6 = clone$6;

/**
 * Create a new 2D geometry from the given points.
 * The direction (rotation) of the points is not relevant,
 * as the points can define a convex or a concave polygon.
 * The geometry must not self intersect, i.e. the sides cannot cross.
 * @param {Array} points - list of points in 2D space where each point is an array of two values
 * @returns {geom2} a new geometry
 */
const fromPoints$3 = function (points) {
  if (!Array.isArray(points)) {
    throw new Error('the given points must be an array')
  }
  if (points.length < 3) {
    throw new Error('the given points must define a closed geometry with three or more points')
  }

  let sides = [];
  let prevpoint = points[points.length - 1];
  points.forEach(function (point) {
    sides.push([vec2.fromArray(prevpoint), vec2.fromArray(point)]);
    prevpoint = point;
  });
  return create_1$7(sides)
};

var fromPoints_1$3 = fromPoints$3;

/**
 * Determin if the given object is a 2D geometry.
 * @params {geom2} object - the object to interogate
 * @returns {true} if the object matches a geom2 based object
 */
const isA = (object) => {
  if (object && typeof object === 'object') {
    if ('sides' in object && 'transforms' in object) {
      if (Array.isArray(object.sides) && 'length' in object.transforms) {
        return true
      }
    }
  }
  return false
};

var isA_1 = isA;

/**
 * Apply the transforms of the given geometry.
 * NOTE: This function must be called BEFORE exposing any data. See toSides.
 * @param {geom2} geometry - the geometry to transform
 * @returns {geom2} the given geometry
 * @example
 * geometry = applyTransforms(geometry)
 */
const applyTransforms = (geometry) => {
  if (mat4.equals(geometry.transforms, mat4.identity())) return geometry

  // apply transforms to each side
  geometry.sides = geometry.sides.map((side) => {
    const p0 = vec2.transform(geometry.transforms, side[0]);
    const p1 = vec2.transform(geometry.transforms, side[1]);
    return [p0, p1]
  });
  mat4.identity(geometry.transforms);
  return geometry
};

var applyTransforms_1 = applyTransforms;

/**
 * Produces an array of sides from the given geometry.
 * The returned array should not be modified as the data is shared with the geometry.
 * @param {geom2} geometry - the geometry
 * @returns {Array} an array of sides, each side contains an array of two points
 * @example
 * let sharedsides = toSides(geometry)
 */
const toSides = function (geometry) {
  return applyTransforms_1(geometry).sides
};

var toSides_1 = toSides;

/**
 * Reverses the given geometry so that the sides are flipped and in the opposite order.
 * This swaps the left (interior) and right (exterior) edges.
 * @param {geom2} geometry - the geometry to reverse
 * @returns {geom2} the new reversed geometry
 * @example
 * let newgeometry = reverse(geometry)
 */
const reverse$2 = (geometry) => {
  let oldsides = toSides_1(geometry);

  let newsides = oldsides.map((side) => {
    return [side[1], side[0]]
  });
  newsides.reverse(); // is this required?
  return create_1$7(newsides)
};

var reverse_1$2 = reverse$2;

const {vec2: vec2$2} = math;



/*
 * Create a list of edges which SHARE vertices.
 * This allows the edges to be traversed in order.
 */
const toEdges = (sides) => {
  let uniquevertices = [];
  const getUniqueVertex = (vertex) => {
    let i = uniquevertices.findIndex((v) => {
      return vec2$2.equals(v, vertex)
    });
    if (i < 0) {
      uniquevertices.push(vertex);
      return vertex
    }
    return uniquevertices[i]
  };

  let edges = [];
  sides.forEach((side) => {
    edges.push([getUniqueVertex(side[0]), getUniqueVertex(side[1])]);
  });
  return edges
};

/**
 * Create the outline(s) of the given geometry.
 * @param  {geom2} geometry
 * @returns {Array} an array of outlines, where each outline is an array of ordered points
 * @example
 * let geometry = subtract(rectangle({size: [5, 5]}), rectangle({size: [3, 3]}))
 * let outlines = toOutlines(geometry) // returns two outlines
 */
const toOutlines = (geometry) => {
  let vertexMap = new Map();
  let edges = toEdges(toSides_1(geometry));
  edges.forEach((edge) => {
    if (!(vertexMap.has(edge[0]))) {
      vertexMap.set(edge[0], []);
    }
    let sideslist = vertexMap.get(edge[0]);
    sideslist.push(edge);
  });

  let outlines = [];
  while (true) {
    let startside = undefined;
    for (let [vertex, edges] of vertexMap) {
      startside = edges.shift();
      if (!startside) {
        vertexMap.delete(vertex);
        continue
      }
      break
    }
    if (startside === undefined) break // all starting sides have been visited

    let connectedVertexPoints = [];
    let startvertex = startside[0];
    while (true) {
      connectedVertexPoints.push(startside[0]);
      let nextvertex = startside[1];
      if (nextvertex === startvertex) break // the outline has been closed
      let nextpossiblesides = vertexMap.get(nextvertex);
      if (!nextpossiblesides) {
        throw new Error('the given geometry is not closed. verify proper construction')
      }
      let nextsideindex = -1;
      if (nextpossiblesides.length === 1) {
        nextsideindex = 0;
      } else {
        // more than one side starting at the same vertex
        let bestangle = undefined;
        let startangle = vec2$2.angleDegrees(vec2$2.subtract(startside[1], startside[0]));
        for (let sideindex = 0; sideindex < nextpossiblesides.length; sideindex++) {
          let nextpossibleside = nextpossiblesides[sideindex];
          let nextangle = vec2$2.angleDegrees(vec2$2.subtract(nextpossibleside[1], nextpossibleside[0]));
          let angledif = nextangle - startangle;
          if (angledif < -180) angledif += 360;
          if (angledif >= 180) angledif -= 360;
          if ((nextsideindex < 0) || (angledif > bestangle)) {
            nextsideindex = sideindex;
            bestangle = angledif;
          }
        }
      }
      let nextside = nextpossiblesides[nextsideindex];
      nextpossiblesides.splice(nextsideindex, 1); // remove side from list
      if (nextpossiblesides.length === 0) {
        vertexMap.delete(nextvertex);
      }
      startside = nextside;
    } // inner loop

    // due to the logic of fromPoints()
    // move the first point to the last
    if (connectedVertexPoints.length > 0) {
      connectedVertexPoints.push(connectedVertexPoints.shift());
    }
    outlines.push(connectedVertexPoints);
  } // outer loop
  vertexMap.clear();
  return outlines
};

var toOutlines_1 = toOutlines;

/**
 * Produces an array of points from the given geometry.
 * NOTE: The points returned do NOT define an order. Use toOutlines() for ordered points. 
 * @param {geom2} geometry - the geometry
 * @returns {Array} an array of points, each point contains an array of two numbers
 * @example
 * let sharedpoints = toPoints(geometry)
 */
const toPoints = function (geometry) {
  let sides = toSides_1(geometry);
  let points = sides.map((side) => {
    return side[0]
  });
  // due to the logic of fromPoints()
  // move the first point to the last
  if (points.length > 0) {
    points.push(points.shift());
  }
  return points
};

var toPoints_1 = toPoints;

/**
 * Create a string representing the contents of the given geometry.
 * @returns {String} a representive string
 * @example
 * console.out(toString(geometry))
 */
const toString$7 = function (geometry) {
  let sides = toSides_1(geometry);
  let result = 'geom2 (' + sides.length + ' sides):\n[\n';
  sides.forEach((side) => {
    result += '  [' + vec2.toString(side[0]) + ', ' + vec2.toString(side[1]) + ']\n';
  });
  result += ']\n';
  return result
};

var toString_1$7 = toString$7;

/**
 * Transform the given geometry using the given matrix.
 * This is a lazy transform of the sides, as this function only adjusts the transforms.
 * The transforms are applied when accessing the sides via toSides().
 * @param {mat4} matrix - the matrix to transform with
 * @param {geom2} geometry - the geometry to transform
 * @returns {geom2} - the transformed geometry
 * @example
 * let newgeometry = transform(fromZRotation(degToRad(90)), geometry)
 */
const transform$7 = function (matrix, geometry) {
  let newgeometry = create_1$7(geometry.sides); // reuse the sides

  newgeometry.transforms = mat4.multiply(geometry.transforms, matrix);
  return newgeometry

//  let isMirror = matrix.isMirroring()
//  let newsides = geometry.sides.map(function (side) {
//    return side.transform(matrix4x4)
//  })
//  let result = create(newsides)
//
//  if (isMirror) {
//    result = reverse(result)
//  }
//  return result
};

var transform_1$7 = transform$7;

var geom2 = {
  clone: clone_1$6,
  create: create_1$7,
  fromPoints: fromPoints_1$3,
  isA: isA_1,
  reverse: reverse_1$2,
  toOutlines: toOutlines_1,
  toPoints: toPoints_1,
  toSides: toSides_1,
  toString: toString_1$7,
  transform: transform_1$7
};

/**
 * Represents a convex polygon. The vertices used to initialize a polygon must
 *   be coplanar and form a convex loop. They do not have to be `vec3`
 *   instances but they must behave similarly.
 *
 * Each convex polygon has a `shared` property, which is shared between all
 *   polygons that are clones of each other or were split from the same polygon.
 *   This can be used to define per-polygon properties (such as surface color).
 * 
 * The plane of the polygon is calculated from the vertex coordinates if not provided.
 *   The plane can alternatively be passed as the third argument to avoid calculations.
 *
 * @constructor
 * @param {vec3[]} vertices - list of vertices
 * @param {shared} [shared=defaultShared] - shared property to apply
 * @param {plane} [plane] - plane of the polygon
 *
 * @example
 * const vertices = [ [0, 0, 0], [0, 10, 0], [0, 10, 10] ]
 * let observed = poly3.fromPoints(vertices)
 */

/**
 * Creates a new poly3 (polygon) with initial values
 *
 * @returns {poly3} a new poly3
 */
const create$8 = (vertices) => {
  // FIXME is plane really necessary? only for boolean ops?
  let polyplane;
  if (vertices === undefined || vertices.length < 3) {
    vertices = []; // empty contents
    polyplane = plane.create();
  } else {
    polyplane = plane.fromPoints(vertices[0], vertices[1], vertices[2]);
  }
  return {
    vertices: vertices,
    plane: polyplane
  }
};

var create_1$8 = create$8;

/**
 * Create a deep clone of the given polygon
 *
 * @param {poly3} [out] - receiving polygon
 * @param {poly3} polygon - polygon to clone
 * @returns {poly3} clone of the polygon
 */
const clone$7 = (...params) => {
  let out;
  let poly3;
  if (params.length === 1) {
    out = create_1$8();
    poly3 = params[0];
  } else {
    out = params[0];
    poly3 = params[1];
  }
  // deep clone of vertices
  out.vertices = poly3.vertices.map((vec) => { return vec3.clone(vec) });
  // deep clone of plane
  out.plane = plane.clone(poly3.plane);
  return out
};

var clone_1$7 = clone$7;

/**
 * Flip the give polygon to face the opposite direction.
 *
 * @param {poly3} polygon - the polygon to flip
 * @returns {poly3} a new poly3
 */
const flip$1 = (polygon) => {
  const vertices = polygon.vertices.slice().reverse();
  return create_1$8(vertices)
};

var flip_1$1 = flip$1;

/**
 * Create a polygon from the given points.
 *
 * @param {Array[]} points - list of points
 *
 * @example
 * const points = [
 *   [0,  0, 0],
 *   [0, 10, 0],
 *   [0, 10, 10]
 * ]
 * const polygon = fromPoints(points)
 */
const fromPoints$4 = (points, planeof) => {
  if (planeof) throw new Error('use fromPointAndPlane')
  if (!Array.isArray(points)) throw new Error('the given points must be an array')
  if (points.length < 3) throw new Error('the given points must contain THREE or more points')

  let vertices = points.map((point) => { return vec3.clone(point) });
  return create_1$8(vertices)
};

var fromPoints_1$4 = fromPoints$4;

/**
 * @param {Array[]} vertices - list of vertices
 * @param {plane} [plane] - plane of the polygon
 */
const fromPointsAndPlane = (vertices, plane) => {
  return { vertices: vertices, plane: plane }
};

var fromPointsAndPlane_1 = fromPointsAndPlane;

/**
 * Determin if the given object is a poly3.
 * @params {poly3} object - the object to interogate
 * @returns {true} if the object matches a poly3 based object
 */
const isA$1 = (object) => {
  if (object && typeof object === 'object') {
    if ('vertices' in object && 'plane' in object) {
      if (Array.isArray(object.vertices) && 'length' in object.plane) {
        return true
      }
    }
  }
  return false
};

var isA_1$1 = isA$1;

/** Check whether the polygon is convex. (it should be, otherwise we will get unexpected results)
 * @returns {boolean}
 */
const isConvex = (poly3) => {
  return areVerticesConvex(poly3.vertices)
};

const areVerticesConvex = (vertices) => {
  const numvertices = vertices.length;
  if (numvertices > 2) {
    // note: plane ~= normal point
    let normal = plane.fromPoints(vertices[0], vertices[1], vertices[2]);
    let prevprevpos = vertices[numvertices - 2];
    let prevpos = vertices[numvertices - 1];
    for (let i = 0; i < numvertices; i++) {
      const pos = vertices[i];
      if (!isConvexPoint(prevprevpos, prevpos, pos, normal)) {
        return false
      }
      prevprevpos = prevpos;
      prevpos = pos;
    }
  }
  return true
};

// calculate whether three points form a convex corner
//  prevpoint, point, nextpoint: the 3 coordinates (Vector3D instances)
//  normal: the normal vector of the plane
const isConvexPoint = (prevpoint, point, nextpoint, normal) => {
  const crossproduct = vec3.cross(
    vec3.subtract(point, prevpoint),
    vec3.subtract(nextpoint, point)
  );
  const crossdotnormal = vec3.dot(crossproduct, normal);
  return crossdotnormal >= 0
};

var isConvex_1 = isConvex;

// measure the area of the given poly3 (3D planar polygon)
// translated from the orginal C++ code from Dan Sunday
// 2000 softSurfer http://geomalgorithms.com
const measureArea = (poly3) => {
  const n = poly3.vertices.length;
  if (n < 3) {
    return 0 // degenerate polygon
  }
  const vertices = poly3.vertices;

  // calculate a real normal
  const a = vertices[0];
  const b = vertices[1];
  const c = vertices[2];
  const ba = vec3.subtract(b, a);
  const ca = vec3.subtract(c, a);
  const normal = vec3.cross(ba, ca);
  // let normal = b.minus(a).cross(c.minus(a))
  // let normal = poly3.plane.normal // unit based normal, CANNOT use

  // determin direction of projection
  const ax = Math.abs(normal[0]);
  const ay = Math.abs(normal[1]);
  const az = Math.abs(normal[2]);
  const an = Math.sqrt((ax * ax) + (ay * ay) + (az * az)); // length of normal

  let coord = 3; // ignore Z coordinates
  if ((ax > ay) && (ax > az)) {
    coord = 1; // ignore X coordinates
  } else
  if (ay > az) {
    coord = 2; // ignore Y coordinates
  }

  let area = 0;
  let h = 0;
  let i = 1;
  let j = 2;
  switch (coord) {
    case 1: // ignore X coordinates
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1;
        j = (i + 1) % n;
        area += (vertices[i][1] * (vertices[j][2] - vertices[h][2]));
      }
      area += (vertices[0][1] * (vertices[1][2] - vertices[n - 1][2]));
      // scale to get area
      area *= (an / (2 * normal[0]));
      break

    case 2: // ignore Y coordinates
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1;
        j = (i + 1) % n;
        area += (vertices[i][2] * (vertices[j][0] - vertices[h][0]));
      }
      area += (vertices[0][2] * (vertices[1][0] - vertices[n - 1][0]));
      // scale to get area
      area *= (an / (2 * normal[1]));
      break

    case 3: // ignore Z coordinates
    default:
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1;
        j = (i + 1) % n;
        area += (vertices[i][0] * (vertices[j][1] - vertices[h][1]));
      }
      area += (vertices[0][0] * (vertices[1][1] - vertices[n - 1][1]));
      // scale to get area
      area *= (an / (2 * normal[2]));
      break
  }
  return area
};

var measureArea_1 = measureArea;

// returns an array of two Vector3Ds (minimum coordinates and maximum coordinates)
const measureBoundingBox = (poly3) => {
  const vertices = poly3.vertices;
  const numvertices = vertices.length;
  let min = numvertices === 0 ? vec3.create() : vec3.clone(vertices[0]);
  let max = vec3.clone(min);
  for (let i = 1; i < numvertices; i++) {
    vec3.min(min, min, vertices[i]);
    vec3.max(max, max, vertices[i]);
  }
  return [min, max]
};

var measureBoundingBox_1 = measureBoundingBox;

/** Measure the bounding sphere of the given poly3
 * @param {poly3} polygon - the poly3 to measure
 * @returns computed bounding sphere; center (vec3) and radius
 */
const measureBoundingSphere = (poly3) => {
  const box = measureBoundingBox_1(poly3);
  const center = box[0];
  vec3.add(center, box[0], box[1]);
  vec3.scale(center, 0.5, center);
  const radius = vec3.distance(center, box[1]);
  return [center, radius]
};

var measureBoundingSphere_1 = measureBoundingSphere;

/*
 * Measure the signed volume of the given polygon, which must be convex.
 * The volume is that formed by the tetrahedon connected to the axis,
 * and will be positive or negative based on the rotation of the vertices.
 * See http://chenlab.ece.cornell.edu/Publication/Cha/icip01_Cha.pdf
 */
const measureSignedVolume = (poly3) => {
  let signedVolume = 0;
  const vertices = poly3.vertices;
  // calculate based on triangluar polygons
  for (let i = 0; i < vertices.length - 2; i++) {
    const cross = vec3.cross(vertices[i + 1], vertices[i + 2]);
    signedVolume += vec3.dot(vertices[0], cross);
  }
  signedVolume /= 6;
  return signedVolume
};

var measureSignedVolume_1 = measureSignedVolume;

/*
 * Return the given geometry as a list of points.
 * The returned array should not be modified as the points are shared with the geometry.
 * @return {Array[point, ...]} list of points, where each point contains an array of 3 numbers
 */
const toPoints$1 = function (geometry) {
  return geometry.vertices
};

var toPoints_1$1 = toPoints$1;

const toString$8 = (poly3) => {
  let result = `poly3: plane: ${plane.toString(poly3.plane)}, \n  vertices: [`;
  poly3.vertices.forEach((vertex) => {
    result += `${vec3.toString(vertex)}, `;
  });
  result += ']';
  return result
};

var toString_1$8 = toString$8;

// Affine transformation of polygon. Returns a new Polygon3
const transform$8 = (matrix, poly3) => {
  const vertices = poly3.vertices.map((vertex) => { return vec3.transform(matrix, vertex) });
  if (mat4.isMirroring(matrix)) {
    // reverse the order to preserve the orientation
    vertices.reverse();
  }
  return create_1$8(vertices)
};

var transform_1$8 = transform$8;

var poly3 = {
  clone: clone_1$7,
  
  /**
  * Represents a convex polygon. The vertices used to initialize a polygon must
  *   be coplanar and form a convex loop. They do not have to be `vec3`
  *   instances but they must behave similarly.
  *
  * Each convex polygon has a `shared` property, which is shared between all
  *   polygons that are clones of each other or were split from the same polygon.
  *   This can be used to define per-polygon properties (such as surface color).
  *
  * The plane of the polygon is calculated from the vertex coordinates if not provided.
  *   The plane can alternatively be passed as the third argument to avoid calculations.
  *
  * @constructor
  * @param {vec3[]} vertices - list of vertices
  * @param {shared} [shared=defaultShared] - shared property to apply
  * @param {plane} [plane] - plane of the polygon
  *
  * @example
  * const vertices = [ [0, 0, 0], [0, 10, 0], [0, 10, 10] ]
  * let observed = poly3.fromPoints(vertices)
  */

  /**
   * Creates a new poly3 (polygon) with initial values
   *
   * @returns {poly3} a new poly3
   */
  create: create_1$8,
  flip: flip_1$1,
  
  /**
  * Create a polygon from the given points.
  *
  * @param {Array[]} points - list of points
  *
  * @example
  * const points = [
  *   [0,  0, 0],
  *   [0, 10, 0],
  *   [0, 10, 10]
  * ]
  * const polygon = fromPoints(points)
  */
  fromPoints: fromPoints_1$4,

  /**
   * @param {Array[]} vertices - list of vertices
   * @param {plane} [plane] - plane of the polygon
   */
  fromPointsAndPlane: fromPointsAndPlane_1,
  isA: isA_1$1,
  isConvex: isConvex_1,
  measureArea: measureArea_1,
  measureBoundingBox: measureBoundingBox_1,
  measureBoundingSphere: measureBoundingSphere_1,
  measureSignedVolume: measureSignedVolume_1,
  toPoints: toPoints_1$1,
  toString: toString_1$8,
  transform: transform_1$8
};

/**
 * Create a new 3D geometry composed of polygons.
 * @returns {geom3} - a new geometry
 */
const create$9 = function (polygons) {
  if (polygons === undefined) {
    polygons = []; // empty contents
  }
  return {
    polygons : polygons,
    isRetesselated : false,
    transforms : mat4.create()
  }
};

var create_1$9 = create$9;

/**
 * Performs a deep clone of the given geometry.
 * @params {geom3} geometry - the geometry to clone
 * @returns {geom3} a new geometry
 */
const clone$8 = (geometry) => {
  let out = create_1$9();
  out.polygons = geometry.polygons.map((polygon) => poly3.clone(polygon));
  out.isRetesselated = geometry.isRetesselated;
  out.transforms = mat4.clone(geometry.transforms);
  return out
};

var clone_1$8 = clone$8;

/**
 * Construct a new 3D geometry from a list of points.
 * The list of points should contain sub-arrays, each defining a single polygon of points.
 * In addition, the points should follow the right-hand rule for rotation in order to
 * define an external facing polygon. The opposite is true for internal facing polygon.
 * @param {Array[]} listofpoints - list of lists, where each list is a set of points to construct a polygon
 * @returns {geom3} a new geometry
 */
const fromPoints$5 = function (listofpoints) {
  if (!Array.isArray(listofpoints)) {
    throw new Error('the given points must be an array')
  }

  let polygons = listofpoints.map((points, index) => {
    // TODO catch the error, and rethrow with index
    let polygon = poly3.fromPoints(points);
    return polygon
  });
  let result = create_1$9(polygons);
  return result
};

var fromPoints_1$5 = fromPoints$5;

/**
 * Determin if the given object is a 3D geometry.
 * @params {object} object - the object to interogate
 * @returns {true} if the object matches a geom3 based object
 */
const isA$2 = (object) => {
  if (object && typeof object === 'object') {
    if ('polygons' in object && 'transforms' in object) {
      if (Array.isArray(object.polygons) && 'length' in object.transforms) {
        return true
      }
    }
  }
  return false
};

var isA_1$2 = isA$2;

/**
 * Apply the transforms of the given geometry.
 * NOTE: This function must be called BEFORE exposing any data. See toPolygons.
 * @param {geom3} geometry - the geometry to transform
 * @returns {geom3} the given geometry
 * @example
 * geometry = applyTransforms(geometry)
 */
const applyTransforms$1 = (geometry) => {
  if (mat4.equals(geometry.transforms, mat4.identity())) return geometry

  // apply transforms to each polygon
  const isMirror = mat4.isMirroring(geometry.transforms);
  geometry.polygons = geometry.polygons.map((polygon) => {
    // TBD if (isMirror) newvertices.reverse()
    return poly3.transform(geometry.transforms, polygon)
  });
  mat4.identity(geometry.transforms);
  return geometry
};

var applyTransforms_1$1 = applyTransforms$1;

/*
 * Produces an array of polygons from the given geometry.
 * The returned array should not be modified as the polygons are shared with the geometry.
 * @param {geom3} geometry - the geometry
 * @returns {Array} an array of polygons, each polygon contains an array of points
 * @example
 * let sharedpolygons = toPolygons(geometry)
 */
const toPolygons = function (geometry) {
  return applyTransforms_1$1(geometry).polygons
};

var toPolygons_1 = toPolygons;

/*
 * Return the given geometry as a list of points, after applying transforms.
 * The returned array should not be modified as the points are shared with the geometry.
 * @return {Array[[points...]...]} list of polygons, represented as a list of points, each point containing 3 numbers
 */
const toPoints$2 = function (geometry) {
  let polygons = toPolygons_1(geometry);
  let listofpoints = polygons.map(function (polygon) {
    return poly3.toPoints(polygon)
  });
  return listofpoints
};

var toPoints_1$2 = toPoints$2;

/**
 * Create a string representing the contents of the given geometry.
 * @returns {String} a representive string
 * @example
 * console.out(toString(geometry))
 */
const toString$9 = function (geometry) {
  const polygons = toPolygons_1(geometry);
  let result = 'geom3 (' + polygons.length + ' polygons):\n';
  polygons.forEach(function (polygon) {
    result += '  ' + poly3.toString(polygon) + '\n';
  });
  return result
};

var toString_1$9 = toString$9;

/**
 * Transform the given geometry using the given matrix.
 * This is a lazy transform of the polygons, as this function only adjusts the transforms.
 * See applyTransforms() for the actual application of the transforms to the polygons.
 * @param {mat4} matrix - the matrix to transform with
 * @param {geom3} geometry - the geometry to transform
 * @returns {geom3} - the transformed geometry
 * @example
 * let newgeometry = transform(fromXRotation(degToRad(90)), geometry)
 */
const transform$9 = function (matrix, geometry) {
  let newgeometry = create_1$9(geometry.polygons); // reuse the polygons
  newgeometry.isRetesselated = geometry.isRetesselated;

  newgeometry.transforms = mat4.multiply(geometry.transforms, matrix);
  return newgeometry
};

var transform_1$9 = transform$9;

var geom3 = {
  clone: clone_1$8,
  create: create_1$9,
  fromPoints: fromPoints_1$5,
  isA: isA_1$2,
  toPoints: toPoints_1$2,
  toPolygons: toPolygons_1,
  toString: toString_1$9,
  transform: transform_1$9
};

/**
 * Produces an empty, open path.
 * @returns {path} a new empty, open path
 * @example
 * let newpath = create()
 */
const create$a = (points) => {
  if (points === undefined) {
    points = [];
  }
  return {
    points: points,
    isClosed: false,
    transforms: mat4.identity()
  }
};

var create_1$a = create$a;

/**
 * Performs a deep clone of the give path.
 * @param {path2} geometry - the geometry to clone
 * @returns {path2} new path
 */
const clone$9 = (geometry) => {
  let out = create_1$a();
  out.points = geometry.points.map((point) => vec2.clone(point));
  out.isClosed = geometry.isClosed;
  out.transforms = mat4.clone(geometry.transforms);
  return out
};

var clone_1$9 = clone$9;

const {EPS: EPS$3} = constants;





/**
 * Close the given geometry.
 * @params {geometry} the path to close
 * @returns {path} the closed path
 */
const close = (geometry) => {
  if (geometry.isClosed) return geometry

  const cloned = clone_1$9(geometry);
  cloned.isClosed = true;
 
  if (cloned.points.length > 1) {
    // make sure the paths are formed properly
    let points = cloned.points;
    let p0 = points[0];
    let pn = points[points.length - 1];
    while (vec2.distance(p0, pn) < (EPS$3*EPS$3)) {
      points.pop();
      if (points.length === 1) break
      pn = points[points.length - 1];
    }
  }
  return cloned
};

var close_1 = close;

const {EPS: EPS$4} = constants;






/**
 * Create a new path from the given points.
 * The points must be provided an array of points,
 * where each point is an array of two numbers.
 * @param {Array} points - array of points from which to create the path
 * @param {boolean} [options.closed] - if the path should be open or closed
 * @returns {path} new path
 * @example:
 * my newpath = fromPoints({closed: true}, [[10, 10], [-10, 10]])
 */
const fromPoints$6 = (options, points) => {
  const defaults = {closed: false};
  let {closed} = Object.assign({}, defaults, options);

  let created = create_1$a();
  created.points = points.map((point) => vec2.fromArray(point));

  // check if first and last points are equal
  if (created.points.length > 1) {
    let p0 = created.points[0];
    let pn = created.points[created.points.length - 1];
    if (vec2.distance(p0, pn) < (EPS$4*EPS$4)) {
      // and close automatically
      closed = true;
    }
  }
  if (closed === true) created = close_1(created);

  return created
};


var fromPoints_1$6 = fromPoints$6;

/**
 * Apply the transforms of the given geometry.
 * NOTE: This function must be called BEFORE exposing any data. See toPoints.
 * @param {path} geometry - the geometry to transform
 * @returns {path} the given geometry
 * @example
 * geometry = applyTransforms(geometry)
 */
const applyTransforms$2 = (geometry) => {
  if (mat4.equals(geometry.transforms, mat4.identity())) return geometry

  geometry.points = geometry.points.map((point) => vec2.transform(geometry.transforms, point));
  mat4.identity(geometry.transforms);
  return geometry
};

var applyTransforms_1$2 = applyTransforms$2;

/**
 * Produces a new array containing the path's point data.
 * The returned array should not be modified as the data is shared with the geometry.
 * @param {path2} geometry - the path
 * @returns {Array} an array of points, each point contains an array of two numbers
 * @example
 * let sharedpoints = toPoints(path)
 */
const toPoints$3 = (geometry) => {
  return applyTransforms_1$2(geometry).points
};

var toPoints_1$3 = toPoints$3;

const { vec2: vec2$3 } = math;




/**
 * Append an arc to the end of the given geometry.
 * This implementation follows the SVG arc specifications.
 * @see http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
 * @param {Object} options - options for construction
 * @param {vec2} options.endpoint - end point of arc (REQUIRED)
 * @param {vec2} [options.radius=[0,0]] - radius of arc (X and Y)
 * @param {Number} [options.xaxisrotation=0] - rotation (RADIANS) of the X axis of the arc with respect to the X axis of the coordinate system
 * @param {Boolean} [options.clockwise=false] - draw an arc clockwise with respect to the center point
 * @param {Boolean} [options.large=false] - draw an arc longer than 180 degrees
 * @param {Number} [options.segments=16] - number of segments per 360 rotation
 * @param {path2} geometry - the path of which to append the arc
 * @returns {path2} new geometry with appended arc
 *
 * @example
 * let p1 = path2.fromPoints({}, [[27.5,-22.96875]]);
 * p1 = path2.appendPoints([[27.5,-3.28125]], p1);
 * p1 = path2.appendArc({endpoint: [12.5, -22.96875], radius: [15, -19.6875]}, p1);
 */
const appendArc = (options, geometry) => {
  const defaults = {
    radius: [0, 0], // X and Y radius
    xaxisrotation: 0,
    clockwise: false,
    large: false,
    segments: 16
  };
  let { endpoint, radius, xaxisrotation, clockwise, large, segments } = Object.assign({}, defaults, options);

  // validate the given options
  if (!Array.isArray(endpoint)) throw new Error('endpoint must be an array of X and Y values')
  if (endpoint.length < 2) throw new Error('endpoint must contain X and Y values')
  endpoint = vec2$3.fromArray(endpoint);

  if (!Array.isArray(radius)) throw new Error('radius must be an array of X and Y values')
  if (radius.length < 2) throw new Error('radius must contain X and Y values')

  if (segments < 4) throw new Error('segments must be four or more')

  const decimals = 100000;

  // validate the given geometry
  if (geometry.isClosed) {
    throw new Error('the given path cannot be closed')
  }

  let points = toPoints_1$3(geometry);
  if (points.length < 1) {
    throw new Error('the given path must contain one or more points (as the starting point for the arc)')
  }

  let xradius = radius[0];
  let yradius = radius[1];
  let startpoint = points[points.length - 1];

  // round to precision in order to have determinate calculations
  xradius = Math.round(xradius * decimals) / decimals;
  yradius = Math.round(yradius * decimals) / decimals;
  endpoint = vec2$3.fromValues(Math.round(endpoint[0] * decimals) / decimals, Math.round(endpoint[1] * decimals) / decimals);

  let sweepFlag = !clockwise;
  let newpoints = [];
  if ((xradius === 0) || (yradius === 0)) {
    // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes:
    // If rx = 0 or ry = 0, then treat this as a straight line from (x1, y1) to (x2, y2) and stop
    newpoints.push(endpoint);
  } else {
    xradius = Math.abs(xradius);
    yradius = Math.abs(yradius);

    // see http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes :
    let phi = xaxisrotation;
    let cosphi = Math.cos(phi);
    let sinphi = Math.sin(phi);
    let minushalfdistance = vec2$3.scale(0.5, vec2$3.subtract(startpoint, endpoint));
    // F.6.5.1:
    // round to precision in order to have determinate calculations
    let x = Math.round((cosphi * minushalfdistance[0] + sinphi * minushalfdistance[1]) * decimals) / decimals;
    let y = Math.round((-sinphi * minushalfdistance[0] + cosphi * minushalfdistance[1]) * decimals) / decimals;
    let startTranslated = vec2$3.fromValues(x, y);
    // F.6.6.2:
    let biglambda = (startTranslated[0] * startTranslated[0]) / (xradius * xradius) + (startTranslated[1] * startTranslated[1]) / (yradius * yradius);
    if (biglambda > 1.0) {
      // F.6.6.3:
      let sqrtbiglambda = Math.sqrt(biglambda);
      xradius *= sqrtbiglambda;
      yradius *= sqrtbiglambda;
      // round to precision in order to have determinate calculations
      xradius = Math.round(xradius * decimals) / decimals;
      yradius = Math.round(yradius * decimals) / decimals;
    }
    // F.6.5.2:
    let multiplier1 = Math.sqrt((xradius * xradius * yradius * yradius - xradius * xradius * startTranslated[1] * startTranslated[1] - yradius * yradius * startTranslated[0] * startTranslated[0]) / (xradius * xradius * startTranslated[1] * startTranslated[1] + yradius * yradius * startTranslated[0] * startTranslated[0]));
    if (sweepFlag === large) multiplier1 = -multiplier1;
    let centerTranslated = vec2$3.fromValues(xradius * startTranslated[1] / yradius, -yradius * startTranslated[0] / xradius);
    centerTranslated = vec2$3.scale(multiplier1, centerTranslated);
    // F.6.5.3:
    let center = vec2$3.fromValues(cosphi * centerTranslated[0] - sinphi * centerTranslated[1], sinphi * centerTranslated[0] + cosphi * centerTranslated[1]);
    center = vec2$3.add(center, vec2$3.scale(0.5, vec2$3.add(startpoint, endpoint)));

    // F.6.5.5:
    let vector1 = vec2$3.fromValues((startTranslated[0] - centerTranslated[0]) / xradius, (startTranslated[1] - centerTranslated[1]) / yradius);
    let vector2 = vec2$3.fromValues((-startTranslated[0] - centerTranslated[0]) / xradius, (-startTranslated[1] - centerTranslated[1]) / yradius);
    let theta1 = vec2$3.angleRadians(vector1);
    let theta2 = vec2$3.angleRadians(vector2);
    let deltatheta = theta2 - theta1;
    deltatheta = deltatheta % (2 * Math.PI);
    if ((!sweepFlag) && (deltatheta > 0)) {
      deltatheta -= 2 * Math.PI;
    } else if ((sweepFlag) && (deltatheta < 0)) {
      deltatheta += 2 * Math.PI;
    }

    // Ok, we have the center point and angle range (from theta1, deltatheta radians) so we can create the ellipse
    let numsteps = Math.ceil(Math.abs(deltatheta) / (2 * Math.PI) * segments) + 1;
    if (numsteps < 1) numsteps = 1;
    for (let step = 1; step <= numsteps; step++) {
      let theta = theta1 + step / numsteps * deltatheta;
      let costheta = Math.cos(theta);
      let sintheta = Math.sin(theta);
      // F.6.3.1:
      let point = vec2$3.fromValues(cosphi * xradius * costheta - sinphi * yradius * sintheta, sinphi * xradius * costheta + cosphi * yradius * sintheta);
      point = vec2$3.add(point, center);
      newpoints.push(point);
    }
  }
  newpoints = points.concat(newpoints);
  let result = fromPoints_1$6({}, newpoints);
  return result
};

var appendArc_1 = appendArc;

/**
 * Append the given list of points to the end of the given geometry.
 * @param {vec2[]} points - the points to concatenate
 * @param {path2} geometry - the given path
 * @returns {path2} new path
 * @example
 * let newpath = concat(fromPoints({}, [[1, 2]]), fromPoints({}, [[3, 4]]))
 */
const appendPoints = (points, geometry) => {
  if (geometry.isClosed) {
    throw new Error('cannot append points to a closed path')
  }

  let newpoints = toPoints_1$3(geometry);
  newpoints = newpoints.concat(points);

  return fromPoints_1$6({}, newpoints)
};

var appendPoints_1 = appendPoints;

const { vec2: vec2$4 } = math;




/**
 * Append a Bezier curve to the end of the given geometry, using the control points to transition the curve through start and end points.
 * <br>
 * The Bézier curve starts at the last point in the path,
 * and ends at the last given control point. Other control points are intermediate control points.
 * <br>
 * The first control point may be null to ensure a smooth transition occurs. In this case,
 * the second to last control point of the path is mirrored into the control points of the Bezier curve.
 * In other words, the trailing gradient of the path matches the new gradient of the curve.
 * @param {Object} options - options for construction
 * @param {vec2[]} options.controlPoints - list of control points for the bezier curve
 * @param {Number} [options.segment=16] - number of segments per 360 rotation
 * @param {path2} geometry - the path of which to append the curves
 * @returns {path2} a new geometry with the appended curves
 *
 * @example
 * let p5 = path2.create({}, [[10,-20]])
 * p5 = path2.appendBezier({controlPoints: [[10,-10],[25,-10],[25,-20]]}, p5);
 * p5 = path2.appendBezier({controlPoints: [null, [25,-30],[40,-30],[40,-20]]}, p5)
 */
const appendBezier = (options, geometry) => {
  const defaults = {
    segments: 16
  };
  let { controlPoints, segments } = Object.assign({}, defaults, options);

  // validate the given options
  if (!Array.isArray(controlPoints)) throw new Error('controlPoints must be an array of one or more points')
  if (controlPoints.length < 1) throw new Error('controlPoints must be an array of one or more points')

  if (segments < 4) throw new Error('segments must be four or more')

  // validate the given geometry
  if (geometry.isClosed) {
    throw new Error('the given geometry cannot be closed')
  }

  let points = toPoints_1$3(geometry);
  if (points.length < 1) {
    throw new Error('the given path must contain one or more points (as the starting point for the bezier curve)')
  }

  // make a copy of the control points
  controlPoints = controlPoints.slice();

  // special handling of null control point (only first is allowed)
  let firstControlPoint = controlPoints[0];
  if (firstControlPoint === null) {
    if (controlPoints.length < 2) {
      throw new Error('a null control point must be passed with one more control points')
    }
    // special handling of a previous bezier curve
    let lastBezierControlPoint = points[points.length - 2];
    if ('lastBezierControlPoint' in geometry) {
      lastBezierControlPoint = geometry.lastBezierControlPoint;
    }
    if (!Array.isArray(lastBezierControlPoint)) {
      throw new Error('the given path must contain TWO or more points if given a null control point')
    }
    // replace the first control point with the mirror of the last bezier control point
    let controlpoint = points[points.length - 1];
    controlpoint = vec2$4.scale(2, controlpoint);
    controlpoint = vec2$4.subtract(controlpoint, lastBezierControlPoint);

    controlPoints[0] = controlpoint;
  }

  // add a control point for the previous end point
  controlPoints.unshift(points[points.length - 1]);

  let bezierOrder = controlPoints.length - 1;
  let factorials = [];
  let fact = 1;
  for (let i = 0; i <= bezierOrder; ++i) {
    if (i > 0) fact *= i;
    factorials.push(fact);
  }

  let binomials = [];
  for (let i = 0; i <= bezierOrder; ++i) {
    let binomial = factorials[bezierOrder] / (factorials[i] * factorials[bezierOrder - i]);
    binomials.push(binomial);
  }

  const getPointForT = (t) => {
    let t_k = 1; // = pow(t,k)
    let one_minus_t_n_minus_k = Math.pow(1 - t, bezierOrder); // = pow( 1-t, bezierOrder - k)
    let inv_1_minus_t = (t !== 1) ? (1 / (1 - t)) : 1;
    let point = vec2$4.create(); // 0, 0, 0
    for (let k = 0; k <= bezierOrder; ++k) {
      if (k === bezierOrder) one_minus_t_n_minus_k = 1;
      let bernsteinCoefficient = binomials[k] * t_k * one_minus_t_n_minus_k;
      let derivativePoint = vec2$4.scale(bernsteinCoefficient, controlPoints[k]);
      vec2$4.add(point, point, derivativePoint);
      t_k *= t;
      one_minus_t_n_minus_k *= inv_1_minus_t;
    }
    return point
  };

  let newpoints = [];
  let newpointsT = [];
  let numsteps = bezierOrder + 1;
  for (let i = 0; i < numsteps; ++i) {
    let t = i / (numsteps - 1);
    let point = getPointForT(t);
    newpoints.push(point);
    newpointsT.push(t);
  }

  // subdivide each segment until the angle at each vertex becomes small enough:
  let subdivideBase = 1;
  let maxangle = Math.PI * 2 / segments;
  let maxsinangle = Math.sin(maxangle);
  while (subdivideBase < newpoints.length - 1) {
    let dir1 = vec2$4.normalize(vec2$4.subtract(newpoints[subdivideBase], newpoints[subdivideBase - 1]));
    let dir2 = vec2$4.normalize(vec2$4.subtract(newpoints[subdivideBase + 1], newpoints[subdivideBase]));
    let sinangle = vec2$4.cross(dir1, dir2); // the sine of the angle
    if (Math.abs(sinangle[2]) > maxsinangle) {
      // angle is too big, we need to subdivide
      let t0 = newpointsT[subdivideBase - 1];
      let t1 = newpointsT[subdivideBase + 1];
      let newt0 = t0 + (t1 - t0) * 1 / 3;
      let newt1 = t0 + (t1 - t0) * 2 / 3;
      let point0 = getPointForT(newt0);
      let point1 = getPointForT(newt1);
      // remove the point at subdivideBase and replace with 2 new points:
      newpoints.splice(subdivideBase, 1, point0, point1);
      newpointsT.splice(subdivideBase, 1, newt0, newt1);
      // re - evaluate the angles, starting at the previous junction since it has changed:
      subdivideBase--;
      if (subdivideBase < 1) subdivideBase = 1;
    } else {
      ++subdivideBase;
    }
  }

  // append to the new points to the given path
  // but skip the first new point because it is identical to the last point in the given path
  newpoints.shift();
  let result = appendPoints_1(newpoints, geometry);
  result.lastBezierControlPoint = controlPoints[controlPoints.length - 2];
  return result
};

var appendBezier_1 = appendBezier;

/**
 * Produces a path by concatenating the given paths.
 * A concatenation of zero paths is an empty, open path.
 * A concatenation of one closed path to a series of open paths produces a closed path.
 * A concatenation of a path to a closed path is an error.
 * @param {...path2} paths - the paths to concatenate
 * @returns {path2} new path
 * @example
 * let newpath = concat(fromPoints({}, [[1, 2]]), fromPoints({}, [[3, 4]]))
 */
const concat = (...paths) => {
  // Only the last path can be closed, producing a closed path.
  let isClosed = false;
  for (const path of paths) {
    if (isClosed) {
      throw new Error('Cannot concatenate to a closed path')
    }
    isClosed = path.isClosed;
  }
  let newpoints = [];
  paths.forEach((path) => {
    newpoints = newpoints.concat(toPoints_1$3(path));
  });
  return fromPoints_1$6({closed: isClosed}, newpoints)
};

var concat_1 = concat;

/**
 * Calls a function for each point in the path in order.
 * @param {path2} path - the path to traverse
 * @param {function} thunk - the function to call
 * @example
 * eachPoint(path, accumulate)
 */
const eachPoint = (options, thunk, path) => {
  toPoints_1$3(path).forEach(thunk);
};

var eachPoint_1 = eachPoint;

/**
  * Determine if the given paths are equal.
  * For closed paths, this includes equality under point order rotation.
  * @param {path2} a - the first path to compare
  * @param {path2} b - the second path to compare
  * @returns {boolean}
  */
const equals$6 = (a, b) => {
  if (a.isClosed !== b.isClosed) {
    return false
  }
  if (a.points.length !== b.points.length) {
    return false
  }

  let apoints = toPoints_1$3(a);
  let bpoints = toPoints_1$3(b);

  // closed paths might be equal under graph rotation
  // so try comparison by rotating across all points
  let length = apoints.length;
  let offset = 0;
  do {
    let unequal = false;
    for (let i = 0; i < length; i++) {
      if (!vec2.equals(apoints[i], bpoints[(i + offset) % length])) {
        unequal = true;
        break
      }
    }
    if (unequal === false) {
      return true
    }
    // unequal open paths should only be compared once, never rotated
    if (!a.isClosed) {
      return false
    }
  } while (++offset < length)
  return false
};

var equals_1$6 = equals$6;

/**
 * Determin if the given object is a path2 geometry.
 * @params {object} object - the object to interogate
 * @returns {true} if the object matches a path2 object
 */
const isA$3 = (object) => {
  if (object && typeof object === 'object') {
    // see create for the required attributes and types
    if ('points' in object && 'transforms' in object && 'isClosed' in object) {
      // NOTE: transforms should be a TypedArray, which has a read-only length
      if (Array.isArray(object.points) && 'length' in object.transforms) {
        return true
      }
    }
  }
  return false
};

var isA_1$3 = isA$3;

/**
 * Reverses the path so that the points are in the opposite order.
 * This swaps the left (interior) and right (exterior) edges.
 * Reversal of path segments with options may be non-trivial.
 * @param {path2} path - the path to reverse.
 * @returns {path2} the reversed path.
 * @example
 * reverse(path)
 */
const reverse$3 = (path) => {
  // NOTE: this only updates the order of the points
  const cloned = clone_1$9(path);
  cloned.points = path.points.slice().reverse();
  return cloned
};

var reverse_1$3 = reverse$3;

/**
 * Create a string representing the contents of the given path.
 * @returns {String} a representive string
 * @example
 * console.out(toString(path))
 */
const toString$a = (geometry) => {
  let points = toPoints_1$3(geometry);
  let result = 'path (' + points.length + ' points, ' + geometry.isClosed + '):\n[\n';
  points.forEach((point) => {
    result += '  ' + vec2.toString(point) + ',\n';
  });
  result += ']\n';
  return result
};

var toString_1$a = toString$a;

/**
 * A lazy transform of all of the points in the path.
 * @param {mat4} matrix - the matrix to transform with
 * @param {path2} geometry - the path to transform
 * @returns {path2} - the transformed path
 * @example
 * transform(fromZRotation(degToRad(90)), path)
 */
const transform$a = (matrix, geometry) => {
  let newgeometry = create_1$a(geometry.points); // reuse the points
  newgeometry.isClosed = geometry.isClosed;

  newgeometry.transforms = mat4.multiply(geometry.transforms, matrix);
  return newgeometry
};

var transform_1$a = transform$a;

var path2 = {
  appendArc: appendArc_1,
  appendBezier: appendBezier_1,
  appendPoints: appendPoints_1,
  clone: clone_1$9,
  close: close_1,
  concat: concat_1,
  create: create_1$a,
  eachPoint: eachPoint_1,
  equals: equals_1$6,
  fromPoints: fromPoints_1$6,
  isA: isA_1$3,
  reverse: reverse_1$3,
  toPoints: toPoints_1$3,
  toString: toString_1$a,
  transform: transform_1$a
};

/*
 * Mearsure the area under the given 2D polygon.
 * @param {poly2} polygon - the polgon to measure
 * @return {Float} the area of the polygon
 */
const measureArea$1 = (polygon) => {
  let vertices = polygon.vertices;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    let j = (i + 1) % vertices.length;
    area += vertices[i][0] * vertices[j][1];
    area -= vertices[j][0] * vertices[i][1];
  }
  return (area / 2.0)
};

var measureArea_1$1 = measureArea$1;

/**
 * Creates a new poly2 (polygon) with initial values.
 *
 * @param {Array[]} [vertices] - list of vertices
 * @returns {poly2} a new poly2
 * @example
 * let polygon = create()
 */
const create$b = (vertices) => {
  if (vertices === undefined || vertices.length < 3) {
    vertices = []; // empty contents
  }
  return { vertices: vertices }
};

var create_1$b = create$b;

/**
 * Flip the give polygon to rotate the opposite direction.
 *
 * @param {poly2} polygon - the polygon to flip
 * @returns {poly2} a new poly2
 */
const flip$2 = (polygon) => {
  const vertices = polygon.vertices.slice().reverse();
  return create_1$b(vertices)
};

var flip_1$2 = flip$2;

/**
 * Determine if the given points are inside the given polygon.
 *
 * @param {Array} points - a list of points, where each point is an array with X and Y values
 * @param {poly2} polygon - a 2D polygon
 * @return {Integer} 1 if all points are inside, 0 if some or none are inside
 */
const arePointsInside = (points, polygon) => {
  if (points.length === 0) return 0 // nothing to check

  if (measureArea_1$1(polygon) < 0) {
    polygon = flip_1$2(polygon); // CCW is required
  }
  let vertices = polygon.vertices;
  if (vertices.length === 0) return 0 // nothing can be inside an empty polygon

  let sum = points.reduce((acc, point) => {
    return acc + isPointInside(point, vertices)
  }, 0);
  return sum === points.length ? 1 : 0
};

/*
 * Determine if the given point is inside the polygon.
 *
 * @see http://geomalgorithms.com/a03-_inclusion.html
 * @param {Array} point - an array with X and Y values
 * @param {Array} polygon - a list of points, where each point is an array with X and Y values
 * @return {Integer} 1 if the point is inside, 0 if outside
 */
const isPointInside = (point, polygon) => {
  let wn = 0;
  let n = polygon.length;
  let x = point[0];
  let y = point[1];
  for (let i = 0; i < polygon.length; i++) {
    let p1 = polygon[i];
    let p2 = polygon[(i + 1) % n];
    if (x !== p1[0] && y !== p1[1] && x !== p2[0] && y !== p2[1]) { // no overlap of points
      if (p1[1] <= y) {
        if (p2[1] > y) { // upward crossing
          if (isLeft(p1, p2, point) > 0) { // point left of edge
            wn++;
          }
        }
      } else {
         if (p2[1] <= y) { // downward crossing
           if (isLeft(p1, p2, point) < 0) { // point right of edge
             wn--;
           }
         }
      }
    }
  }
  return wn
};

const isLeft = (p0, p1, p2) => {
  return (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1])
};

var arePointsInside_1 = arePointsInside;

var poly2 = {
  arePointsInside: arePointsInside_1,
  create: create_1$b,
  flip: flip_1$2,
  measureArea: measureArea_1$1
};

export const geometry = {
  geom2: geom2,
  geom3: geom3,
  path2: path2,
  poly2: poly2,
  poly3: poly3
};

const {EPS: EPS$5} = constants;





/** Construct an arc.
 * @param {Object} options - options for construction
 * @param {Array} [options.center=[0,0]] - center of arc
 * @param {Number} [options.radius=1] - radius of arc
 * @param {Number} [options.startAngle=0] - starting angle of the arc, in radians
 * @param {Number} [options.endAngle=Math.PI*2] - ending angle of the arc, in radians
 * @param {Number} [options.segments=16] - number of segments to create per 360 rotation
 * @param {Boolean} [options.makeTangent=false] - adds line segments at both ends of the arc to ensure that the gradients at the edges are tangent
 * @returns {path} new path (not closed)
 */
const arc = function (options) {
  const defaults = {
    center: [0, 0],
    radius: 1,
    startAngle: 0,
    endAngle: (Math.PI * 2),
    makeTangent: false,
    segments: 16
  };
  let {center, radius, startAngle, endAngle, makeTangent, segments} = Object.assign({}, defaults, options);

  if (startAngle < 0 || endAngle < 0) throw new Error('the start and end angles must be positive')
  if (segments < 4) throw new Error('segments must be four or more')

  startAngle = startAngle % (Math.PI * 2);
  endAngle = endAngle % (Math.PI * 2);

  let rotation = (Math.PI * 2);
  if (startAngle < endAngle) {
    rotation = endAngle - startAngle;
  }
  if (startAngle > endAngle) {
    rotation = endAngle + ((Math.PI * 2) - startAngle);
  }

  let minangle = Math.acos(((radius * radius) + (radius * radius) - (EPS$5 * EPS$5)) / (2 * radius * radius));

  let centerv = vec2.fromArray(center);
  let point;
  let pointArray = [];
  if (rotation < minangle) {
    // there is no rotation, just a single point
    point = vec2.scale(radius, vec2.fromAngleRadians(startAngle));
    vec2.add(point, point, centerv);
    pointArray.push(point);
  } else {
    // note: add one additional step to acheive full rotation
    let numsteps = Math.max(1, Math.floor(segments * (rotation / (Math.PI * 2)))) + 1;
    let edgestepsize = numsteps * 0.5 / rotation; // step size for half a degree
    if (edgestepsize > 0.25) edgestepsize = 0.25;

    let totalsteps = makeTangent ? (numsteps + 2) : numsteps;
    for (let i = 0; i <= totalsteps; i++) {
      let step = i;
      if (makeTangent) {
        step = (i - 1) * (numsteps - 2 * edgestepsize) / numsteps + edgestepsize;
        if (step < 0) step = 0;
        if (step > numsteps) step = numsteps;
      }
      let angle = startAngle + (step * (rotation / numsteps));
      point = vec2.scale(radius, vec2.fromAngleRadians(angle));
      vec2.add(point, point, centerv);
      pointArray.push(point);
    }
  }
  return path2.fromPoints({close: false}, pointArray)
};

var arc_1 = arc;

/** Construct an ellispe.
 * @see https://en.wikipedia.org/wiki/Ellipse
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of ellipse
 * @param {Array} [options.radius=[1,1]] - radius of ellipse, along X and Y
 * @param {Number} [options.segments=16] - number of segments to create per 360 rotation
 * @returns {geom2} new 2D geometry
 */
const ellipse = (options) => {
  const defaults = {
    center: [0, 0],
    radius: [1, 1],
    segments: 16
  };
  let {center, radius, segments} = Object.assign({}, defaults, options);

  if (!Array.isArray(center)) throw new Error('center must be an array')
  if (center.length < 2) throw new Error('center must contain X and Y values')

  if (!Array.isArray(radius)) throw new Error('radius must be an array')
  if (radius.length < 2) throw new Error('radius must contain X and Y values')

  if (segments < 4) throw new Error('segments must be four or more')

  const centerv = vec2.fromArray(center);
  const step = 2 * Math.PI / segments; // radians

  let points = [];
  for (var i = 0 ; i < segments ; i++) {
    var point = vec2.fromValues(radius[0] * Math.cos(step * i), radius[1] * Math.sin(step * i));
    vec2.add(point, centerv, point);
    points.push(point);
  }
  return geom2.fromPoints(points)
};

/**
 * Construct a circle where are points are at the same distance from the center.
 * @see {@link ellipse} for additional options, as this is an alias for ellipse
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of circle
 * @param {Number} [options.radius=1] - radius of circle
 * @param {Number} [options.segments=16] - number of segments to create per 360 rotation
 * @returns {geom2} new 2D geometry
 */
const circle = (options) => {
  const defaults = {
    center: [0, 0],
    radius: 1,
    segments: 16
  };
  let {radius, segments, center} = Object.assign({}, defaults, options);

  // TODO check that radius is a number

  radius = [radius, radius];

  return ellipse({center: center, radius: radius, segments: segments})
};

var ellipse_1 = {
  circle,
  ellipse
};

const {geom3: geom3$1, poly3: poly3$1} = geometry;

/**
 * Construct an axis-aligned solid cuboid.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cuboid
 * @param {Array} [options.size=[2,2,2]] - dimensions of cuboid; width, depth, height
 * @returns {geom3} new 3D geometry
 *
 * @example
 * let myshape = cuboid({center: [5, 5, 5], size: [5, 10, 5]})
 */
const cuboid = (options) => {
  const defaults = {
    center: [0, 0, 0],
    size: [2, 2, 2]
  };
  let {center, size} = Object.assign({}, defaults, options);

  if (!Array.isArray(center)) throw new Error('center must be an array')
  if (center.length < 3) throw new Error('center must contain X, Y and Z values')

  if (!Array.isArray(size)) throw new Error('size must be an array')
  if (size.length < 3) throw new Error('size must contain width, depth and height values')

  let result = geom3$1.create(
    // adjust a basic shape to center and size
    [
      [ [0, 4, 6, 2], [-1, 0, 0] ],
      [ [1, 3, 7, 5], [+1, 0, 0] ],
      [ [0, 1, 5, 4], [0, -1, 0] ],
      [ [2, 6, 7, 3], [0, +1, 0] ],
      [ [0, 2, 3, 1], [0, 0, -1] ],
      [ [4, 5, 7, 6], [0, 0, +1] ]
    ].map((info) => {
      let points = info[0].map((i) => {
        let pos = [
          center[0] + (size[0] / 2) * (2 * !!(i & 1) - 1),
          center[1] + (size[1] / 2) * (2 * !!(i & 2) - 1),
          center[2] + (size[2] / 2) * (2 * !!(i & 4) - 1)
        ];
        return pos
      });
      return poly3$1.fromPoints(points)
    })
  );
  return result
};

/**
 * Construct an axis-aligned solid cube with six square faces.
 * @see {@link cuboid} for more options, as this is an alias to cuboid
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cube
 * @param {Number} [options.size=2] - dimension of cube
 * @returns {geom3} new 3D geometry
 *
 * @example
 * let mycube = cube({center: [5, 5, 5], size: 10})
 */
const cube = (options) => {
  const defaults = {
    center: [0, 0, 0],
    size: 2
  };
  let {center, size} = Object.assign({}, defaults, options);

  size = [size, size, size];

  return cuboid({center: center, size: size})
};

var cuboid_1 = {
  cube,
  cuboid
};

const {EPS: EPS$6} = constants;

const {vec3: vec3$2} = math;

const {geom3: geom3$2, poly3: poly3$2} = geometry;

/** Construct an elliptic cylinder.
 * @param {Object} [options] - options for construction
 * @param {Vector3} [options.height=2] - height of cylinder
 * @param {Vector2D} [options.startRadius=[1,1]] - radius of rounded start, must be two dimensional array
 * @param {Number} [options.startAngle=0] - start angle of cylinder, in radians
 * @param {Vector2D} [options.endRadius=[1,1]] - radius of rounded end, must be two dimensional array
 * @param {Number} [options.endAngle=(Math.PI * 2)] - end angle of cylinder, in radians
 * @param {Number} [options.segments=12] - number of segments to create per full rotation
 * @returns {geom3} new geometry
 *
 * @example
 *     let cylinder = cylinderElliptic({
 *       height: 2,
 *       startRadius: [10,5],
 *       endRadius: [8,3]
 *     });
 */
const cylinderElliptic = function (options) {
  const defaults = {
    height: 2,
    startRadius: [1,1],
    startAngle: 0,
    endRadius: [1,1],
    endAngle: (Math.PI * 2),
    segments: 12
  };
  let {height, startRadius, startAngle, endRadius, endAngle, segments} = Object.assign({}, defaults, options);

  if (height < (EPS$6*2)) throw new Error('height must be larger then zero')

  if ((endRadius[0] <= 0) || (startRadius[0] <= 0) || (endRadius[1] <= 0) || (startRadius[1] <= 0)) {
    throw new Error('endRadus and startRadius should be positive')
  }
  if (startAngle < 0 || endAngle < 0) throw new Error('startAngle and endAngle must be positive')

  if (segments < 4) throw new Error('segments must be four or more')

  startAngle = startAngle % (Math.PI * 2);
  endAngle = endAngle % (Math.PI * 2);

  let rotation = (Math.PI * 2);
  if (startAngle < endAngle) {
    rotation = endAngle - startAngle;
  }
  if (startAngle > endAngle) {
    rotation = endAngle + ((Math.PI * 2) - startAngle);
  }

  let minradius = Math.min(startRadius[0], startRadius[1], endRadius[0], endRadius[1]);
  let minangle = Math.acos(((minradius * minradius) + (minradius * minradius) - (EPS$6 * EPS$6)) /
                            (2 * minradius * minradius));
  if (rotation < minangle) throw new Error('startAngle and endAngle to not define a significant rotation')

  let slices = Math.floor(segments * (rotation / (Math.PI * 2)));

  let start = [0, 0, -(height/2)];
  let end = [0, 0, height/2];
  let startv = vec3$2.fromArray(start);
  let endv = vec3$2.fromArray(end);
  let ray = vec3$2.subtract(endv, startv);

  let axisZ = vec3$2.unit(ray);
  let axisX = vec3$2.unit(vec3$2.random(axisZ));
  let axisY = vec3$2.unit(vec3$2.cross(axisX, axisZ));

  const point = (stack, slice, radius) => {
    let angle = slice * rotation + startAngle;
    let out = vec3$2.add(vec3$2.scale(radius[0] * Math.cos(angle), axisX), vec3$2.scale(radius[1] * Math.sin(angle), axisY));
    let pos = vec3$2.add(vec3$2.add(vec3$2.scale(stack, ray), startv), out);
    return pos
  };

  let polygons = [];
  for (let i = 0; i < slices; i++) {
    let t0 = i / slices;
    let t1 = (i + 1) / slices;

    if (endRadius[0] === startRadius[0] && endRadius[1] === startRadius[1]) {
      polygons.push(poly3$2.fromPoints([start, point(0, t0, endRadius), point(0, t1, endRadius)]));
      polygons.push(poly3$2.fromPoints([point(0, t1, endRadius), point(0, t0, endRadius), point(1, t0, endRadius), point(1, t1, endRadius)]));
      polygons.push(poly3$2.fromPoints([end, point(1, t1, endRadius), point(1, t0, endRadius)]));
    } else {
      if (startRadius[0] > 0) {
        polygons.push(poly3$2.fromPoints([start, point(0, t0, startRadius), point(0, t1, startRadius)]));
        polygons.push(poly3$2.fromPoints([point(0, t0, startRadius), point(1, t0, endRadius), point(0, t1, startRadius)]));
      }
      if (endRadius[0] > 0) {
        polygons.push(poly3$2.fromPoints([end, point(1, t1, endRadius), point(1, t0, endRadius)]));
        polygons.push(poly3$2.fromPoints([point(1, t0, endRadius), point(1, t1, endRadius), point(0, t1, startRadius)]));
      }
    }
  }
  if (rotation < (Math.PI * 2)) {
    polygons.push(poly3$2.fromPoints([startv, endv, point(0, 0, startRadius)]));
    polygons.push(poly3$2.fromPoints([point(0, 0, startRadius), endv, point(1, 0, endRadius)]));
    polygons.push(poly3$2.fromPoints([startv, point(0, 1, startRadius), endv]));
    polygons.push(poly3$2.fromPoints([point(0, 1, startRadius), point(1, 1, endRadius), endv]));
  }
  let result = geom3$2.create(polygons);
  return result
};

/** Construct a solid cylinder.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.height=2] - height of cylinder
 * @param {Number} [options.startRadius=1] - radius of cylinder at the start
 * @param {Number} [options.startAngle=0] - start angle of cylinder
 * @param {Number} [options.endRadius=1] - radius of cylinder at the end
 * @param {Number} [options.endAngle=(Math.PI * 2)] - end angle of cylinder
 * @param {Number} [options.segments=12] - number of segments to create per full rotation
 * @returns {geom3} new geometry
 *
 * @example
 * let cylinder = cylinder({
 *   height: 2,
 *   startRadius: 10,
 *   endRadius: 5,
 *   segments: 16
 * })
 */
const cylinder = function (options) {
  const defaults = {
    height: 2,
    startRadius: 1,
    startAngle: 0,
    endRadius: 1,
    endAngle: (Math.PI * 2),
    segments: 12
  };
  let {height, startRadius, startAngle, endRadius, endAngle, segments} = Object.assign({}, defaults, options);

  let newoptions = {
    height: height,
    startRadius: [startRadius, startRadius],
    startAngle: startAngle,
    endRadius: [endRadius, endRadius],
    endAngle: endAngle,
    segments: segments
  };

  return cylinderElliptic(newoptions)
};

var cylinderElliptic_1 = {
  cylinder,
  cylinderElliptic
};

/** Construct an ellipsoid.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of ellipsoid
 * @param {Array} [options.radius=[1,1,1]] - radius of ellipsoid, along X, Y and Z
 * @param {Number} [options.segments=12] - number of segements to create per 360 rotation
 * @param {Array} [options.axes] -  an array with three vectors for the x, y and z base vectors
 * @returns {geom3} new 3D geometry
 *
 * @example
 * let myshape = ellipsoid({center: [5, 5, 5], radius: [5, 10, 20]})
*/
const ellipsoid = (options) => {
  const defaults = {
    center: [0, 0, 0],
    radius: [1, 1, 1],
    segments: 12,
    axes: [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
  };
  let {center, radius, segments, axes} = Object.assign({}, defaults, options);

  if (!Array.isArray(center)) throw new Error('center must be an array')
  if (center.length < 3) throw new Error('center must contain X, Y and Z values')

  if (!Array.isArray(radius)) throw new Error('radius must be an array')
  if (radius.length < 3) throw new Error('radius must contain X, Y and Z values')

  if (segments < 4) throw new Error('segments must be four or more')

  let xvector = vec3.scale(radius[0], vec3.unit(axes[0]));
  let yvector = vec3.scale(radius[1], vec3.unit(axes[1]));
  let zvector = vec3.scale(radius[2], vec3.unit(axes[2]));

  let qsegments = Math.round(segments / 4);
  let prevcylinderpoint;
  let polygons = [];
  for (let slice1 = 0; slice1 <= segments; slice1++) {
    let angle = Math.PI * 2.0 * slice1 / segments;
    let cylinderpoint = vec3.add(vec3.scale(Math.cos(angle), xvector), vec3.scale(Math.sin(angle), yvector));
    if (slice1 > 0) {
      let prevcospitch, prevsinpitch;
      for (let slice2 = 0; slice2 <= qsegments; slice2++) {
        let pitch = 0.5 * Math.PI * slice2 / qsegments;
        let cospitch = Math.cos(pitch);
        let sinpitch = Math.sin(pitch);
        if (slice2 > 0) {
          let points = [];
          let point;
          point = vec3.subtract(vec3.scale(prevcospitch, prevcylinderpoint), vec3.scale(prevsinpitch, zvector));
          points.push(vec3.add(center, point));
          point = vec3.subtract(vec3.scale(prevcospitch, cylinderpoint), vec3.scale(prevsinpitch, zvector));
          points.push(vec3.add(center, point));
          if (slice2 < qsegments) {
            point = vec3.subtract(vec3.scale(cospitch, cylinderpoint), vec3.scale(sinpitch, zvector));
            points.push(vec3.add(center, point));
          }
          point = vec3.subtract(vec3.scale(cospitch, prevcylinderpoint), vec3.scale(sinpitch, zvector));
          points.push(vec3.add(center, point));

          polygons.push(poly3.fromPoints(points));

          points = [];
          point = vec3.add(vec3.scale(prevcospitch, prevcylinderpoint), vec3.scale(prevsinpitch, zvector));
          points.push(vec3.add(center, point));
          point = vec3.add(vec3.scale(prevcospitch, cylinderpoint), vec3.scale(prevsinpitch, zvector));
          points.push(vec3.add(center, point));
          if (slice2 < qsegments) {
            point = vec3.add(vec3.scale(cospitch, cylinderpoint), vec3.scale(sinpitch, zvector));
            points.push(vec3.add(center, point));
          }
          point = vec3.add(vec3.scale(cospitch, prevcylinderpoint), vec3.scale(sinpitch, zvector));
          points.push(vec3.add(center, point));
          points.reverse();

          polygons.push(poly3.fromPoints(points));
        }
        prevcospitch = cospitch;
        prevsinpitch = sinpitch;
      }
    }
    prevcylinderpoint = cylinderpoint;
  }
  return geom3.create(polygons)
};

/**
 * Construct a sphere where are points are at the same distance from the center.
 * @see {@link ellipsoid} for additional options, as this is an alias for ellipsoid
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of sphere
 * @param {Number} [options.radius=1] - radius of sphere
 * @param {Number} [options.segments=12] - number of segments to create per 360 rotation
 * @param {Array} [options.axes] -  an array with three vectors for the x, y and z base vectors
 * @returns {geom3} new 3D geometry
*/
const sphere = (options) => {
  const defaults = {
    center: [0, 0, 0],
    radius: 1,
    segments: 12,
    axes: [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
  };
  let {center, radius, segments, axes} = Object.assign({}, defaults, options);

  // TODO check that radius is a number

  radius = [radius, radius, radius];

  return ellipsoid({center: center, radius: radius, segments: segments, axes: axes})
};

var ellipsoid_1 = {
  ellipsoid,
  sphere
};

/** Create a polyhedron from the given set of points and faces.
 * The faces can define outward or inward facing polygons (orientation).
 * However, each face must define a counter clockwise rotation of points which follows the right hand rule.
 * @param {Object} options - options for construction
 * @param {Array} options.points - list of points in 3D space
 * @param {Array} options.faces - list of faces, where each face is a set of indexes into the points
 * @param {Array} [options.orientation='outward'] - orientation of faces
 * @returns {geom3} new 3D geometry
 *
 * @example
 * let mypoints = [ [10, 10, 0], [10, -10, 0], [-10, -10, 0], [-10, 10, 0], [0, 0, 10] ]
 * let myfaces = [ [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 3], [2, 1, 3] ]
 * let myshape = polyhedron({points: mypoint, faces: myfaces, orientation: 'inward'})
 */
const polyhedron = (options) => {
  const defaults = {
    points: [],
    faces: [],
    orientation: 'outward'
  };
  const {points, faces, orientation} = Object.assign({}, defaults, options);

  if (!(Array.isArray(points) && Array.isArray(faces))) {
    throw new Error('points and faces must be arrays')
  }
  if (points.length < 3) {
    throw new Error('three or more points are required')
  }
  if (faces.length < 1) {
    throw new Error('one or more faces are required')
  }

  // invert the faces if orientation is inwards, as all internals expect outwarding facing polygons
  if (orientation !== 'outward') {
    faces.forEach((face) => face.reverse());
  }

  let polygons = faces.map((face) => poly3.fromPoints(face.map((idx) => points[idx])));
  return geom3.create(polygons)
};

var polyhedron_1 = polyhedron;

/** Construct a geodesic sphere based on icosahedron symmetry.
 * @param {Object} [options] - options for construction
 * @param {Number} [options.radius=1] - target radius of sphere
 * @param {Number} [options.frequency=6] - subdivision frequency per face, multiples of 6
 * @returns {geom3} new 3D geometry
 */
const geodesicSphere = (options) => {
  const defaults = {
    radius: 1,
    frequency: 6
  };
  let {radius, frequency} = Object.assign({}, defaults, options);

  // adjust the frequency to base 6
  frequency = Math.floor(frequency / 6);
  if (frequency <= 0) frequency = 1;

  let ci = [ // hard-coded data of icosahedron (20 faces, all triangles)
    [0.850651, 0.000000, -0.525731],
    [0.850651, -0.000000, 0.525731],
    [-0.850651, -0.000000, 0.525731],
    [-0.850651, 0.000000, -0.525731],
    [0.000000, -0.525731, 0.850651],
    [0.000000, 0.525731, 0.850651],
    [0.000000, 0.525731, -0.850651],
    [0.000000, -0.525731, -0.850651],
    [-0.525731, -0.850651, -0.000000],
    [0.525731, -0.850651, -0.000000],
    [0.525731, 0.850651, 0.000000],
    [-0.525731, 0.850651, 0.000000]];

  let ti = [ [0, 9, 1], [1, 10, 0], [6, 7, 0], [10, 6, 0], [7, 9, 0], [5, 1, 4], [4, 1, 9], [5, 10, 1], [2, 8, 3], [3, 11, 2], [2, 5, 4],
    [4, 8, 2], [2, 11, 5], [3, 7, 6], [6, 11, 3], [8, 7, 3], [9, 8, 4], [11, 10, 5], [10, 11, 6], [8, 9, 7]];

  let geodesicSubDivide = function (p, frequency, offset) {
    let p1 = p[0];
    let p2 = p[1];
    let p3 = p[2];
    let n = offset;
    let c = [];
    let f = [];

    //           p3
    //           /\
    //          /__\     frequency = 3
    //      i  /\  /\
    //        /__\/__\       total triangles = 9 (frequency*frequency)
    //       /\  /\  /\
    //     0/__\/__\/__\
    //    p1 0   j      p2

    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        let t0 = i / frequency;
        let t1 = (i + 1) / frequency;
        let s0 = j / (frequency - i);
        let s1 = (j + 1) / (frequency - i);
        let s2 = frequency - i - 1 ? j / (frequency - i - 1) : 1;
        let q = [];

        q[0] = mix3(mix3(p1, p2, s0), p3, t0);
        q[1] = mix3(mix3(p1, p2, s1), p3, t0);
        q[2] = mix3(mix3(p1, p2, s2), p3, t1);

        // -- normalize
        for (let k = 0; k < 3; k++) {
          let r = Math.sqrt(q[k][0] * q[k][0] + q[k][1] * q[k][1] + q[k][2] * q[k][2]);
          for (let l = 0; l < 3; l++) {
            q[k][l] /= r;
          }
        }
        c.push(q[0], q[1], q[2]);
        f.push([n, n + 1, n + 2]); n += 3;

        if (j < frequency - i - 1) {
          let s3 = frequency - i - 1 ? (j + 1) / (frequency - i - 1) : 1;
          q[0] = mix3(mix3(p1, p2, s1), p3, t0);
          q[1] = mix3(mix3(p1, p2, s3), p3, t1);
          q[2] = mix3(mix3(p1, p2, s2), p3, t1);

          // -- normalize
          for (let k = 0; k < 3; k++) {
            let r = Math.sqrt(q[k][0] * q[k][0] + q[k][1] * q[k][1] + q[k][2] * q[k][2]);
            for (let l = 0; l < 3; l++) {
              q[k][l] /= r;
            }
          }
          c.push(q[0], q[1], q[2]);
          f.push([n, n + 1, n + 2]); n += 3;
        }
      }
    }
    return { points: c, triangles: f, offset: n }
  };

  const mix3 = function (a, b, f) {
    let _f = 1 - f;
    let c = [];
    for (let i = 0; i < 3; i++) {
      c[i] = a[i] * _f + b[i] * f;
    }
    return c
  };

  let points = [];
  let faces = [];
  let offset = 0;

  for (let i = 0; i < ti.length; i++) {
    let g = geodesicSubDivide([ ci[ti[i][0]], ci[ti[i][1]], ci[ti[i][2]]], frequency, offset);
    points = points.concat(g.points);
    faces = faces.concat(g.triangles);
    offset = g.offset;
  }

  let geometry = polyhedron_1({points: points, faces: faces, orientation: 'inward'});
  if (radius !== 1) geometry = geom3.transform(mat4.fromScaling([radius, radius, radius]), geometry);
  return geometry
};

var geodesicSphere_1 = geodesicSphere;

/** Create a new line (path) from the given points.
 * The points must be provided as an array, where each element is an array of two numbers.
 * @param {Array} points - array of points from which to create the path
 * @returns {path2} new path
 * @example:
 * my newpath = line([[10, 10], [-10, 10]])
 */
const line = (points) => {
  if (!Array.isArray(points)) throw new Error('points must be an array')

  return path2.fromPoints({}, points)
};

var line_1 = line;

/**
 * Construct a polygon from a list of points, or list of points and paths.
 * NOTE: The ordering of points is VERY IMPORTANT.
 * @param {Object} options - options for construction
 * @param {Array} options.points - points of the polygon : either flat or nested array of points
 * @param {Array} [options.paths] - paths of the polygon : either flat or nested array of points index
 * @returns {geom2} new 2D geometry
 *
 * @example
 * let roof = [[10,11], [0,11], [5,20]]
 * let wall = [[0,0], [10,0], [10,10], [0,10]]
 *
 * let poly = polygon({ points: roof })
 * or
 * let poly = polygon({ points: [roof, wall] })
 * or
 * let poly = polygon({ points: roof, paths: [0, 1, 2] })
 * or
 * let poly = polygon({ points: [roof, wall], paths: [[0, 1, 2], [3, 4, 5, 6]] })
 */
const polygon = (options) => {
  const defaults = {
    points: [],
    paths: [],
  };
  const {points, paths} = Object.assign({}, defaults, options);

  if (!(Array.isArray(points) && Array.isArray(paths))) throw new Error('points and paths must be arrays')

  let listofpolys = points;
  if (Array.isArray(points[0])) {
    if (!Array.isArray(points[0][0])) {
      // points is an array of something... convert to list
      listofpolys = [points];
    }
  }

  listofpolys.forEach((list, i) => {
    if (!Array.isArray(list)) throw new Error('list of points '+i+' must be an array')
    if (list.length < 3) throw new Error('list of points '+i+' must contain three or more points')
    list.forEach((point, j) => {
      if (!Array.isArray(point)) throw new Error('list of points '+i+', point '+j+' must be an array')
      if (point.length < 2) throw new Error('list of points '+i+', point '+j+' must contain by X and Y values')
    });
  });

  let listofpaths = paths;
  if (paths.length === 0) {
    // create a list of paths based on the points
    let count = 0;
    listofpaths = listofpolys.map((list) => list.map((point) => count++));
  }

  // flatten the listofpoints for indexed access
  let allpoints = [];
  listofpolys.forEach((list) => list.forEach((point) => allpoints.push(point)));

  let sides = [];
  listofpaths.forEach((path) => {
    let setofpoints = path.map((index) => allpoints[index]);
    let geometry = geom2.fromPoints(setofpoints);
    sides = sides.concat(geom2.toSides(geometry));
  });
  return geom2.create(sides)
};

var polygon_1 = polygon;

/**
 * Construct an axis-aligned rectangle with four sides and four 90-degree angles.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of rectangle
 * @param {Array} [options.size=[2,2]] - dimension of rectangle, width and length
 * @returns {geom2} new 2D geometry
 *
 * @example
 * let myshape = rectangle({center: [5, 5, 5], size: [10, 20]})
 */
const rectangle = (options) => {
  const defaults = {
    center: [0, 0],
    size: [2, 2]
  };
  const {size, center} = Object.assign({}, defaults, options);

  if (!Array.isArray(center)) throw new Error('center must be an array')
  if (center.length < 2) throw new Error('center must contain X and Y values')

  if (!Array.isArray(size)) throw new Error('size must be an array')
  if (size.length < 2) throw new Error('size must contain X and Y values')

  const point = [size[0] / 2, size[1] / 2];
  const pswap = [point[0], -point[1]];

  const points = [
    vec2.subtract(center, point),
    vec2.add(center, pswap),
    vec2.add(center, point),
    vec2.subtract(center, pswap)
  ];
  return geom2.fromPoints(points)
};

/**
 * Construct an axis-aligned square with four equal sides and four 90-degree angles.
 * @see {@link rectangle} for additional options, as this is an alias fo rectangle
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of square
 * @param {Number} [options.size=2] - dimension of square
 * @returns {geom2} new 2D geometry
 *
 * @example
 * let myshape = square({center: [5, 5], size: 10})
 */
const square = (options) => {
  const defaults = {
    center: [0, 0],
    size: 2
  };
  let {center, size} = Object.assign({}, defaults, options);

  // TODO check that size is a number

  size = [size, size];

  return rectangle({center, size})
};

var rectangle_1 = {
  rectangle,
  square
};

const {EPS: EPS$7} = constants;

const {vec2: vec2$5, vec3: vec3$3} = math;

const {geom3: geom3$3, poly3: poly3$3} = geometry;

const createCorners = (center, size, radius, segments, slice, positive) => {
  let pitch = (Math.PI / 2) * slice / segments;
  let cospitch = Math.cos(pitch);
  let sinpitch = Math.sin(pitch);

  let layersegments = segments - slice;
  let layerradius = radius * cospitch;
  let layeroffset = size[2] - (radius - (radius * sinpitch));
  if (!positive) layeroffset = (radius - (radius * sinpitch)) - size[2];

  layerradius = layerradius > EPS$7 ? layerradius : 0;

  let corner0 = vec3$3.add(center, [size[0] - radius, size[1] - radius, layeroffset]);
  let corner1 = vec3$3.add(center, [radius - size[0], size[1] - radius, layeroffset]);
  let corner2 = vec3$3.add(center, [radius - size[0], radius - size[1], layeroffset]);
  let corner3 = vec3$3.add(center, [size[0] - radius, radius - size[1], layeroffset]);
  let corner0Points = [];
  let corner1Points = [];
  let corner2Points = [];
  let corner3Points = [];
  for (let i = 0; i <= layersegments; i++) {
    let radians = layersegments > 0 ? Math.PI / 2 * i / layersegments : 0;
    let point2d = vec2$5.fromAngleRadians(radians);
    let point3d = vec3$3.fromVec2(vec2$5.scale(layerradius, point2d));
    corner0Points.push(vec3$3.add(corner0, point3d));
    vec3$3.rotateZ(point3d, Math.PI / 2, [0, 0, 0], point3d);
    corner1Points.push(vec3$3.add(corner1, point3d));
    vec3$3.rotateZ(point3d, Math.PI / 2, [0, 0, 0], point3d);
    corner2Points.push(vec3$3.add(corner2, point3d));
    vec3$3.rotateZ(point3d, Math.PI / 2, [0, 0, 0], point3d);
    corner3Points.push(vec3$3.add(corner3, point3d));
  }
  if (!positive) {
    corner0Points.reverse();
    corner1Points.reverse();
    corner2Points.reverse();
    corner3Points.reverse();
    return [corner3Points, corner2Points, corner1Points, corner0Points]
  }
  return [corner0Points, corner1Points, corner2Points, corner3Points]
};

const stitchCorners = (previousCorners, currentCorners) => {
  let polygons = [];
  for (let i = 0; i < previousCorners.length; i++) {
    let previous = previousCorners[i];
    let current = currentCorners[i];
    for (let j = 0; j < (previous.length - 1); j++) {
      polygons.push(poly3$3.fromPoints([previous[j], previous[j + 1], current[j]]));

      if (j < (current.length - 1)) {
        polygons.push(poly3$3.fromPoints([current[j], previous[j + 1], current[j + 1]]));
      }
    }
  }
  return polygons
};

const stitchWalls = (previousCorners, currentCorners) => {
  let polygons = [];
  for (let i = 0; i < previousCorners.length; i++) {
    let previous = previousCorners[i];
    let current = currentCorners[i];
    let p0 = previous[previous.length - 1];
    let c0 = current[current.length - 1];

    let j = (i + 1) % previousCorners.length;
    previous = previousCorners[j];
    current = currentCorners[j];
    let p1 = previous[0];
    let c1 = current[0];

    polygons.push(poly3$3.fromPoints([p0, p1, c1, c0]));
  }
  return polygons
};

const stitchSides = (bottomCorners, topCorners) => {
  // make a copy and reverse the bottom corners
  bottomCorners = [bottomCorners[3], bottomCorners[2], bottomCorners[1], bottomCorners[0]];
  bottomCorners = bottomCorners.map((corner) => corner.slice().reverse());

  let bottomPoints = [];
  bottomCorners.forEach((corner) => {
    corner.forEach((point) => bottomPoints.push(point));
  });

  let topPoints = [];
  topCorners.forEach((corner) => {
    corner.forEach((point) => topPoints.push(point));
  });

  let polygons = [];
  for (let i = 0; i < topPoints.length; i++) {
    let j = (i + 1) % topPoints.length;
    polygons.push(poly3$3.fromPoints([bottomPoints[i], bottomPoints[j], topPoints[j], topPoints[i]]));
  }
  return polygons
};

/**
 * Construct an axis-aligned solid rounded cuboid.
 * @param {Object} [options] - options for construction
 * @param {Vector3} [options.center=[0,0,0]] - center of rounded cube
 * @param {Vector3} [options.size=[2,2,2]] - dimension of rounded cube; width, depth, height
 * @param {Number} [options.roundRadius=0.2] - radius of rounded edges
 * @param {Number} [options.segments=12] - number of segments to create per 360 rotation
 * @returns {geom3} new 3D geometry
 *
 * @example
 * let mycube = roundedCuboid({
 *   center: [2, 0, 2],
 *   size: [10, 20, 10],
 *   roundRadius: 2,
 *   segments: 36,
 * });
 */
const roundedCuboid = (options) => {
  const defaults = {
    center: [0, 0, 0],
    size: [2, 2, 2],
    roundRadius: 0.2,
    segments: 12
  };
  let {size, center, roundRadius, segments} = Object.assign({}, defaults, options);

  if (!Array.isArray(center)) throw new Error('center must be an array')
  if (center.length < 3) throw new Error('center must contain X, Y and Z values')

  if (!Array.isArray(size)) throw new Error('size must be an array')
  if (size.length < 3) throw new Error('size must contain width, depth and height values')

  size = size.map((v) => v / 2); // convert to radius

  if (roundRadius > (size[0] - EPS$7) ||
      roundRadius > (size[1] - EPS$7) ||
      roundRadius > (size[2] - EPS$7)) throw new Error('roundRadius must be smaller then the radius of all dimensions')

  segments = Math.floor(segments / 4);
  if (segments < 1) throw new Error('segments must be four or more')

  let prevCornersPos = null;
  let prevCornersNeg = null;
  let polygons = [];
  for (let slice = 0; slice <= segments; slice++) {
    let cornersPos = createCorners(center, size, roundRadius, segments, slice, true);
    let cornersNeg = createCorners(center, size, roundRadius, segments, slice, false);

    if (slice === 0) {
      polygons = polygons.concat(stitchSides(cornersNeg, cornersPos));
    }

    if (prevCornersPos) {
      polygons = polygons.concat(stitchCorners(prevCornersPos, cornersPos),
                                 stitchWalls(prevCornersPos, cornersPos));
    }
    if (prevCornersNeg) {
      polygons = polygons.concat(stitchCorners(prevCornersNeg, cornersNeg),
                                 stitchWalls(prevCornersNeg, cornersNeg));
    }

    if (slice === segments) {
      // add the top
      let points = cornersPos.map((corner) => corner[0]);
      polygons.push(poly3$3.fromPoints(points));
      // add the bottom
      points = cornersNeg.map((corner) => corner[0]);
      polygons.push(poly3$3.fromPoints(points));
    }

    prevCornersPos = cornersPos;
    prevCornersNeg = cornersNeg;
  }

  return geom3$3.create(polygons)
};

var roundedCuboid_1 = roundedCuboid;

const {EPS: EPS$8} = constants;

const {vec3: vec3$4} = math;

const {geom3: geom3$4, poly3: poly3$4} = geometry;

/** Construct a cylinder with rounded ends.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.height=2] - height of cylinder
 * @param {Number} [options.radius=1] - radius of cylinder
 * @param {Number} [options.roundRadius=0.2] - radius of rounded edges
 * @param {Number} [options.segments=12] - number of segments to create per 360 rotation
 * @returns {geom3} new 3D geometry
 *
 * @example
 * let mycylinder = roundedCylinder({
 *   height: 10,
 *   radius: 2,
 *   roundRadius: 0.5
 * })
 */
const roundedCylinder = function (options) {
  const defaults = {
    height: 2,
    radius: 1,
    roundRadius: 0.2,
    segments: 12
  };
  let {height, radius, roundRadius, segments} = Object.assign({}, defaults, options);

  if (height < (EPS$8*2)) throw new Error('height must be larger then zero')

  if (roundRadius > (radius - EPS$8)) throw new Error('roundRadius must be smaller then the radius')

  if (segments < 4) throw new Error('segments must be four or more')

  let start = [0, 0, -(height/2)];
  let end = [0, 0, height/2];
  let direction = vec3$4.subtract(end, start);
  let length = vec3$4.length(direction);

  if ((2*roundRadius) > (length - EPS$8)) throw new Error('the cylinder height must be larger than twice roundRadius')

  let defaultnormal;
  if (Math.abs(direction[0]) > Math.abs(direction[1])) {
    defaultnormal = vec3$4.fromValues(0, 1, 0);
  } else {
    defaultnormal = vec3$4.fromValues(1, 0, 0);
  }

  let zvector = vec3$4.scale(roundRadius, vec3$4.unit(direction));
  let xvector = vec3$4.scale(radius, vec3$4.unit(vec3$4.cross(zvector, defaultnormal)));
  let yvector = vec3$4.scale(radius, vec3$4.unit(vec3$4.cross(xvector, zvector)));

  vec3$4.add(start, start, zvector);
  vec3$4.subtract(end, end, zvector);

  let qsegments = Math.floor(0.25 * segments);

  let polygons = [];
  let prevcylinderpoint;
  for (let slice1 = 0; slice1 <= segments; slice1++) {
    let angle = Math.PI * 2.0 * slice1 / segments;
    let cylinderpoint = vec3$4.add(vec3$4.scale(Math.cos(angle), xvector), vec3$4.scale(Math.sin(angle), yvector));
    if (slice1 > 0) {
      // cylinder wall
      let points = [];
      points.push(vec3$4.add(start, cylinderpoint));
      points.push(vec3$4.add(start, prevcylinderpoint));
      points.push(vec3$4.add(end, prevcylinderpoint));
      points.push(vec3$4.add(end, cylinderpoint));
      polygons.push(poly3$4.fromPoints(points));

      let prevcospitch, prevsinpitch;
      for (let slice2 = 0; slice2 <= qsegments; slice2++) {
        let pitch = 0.5 * Math.PI * slice2 / qsegments;
        let cospitch = Math.cos(pitch);
        let sinpitch = Math.sin(pitch);
        if (slice2 > 0) {
          // cylinder rounding, start
          points = [];
          let point;
          point = vec3$4.add(start, vec3$4.subtract(vec3$4.scale(prevcospitch, prevcylinderpoint), vec3$4.scale(prevsinpitch, zvector)));
          points.push(point);
          point = vec3$4.add(start, vec3$4.subtract(vec3$4.scale(prevcospitch, cylinderpoint), vec3$4.scale(prevsinpitch, zvector)));
          points.push(point);
          if (slice2 < qsegments) {
            point = vec3$4.add(start, vec3$4.subtract(vec3$4.scale(cospitch, cylinderpoint), vec3$4.scale(sinpitch, zvector)));
            points.push(point);
          }
          point = vec3$4.add(start, vec3$4.subtract(vec3$4.scale(cospitch, prevcylinderpoint), vec3$4.scale(sinpitch, zvector)));
          points.push(point);

          polygons.push(poly3$4.fromPoints(points));

          // cylinder rounding, end
          points = [];
          point = vec3$4.add(end, vec3$4.add(vec3$4.scale(prevcospitch, prevcylinderpoint), vec3$4.scale(prevsinpitch, zvector)));
          points.push(point);
          point = vec3$4.add(end, vec3$4.add(vec3$4.scale(prevcospitch, cylinderpoint), vec3$4.scale(prevsinpitch, zvector)));
          points.push(point);
          if (slice2 < qsegments) {
            point = vec3$4.add(end, vec3$4.add(vec3$4.scale(cospitch, cylinderpoint), vec3$4.scale(sinpitch, zvector)));
            points.push(point);
          }
          point = vec3$4.add(end, vec3$4.add(vec3$4.scale(cospitch, prevcylinderpoint), vec3$4.scale(sinpitch, zvector)));
          points.push(point);
          points.reverse();

          polygons.push(poly3$4.fromPoints(points));
        }
        prevcospitch = cospitch;
        prevsinpitch = sinpitch;
      }
    }
    prevcylinderpoint = cylinderpoint;
  }
  let result = geom3$4.create(polygons);
  return result
};

var roundedCylinder_1 = roundedCylinder;

const {EPS: EPS$9} = constants;



const {geom2: geom2$1} = geometry;

/**
 * Construct a rounded rectangle.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of rounded rectangle
 * @param {Array} [options.size=[2,2]] - dimension of rounded rectangle; width and length
 * @param {Number} [options.roundRadius=0.2] - round radius of corners
 * @param {Number} [options.segments=16] - number of segments to create per 360 rotation
 * @returns {geom2} new 2D geometry
 *
 * @example
 * let myrectangle = roundedRectangle({size: [10, 20], roundRadius: 2})
 */
const roundedRectangle = (options) => {
  const defaults = {
    center: [0, 0],
    size: [2, 2],
    roundRadius: 0.2,
    segments: 16
  };
  let {size, center, roundRadius, segments} = Object.assign({}, defaults, options);

  if (!Array.isArray(size)) throw new Error('size must be an array')
  if (size.length < 2) throw new Error('size must contain width and length values')

  size = size.map((v) => v / 2); // convert to radius

  if (roundRadius > (size[0] - EPS$9) ||
      roundRadius > (size[1] - EPS$9)) throw new Error('roundRadius must be smaller then the radius of all dimensions')

  let cornersegments = Math.floor(segments / 4);
  if (cornersegments < 1) throw new Error('segments must be four or more')

  // create sets of points that define the corners
  let corner0 = vec2.add(center, [size[0] - roundRadius, size[1] - roundRadius]);
  let corner1 = vec2.add(center, [roundRadius - size[0], size[1] - roundRadius]);
  let corner2 = vec2.add(center, [roundRadius - size[0], roundRadius - size[1]]);
  let corner3 = vec2.add(center, [size[0] - roundRadius, roundRadius - size[1]]);
  let corner0Points = [];
  let corner1Points = [];
  let corner2Points = [];
  let corner3Points = [];
  for (let i = 0; i <= cornersegments; i++) {
    let radians = Math.PI / 2 * i / cornersegments;
    let point = vec2.fromAngleRadians(radians);
    vec2.scale(point, roundRadius, point);
    corner0Points.push(vec2.add(corner0, point));
    vec2.rotate(point, Math.PI / 2, point);
    corner1Points.push(vec2.add(corner1, point));
    vec2.rotate(point, Math.PI / 2, point);
    corner2Points.push(vec2.add(corner2, point));
    vec2.rotate(point, Math.PI / 2, point);
    corner3Points.push(vec2.add(corner3, point));
  }

  return geom2$1.fromPoints(corner0Points.concat(corner1Points, corner2Points, corner3Points))
};

var roundedRectangle_1 = roundedRectangle;

// @see http://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html
const getRadiusRatio = (vertices, density) => {
  if (vertices > 0 && density > 1 && density < vertices / 2) {
    return Math.cos(Math.PI * density / vertices) / Math.cos(Math.PI * (density - 1) / vertices);
  }
  return 0
};

const getPoints = (vertices, radius, startAngle, center) => {
  var a = (Math.PI * 2) / vertices;

  var points = [];
  for (var i = 0; i < vertices; i++) {
    let point = vec2.fromAngleRadians(a * i + startAngle);
    vec2.scale(point, radius, point);
    vec2.add(point, center, point);
    points.push(point);
  }
  return points
};

/** Construct a star from the given options.
 * @see https://en.wikipedia.org/wiki/Star_polygon
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of star
 * @param {Number} [options.vertices=5] - number of vertices (P) on the star
 * @param {Number} [options.density=2] - density (Q) of star
 * @param {Number} [options.outerRadius=1] - outer radius of vertices
 * @param {Number} [options.innerRadius=0] - inner radius of vertices, or zero to calculate
 * @param {Number} [options.startAngle=0] - starting angle for first vertice, in radians
 *
 * @example
 * let star1 = star({vertices: 8, outerRadius: 10}) // star with 8/2 density
 * let star2 = star({vertices: 12, outerRadius: 40, innerRadius: 20}) // star with given radius
 */
const star = (options) => {
  const defaults = {
    center: [0, 0],
    vertices: 5,
    outerRadius: 1,
    innerRadius: 0,
    density: 2,
    startAngle: 0
  };
  var {center, vertices, outerRadius, innerRadius, density, startAngle} = Object.assign({}, defaults, options);

  if (!Array.isArray(center)) throw new Error('center must be an array')
  if (center.length < 2) throw new Error('center must contain X and Y values')

  if (startAngle < 0) throw new Error('startAngle must be positive')

  startAngle = startAngle % (Math.PI * 2);

  // force integers
  vertices = Math.floor(vertices);
  density = Math.floor(density);

  if (innerRadius === 0) {
    innerRadius = outerRadius * getRadiusRatio(vertices, density);
  }

  const centerv = vec2.fromArray(center);

  const outerPoints = getPoints(vertices, outerRadius, startAngle, centerv);
  const innerPoints = getPoints(vertices, innerRadius, startAngle + Math.PI / vertices, centerv);

  const allPoints = [];
  for (var i = 0; i < vertices; i++) {
    allPoints.push(outerPoints[i]);
    allPoints.push(innerPoints[i]);
  }

  return geom2.fromPoints(allPoints)
};

var star_1 = star;

export const primitives = {
  arc: arc_1,
  circle: ellipse_1.circle,
  cube: cuboid_1.cube,
  cuboid: cuboid_1.cuboid,
  cylinder: cylinderElliptic_1.cylinder,
  cylinderElliptic: cylinderElliptic_1.cylinderElliptic,
  ellipse: ellipse_1.ellipse,
  ellipsoid: ellipsoid_1.ellipsoid,
  geodesicSphere: geodesicSphere_1,
  line: line_1,
  polygon: polygon_1,
  polyhedron: polyhedron_1,
  rectangle: rectangle_1.rectangle,
  roundedCuboid: roundedCuboid_1,
  roundedCylinder: roundedCylinder_1,
  roundedRectangle: roundedRectangle_1,
  sphere: ellipsoid_1.sphere,
  square: rectangle_1.square,
  star: star_1,
  // torus: require('./torus')
};

// -- data source from from http://paulbourke.net/dataformats/hershey/
// -- reduced to save some bytes...
// { [ascii code]: [width, x, y, ...] } - undefined value as path separator
var simplex = {
  height: 14,
  32:[16],
  33:[10,5,21,5,7,,5,2,4,1,5,0,6,1,5,2],
  34:[16,4,21,4,14,,12,21,12,14],
  35:[21,11,25,4,-7,,17,25,10,-7,,4,12,18,12,,3,6,17,6],
  36:[20,8,25,8,-4,,12,25,12,-4,,17,18,15,20,12,21,8,21,5,20,3,18,3,16,4,14,5,13,7,12,13,10,15,9,16,8,17,6,17,3,15,1,12,0,8,0,5,1,3,3],
  37:[24,21,21,3,0,,8,21,10,19,10,17,9,15,7,14,5,14,3,16,3,18,4,20,6,21,8,21,10,20,13,19,16,19,19,20,21,21,,17,7,15,6,14,4,14,2,16,0,18,0,20,1,21,3,21,5,19,7,17,7],
  38:[26,23,12,23,13,22,14,21,14,20,13,19,11,17,6,15,3,13,1,11,0,7,0,5,1,4,2,3,4,3,6,4,8,5,9,12,13,13,14,14,16,14,18,13,20,11,21,9,20,8,18,8,16,9,13,11,10,16,3,18,1,20,0,22,0,23,1,23,2],
  39:[10,5,19,4,20,5,21,6,20,6,18,5,16,4,15],
  40:[14,11,25,9,23,7,20,5,16,4,11,4,7,5,2,7,-2,9,-5,11,-7],
  41:[14,3,25,5,23,7,20,9,16,10,11,10,7,9,2,7,-2,5,-5,3,-7],
  42:[16,8,21,8,9,,3,18,13,12,,13,18,3,12],
  43:[26,13,18,13,0,,4,9,22,9],
  44:[10,6,1,5,0,4,1,5,2,6,1,6,-1,5,-3,4,-4],
  45:[26,4,9,22,9],
  46:[10,5,2,4,1,5,0,6,1,5,2],
  47:[22,20,25,2,-7],
  48:[20,9,21,6,20,4,17,3,12,3,9,4,4,6,1,9,0,11,0,14,1,16,4,17,9,17,12,16,17,14,20,11,21,9,21],
  49:[20,6,17,8,18,11,21,11,0],
  50:[20,4,16,4,17,5,19,6,20,8,21,12,21,14,20,15,19,16,17,16,15,15,13,13,10,3,0,17,0],
  51:[20,5,21,16,21,10,13,13,13,15,12,16,11,17,8,17,6,16,3,14,1,11,0,8,0,5,1,4,2,3,4],
  52:[20,13,21,3,7,18,7,,13,21,13,0],
  53:[20,15,21,5,21,4,12,5,13,8,14,11,14,14,13,16,11,17,8,17,6,16,3,14,1,11,0,8,0,5,1,4,2,3,4],
  54:[20,16,18,15,20,12,21,10,21,7,20,5,17,4,12,4,7,5,3,7,1,10,0,11,0,14,1,16,3,17,6,17,7,16,10,14,12,11,13,10,13,7,12,5,10,4,7],
  55:[20,17,21,7,0,,3,21,17,21],
  56:[20,8,21,5,20,4,18,4,16,5,14,7,13,11,12,14,11,16,9,17,7,17,4,16,2,15,1,12,0,8,0,5,1,4,2,3,4,3,7,4,9,6,11,9,12,13,13,15,14,16,16,16,18,15,20,12,21,8,21],
  57:[20,16,14,15,11,13,9,10,8,9,8,6,9,4,11,3,14,3,15,4,18,6,20,9,21,10,21,13,20,15,18,16,14,16,9,15,4,13,1,10,0,8,0,5,1,4,3],
  58:[10,5,14,4,13,5,12,6,13,5,14,,5,2,4,1,5,0,6,1,5,2],
  59:[10,5,14,4,13,5,12,6,13,5,14,,6,1,5,0,4,1,5,2,6,1,6,-1,5,-3,4,-4],
  60:[24,20,18,4,9,20,0],
  61:[26,4,12,22,12,,4,6,22,6],
  62:[24,4,18,20,9,4,0],
  63:[18,3,16,3,17,4,19,5,20,7,21,11,21,13,20,14,19,15,17,15,15,14,13,13,12,9,10,9,7,,9,2,8,1,9,0,10,1,9,2],
  64:[27,18,13,17,15,15,16,12,16,10,15,9,14,8,11,8,8,9,6,11,5,14,5,16,6,17,8,,12,16,10,14,9,11,9,8,10,6,11,5,,18,16,17,8,17,6,19,5,21,5,23,7,24,10,24,12,23,15,22,17,20,19,18,20,15,21,12,21,9,20,7,19,5,17,4,15,3,12,3,9,4,6,5,4,7,2,9,1,12,0,15,0,18,1,20,2,21,3,,19,16,18,8,18,6,19,5],
  65:[18,9,21,1,0,,9,21,17,0,,4,7,14,7],
  66:[21,4,21,4,0,,4,21,13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,,4,11,13,11,16,10,17,9,18,7,18,4,17,2,16,1,13,0,4,0],
  67:[21,18,16,17,18,15,20,13,21,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5],
  68:[21,4,21,4,0,,4,21,11,21,14,20,16,18,17,16,18,13,18,8,17,5,16,3,14,1,11,0,4,0],
  69:[19,4,21,4,0,,4,21,17,21,,4,11,12,11,,4,0,17,0],
  70:[18,4,21,4,0,,4,21,17,21,,4,11,12,11],
  71:[21,18,16,17,18,15,20,13,21,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,18,8,,13,8,18,8],
  72:[22,4,21,4,0,,18,21,18,0,,4,11,18,11],
  73:[8,4,21,4,0],
  74:[16,12,21,12,5,11,2,10,1,8,0,6,0,4,1,3,2,2,5,2,7],
  75:[21,4,21,4,0,,18,21,4,7,,9,12,18,0],
  76:[17,4,21,4,0,,4,0,16,0],
  77:[24,4,21,4,0,,4,21,12,0,,20,21,12,0,,20,21,20,0],
  78:[22,4,21,4,0,,4,21,18,0,,18,21,18,0],
  79:[22,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21],
  80:[21,4,21,4,0,,4,21,13,21,16,20,17,19,18,17,18,14,17,12,16,11,13,10,4,10],
  81:[22,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21,,12,4,18,-2],
  82:[21,4,21,4,0,,4,21,13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,4,11,,11,11,18,0],
  83:[20,17,18,15,20,12,21,8,21,5,20,3,18,3,16,4,14,5,13,7,12,13,10,15,9,16,8,17,6,17,3,15,1,12,0,8,0,5,1,3,3],
  84:[16,8,21,8,0,,1,21,15,21],
  85:[22,4,21,4,6,5,3,7,1,10,0,12,0,15,1,17,3,18,6,18,21],
  86:[18,1,21,9,0,,17,21,9,0],
  87:[24,2,21,7,0,,12,21,7,0,,12,21,17,0,,22,21,17,0],
  88:[20,3,21,17,0,,17,21,3,0],
  89:[18,1,21,9,11,9,0,,17,21,9,11],
  90:[20,17,21,3,0,,3,21,17,21,,3,0,17,0],
  91:[14,4,25,4,-7,,5,25,5,-7,,4,25,11,25,,4,-7,11,-7],
  92:[14,0,21,14,-3],
  93:[14,9,25,9,-7,,10,25,10,-7,,3,25,10,25,,3,-7,10,-7],
  94:[16,6,15,8,18,10,15,,3,12,8,17,13,12,,8,17,8,0],
  95:[16,0,-2,16,-2],
  96:[10,6,21,5,20,4,18,4,16,5,15,6,16,5,17],
  97:[19,15,14,15,0,,15,11,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3],
  98:[19,4,21,4,0,,4,11,6,13,8,14,11,14,13,13,15,11,16,8,16,6,15,3,13,1,11,0,8,0,6,1,4,3],
  99:[18,15,11,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3],
  100:[19,15,21,15,0,,15,11,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3],
  101:[18,3,8,15,8,15,10,14,12,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3],
  102:[12,10,21,8,21,6,20,5,17,5,0,,2,14,9,14],
  103:[19,15,14,15,-2,14,-5,13,-6,11,-7,8,-7,6,-6,,15,11,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3],
  104:[19,4,21,4,0,,4,10,7,13,9,14,12,14,14,13,15,10,15,0],
  105:[8,3,21,4,20,5,21,4,22,3,21,,4,14,4,0],
  106:[10,5,21,6,20,7,21,6,22,5,21,,6,14,6,-3,5,-6,3,-7,1,-7],
  107:[17,4,21,4,0,,14,14,4,4,,8,8,15,0],
  108:[8,4,21,4,0],
  109:[30,4,14,4,0,,4,10,7,13,9,14,12,14,14,13,15,10,15,0,,15,10,18,13,20,14,23,14,25,13,26,10,26,0],
  110:[19,4,14,4,0,,4,10,7,13,9,14,12,14,14,13,15,10,15,0],
  111:[19,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3,16,6,16,8,15,11,13,13,11,14,8,14],
  112:[19,4,14,4,-7,,4,11,6,13,8,14,11,14,13,13,15,11,16,8,16,6,15,3,13,1,11,0,8,0,6,1,4,3],
  113:[19,15,14,15,-7,,15,11,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3],
  114:[13,4,14,4,0,,4,8,5,11,7,13,9,14,12,14],
  115:[17,14,11,13,13,10,14,7,14,4,13,3,11,4,9,6,8,11,7,13,6,14,4,14,3,13,1,10,0,7,0,4,1,3,3],
  116:[12,5,21,5,4,6,1,8,0,10,0,,2,14,9,14],
  117:[19,4,14,4,4,5,1,7,0,10,0,12,1,15,4,,15,14,15,0],
  118:[16,2,14,8,0,,14,14,8,0],
  119:[22,3,14,7,0,,11,14,7,0,,11,14,15,0,,19,14,15,0],
  120:[17,3,14,14,0,,14,14,3,0],
  121:[16,2,14,8,0,,14,14,8,0,6,-4,4,-6,2,-7,1,-7],
  122:[17,14,14,3,0,,3,14,14,14,,3,0,14,0],
  123:[14,9,25,7,24,6,23,5,21,5,19,6,17,7,16,8,14,8,12,6,10,,7,24,6,22,6,20,7,18,8,17,9,15,9,13,8,11,4,9,8,7,9,5,9,3,8,1,7,0,6,-2,6,-4,7,-6,,6,8,8,6,8,4,7,2,6,1,5,-1,5,-3,6,-5,7,-6,9,-7],
  124:[8,4,25,4,-7],
  125:[14,5,25,7,24,8,23,9,21,9,19,8,17,7,16,6,14,6,12,8,10,,7,24,8,22,8,20,7,18,6,17,5,15,5,13,6,11,10,9,6,7,5,5,5,3,6,1,7,0,8,-2,8,-4,7,-6,,8,8,6,6,6,4,7,2,8,1,9,-1,9,-3,8,-5,7,-6,5,-7],
  126:[24,3,6,3,8,4,11,6,12,8,12,10,11,14,8,16,7,18,7,20,8,21,10,,3,8,4,10,6,11,8,11,10,10,14,7,16,6,18,6,20,7,21,10,21,12]
};

const defaultsVectorParams = {
  xOffset: 0,
  yOffset: 0,
  input: '?',
  align: 'left',
  font: simplex,
  height: 14, // == old vector_xxx simplex font height
  lineSpacing: 2.142857142857143, // == 30/14 == old vector_xxx ratio
  letterSpacing: 1,
  extrudeOffset: 0
};

// vectorsXXX parameters handler
function vectorParams (options, input) {
  if (!input && typeof options === 'string') {
    options = { input: options };
  }
  options = options || {};
  let params = Object.assign({}, defaultsVectorParams, options);
  params.input = input || params.input;
  return params
}

var vectorParams_1 = vectorParams;

/** Represents a character as segments
* @typedef {Object} VectorCharObject
* @property {Float} width - character width
* @property {Float} height - character height (uppercase)
* @property {Array} segments - character segments [[[x, y], ...], ...]
*/

/** Construct a {@link VectorCharObject} from a ascii character whose code is between 31 and 127,
* if the character is not supported it is replaced by a question mark.
* @param {Object|String} [options] - options for construction or ascii character
* @param {Float} [options.xOffset=0] - x offset
* @param {Float} [options.yOffset=0] - y offset
* @param {Float} [options.height=21] - font size (uppercase height)
* @param {Float} [options.extrudeOffset=0] - width of the extrusion that will be applied (manually) after the creation of the character
* @param {String} [options.input='?'] - ascii character (ignored/overwrited if provided as seconds parameter)
* @param {String} [char='?'] - ascii character
* @returns {VectorCharObject}
*
* @example
* let vectorCharObject = vectorChar()
* or
* let vectorCharObject = vectorChar('A')
* or
* let vectorCharObject = vectorChar({ xOffset: 57 }, 'C')
* or
* let vectorCharObject = vectorChar({ xOffset: 78, input: '!' })
*/
function vectorChar (options, char) {
  let {
    xOffset, yOffset, input, font, height, extrudeOffset
  } = vectorParams_1(options, char);
  let code = input.charCodeAt(0);
  if (!code || !font[code]) {
    code = 63; // 63 => ?
  }
  let glyph = [].concat(font[code]);
  let ratio = (height - extrudeOffset) / font.height;
  let extrudeYOffset = (extrudeOffset / 2);
  let width = glyph.shift() * ratio;
  let segments = [];
  let polyline = [];
  let gx;
  let gy;
  for (let i = 0, il = glyph.length; i < il; i += 2) {
    gx = ratio * glyph[i] + xOffset;
    gy = ratio * glyph[i + 1] + yOffset + extrudeYOffset;
    if (glyph[i] !== undefined) {
      polyline.push([ gx, gy ]);
      continue
    }
    segments.push(polyline);
    polyline = [];
    i--;
  }
  if (polyline.length) {
    segments.push(polyline);
  }
  return { width, height, segments }
}

var vectorChar_1 = vectorChar;

// translate text line
function translateLine (options, line) {
  const { x, y } = Object.assign({ x: 0, y: 0 }, options || {});
  let segments = line.segments;
  let segment = null;
  let point = null;
  for (let i = 0, il = segments.length; i < il; i++) {
    segment = segments[i];
    for (let j = 0, jl = segment.length; j < jl; j++) {
      point = segment[j];
      segment[j] = [point[0] + x, point[1] + y];
    }
  }
  return line
}

/** Represents a character as segments
* @typedef {Object} VectorCharObject
* @property {Float} width - character width
* @property {Float} height - character height (uppercase)
* @property {Array} segments - character segments [[[x, y], ...], ...]
*/

/** Construct an array of character segments from a ascii string whose characters code is between 31 and 127,
* if one character is not supported it is replaced by a question mark.
* @param {Object|String} [options] - options for construction or ascii string
* @param {Float} [options.xOffset=0] - x offset
* @param {Float} [options.yOffset=0] - y offset
* @param {Float} [options.height=21] - font size (uppercase height)
* @param {Float} [options.lineSpacing=1.4] - line spacing expressed as a percentage of font size
* @param {Float} [options.letterSpacing=1] - extra letter spacing expressed as a percentage of font size
* @param {String} [options.align='left'] - multi-line text alignement: left, center or right
* @param {Float} [options.extrudeOffset=0] - width of the extrusion that will be applied (manually) after the creation of the character
* @param {String} [options.input='?'] - ascii string (ignored/overwrited if provided as seconds parameter)
* @param {String} [text='?'] - ascii string
* @returns {Array} characters segments [[[x, y], ...], ...]
*
* @example
* let textSegments = vectorText()
* or
* let textSegments = vectorText('OpenJSCAD')
* or
* let textSegments = vectorText({ yOffset: -50 }, 'OpenJSCAD')
* or
* let textSegments = vectorText({ yOffset: -80, input: 'OpenJSCAD' })
*/
function vectorText (options, text) {
  let {
    xOffset, yOffset, input, font, height, align, extrudeOffset, lineSpacing, letterSpacing
  } = vectorParams_1(options, text);
  let [ x, y ] = [ xOffset, yOffset ];
  let [ i, il, char, vect, width, diff ] = [];
  let line = { width: 0, segments: [] };
  let lines = [];
  let output = [];
  let maxWidth = 0;
  let lineStart = x;
  const pushLine = () => {
    lines.push(line);
    maxWidth = Math.max(maxWidth, line.width);
    line = { width: 0, segments: [] };
  };
  for (i = 0, il = input.length; i < il; i++) {
    char = input[i];
    vect = vectorChar_1({ xOffset: x, yOffset: y, font, height, extrudeOffset }, char);
    if (char === '\n') {
      x = lineStart;
      y -= vect.height * lineSpacing;
      pushLine();
      continue
    }
    width = vect.width * letterSpacing;
    line.width += width;
    x += width;
    if (char !== ' ') {
      line.segments = line.segments.concat(vect.segments);
    }
  }
  if (line.segments.length) {
    pushLine();
  }
  for (i = 0, il = lines.length; i < il; i++) {
    line = lines[i];
    if (maxWidth > line.width) {
      diff = maxWidth - line.width;
      if (align === 'right') {
        line = translateLine({ x: diff }, line);
      } else if (align === 'center') {
        line = translateLine({ x: diff / 2 }, line);
      }
    }
    output = output.concat(line.segments);
  }
  return output
}

var vectorText_1 = vectorText;

export const text = {
  vectorChar: vectorChar_1,
  vectorText: vectorText_1
};

// list of supported geometries
const {geom2: geom2$2, geom3: geom3$5, path2: path2$1} = geometry;

const areAllShapesTheSameType = (shapes) => {
  let previousType;
  shapes.forEach((shape) => {
    let currentType = 0;
    if (geom2$2.isA(shape)) currentType = 1;
    if (geom3$5.isA(shape)) currentType = 2;
    if (path2$1.isA(shape)) currentType = 3;

    if (previousType && currentType !== previousType) return false
    previousType = currentType;
  });
  return true
};

var areAllShapesTheSameType_1 = areAllShapesTheSameType;

const fnNumberSort = (a, b) => {
  return a - b
};

var fnNumberSort_1 = fnNumberSort;

const insertSorted = (array, element, comparefunc) => {
  let leftbound = 0;
  let rightbound = array.length;
  while (rightbound > leftbound) {
    let testindex = Math.floor((leftbound + rightbound) / 2);
    let testelement = array[testindex];
    let compareresult = comparefunc(element, testelement);
    if (compareresult > 0) // element > testelement
    {
      leftbound = testindex + 1;
    } else {
      rightbound = testindex;
    }
  }
  array.splice(leftbound, 0, element);
};

var insertSorted_1 = insertSorted;

// Get the x coordinate of a point with a certain y coordinate, interpolated between two points.
// Interpolation is robust even if the points have the same y coordinate
const interpolateBetween2DPointsForY = (point1, point2, y) => {
  let f1 = y - point1[1];
  let f2 = point2[1] - point1[1];
  if (f2 < 0) {
    f1 = -f1;
    f2 = -f2;
  }
  let t;
  if (f1 <= 0) {
    t = 0.0;
  } else if (f1 >= f2) {
    t = 1.0;
  } else if (f2 < 1e-10) { // FIXME Should this be EPS?
    t = 0.5;
  } else {
    t = f1 / f2;
  }
  let result = point1[0] + t * (point2[0] - point1[0]);
  return result
};

var interpolateBetween2DPointsForY_1 = interpolateBetween2DPointsForY;

const utils$1 = {
  areAllShapesTheSameType: areAllShapesTheSameType_1,
  flatten: flatten_1,
  fnNumberSort: fnNumberSort_1,
  insertSorted: insertSorted_1,
  interpolateBetween2DPointsForY: interpolateBetween2DPointsForY_1
};

const { vec2: vec2$6 } = math;

const { geom2: geom2$3 } = geometry;

const fromFakePolygon = (polygon) => {
  // this can happen based on union, seems to be residuals -
  // return null and handle in caller
  if (polygon.vertices.length < 4) {
    return null
  }
  const vert1Indices = [];
  const pts2d = polygon.vertices.filter((vertex, i) => {
    if (vertex[2] > 0) {
      vert1Indices.push(i);
      return true
    }
    return false
  }).map((vertex) => vec2$6.fromArray(vertex));

  if (pts2d.length !== 2) {
    throw new Error('Assertion failed: fromFakePolygon: not enough points found') // TBD remove later
  }
  const d = vert1Indices[1] - vert1Indices[0];
  if (d === 1 || d === 3) {
    if (d === 1) {
      pts2d.reverse();
    }
  } else {
    throw new Error('Assertion failed: fromFakePolygon: unknown index ordering')
  }
  return pts2d
};

/*
 * Convert the given polygons to a list of sides.
 * The polygons must have only z coordinates +1 and -1, as constructed by to3DWalls().
 */
const fromFakePolygons = (polygons) => {
  let sides = polygons.map((polygon) => fromFakePolygon(polygon)).filter((polygon) => (polygon !== null));
  return geom2$3.create(sides)
};

var fromFakePolygons_1 = fromFakePolygons;

const { vec3: vec3$5 } = math;

const { geom2: geom2$4, geom3: geom3$6, poly3: poly3$5 } = geometry;

/*
 * Create a polygon (wall) from the given Z values and side.
 */
const to3DWall = (z0, z1, side) => {
  const points = [
    vec3$5.fromVec2(side[0], z0),
    vec3$5.fromVec2(side[1], z0),
    vec3$5.fromVec2(side[1], z1),
    vec3$5.fromVec2(side[0], z1)
  ];
  return poly3$5.fromPoints(points)
};

/*
 * Create a 3D geometry with walls, as constructed from the given options and geometry.
 *
 * @param {Object} options - options with Z offsets
 * @param {geom2} geometry - geometry used as base of walls
 * @return {geom3} the new geometry
 */
const to3DWalls = (options, geometry) => {
  let sides = geom2$4.toSides(geometry);

  let polygons = sides.map((side) => to3DWall(options.z0, options.z1, side));

  let result = geom3$6.create(polygons);
  return result
};

var to3DWalls_1 = to3DWalls;

const { EPS: EPS$a } = constants;

const { line2: line2$1, vec2: vec2$7 } = math;


const { interpolateBetween2DPointsForY: interpolateBetween2DPointsForY$1, insertSorted: insertSorted$1, fnNumberSort: fnNumberSort$1 } = utils$1;

const { poly3: poly3$6 } = geometry;

/*
 * Retesselation for a set of COPLANAR polygons.
 * @param {poly3[]} sourcepolygons - list of polygons
 * @returns {poly3[]} new set of polygons
 */
const reTesselateCoplanarPolygons = (sourcepolygons) => {
  if (sourcepolygons.length < 2) return sourcepolygons

  const destpolygons = [];
  const numpolygons = sourcepolygons.length;
  const plane = sourcepolygons[0].plane;
  const orthobasis = new OrthoNormalBasis_1(plane);
  const polygonvertices2d = []; // array of array of Vector2D
  const polygontopvertexindexes = []; // array of indexes of topmost vertex per polygon
  const topy2polygonindexes = {};
  const ycoordinatetopolygonindexes = {};

  const ycoordinatebins = {};

  // convert all polygon vertices to 2D
  // Make a list of all encountered y coordinates
  // And build a map of all polygons that have a vertex at a certain y coordinate:
  const ycoordinateBinningFactor = 1.0 / EPS$a * 10;
  for (let polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
    const poly3d = sourcepolygons[polygonindex];
    let vertices2d = [];
    let numvertices = poly3d.vertices.length;
    let minindex = -1;
    if (numvertices > 0) {
      let miny;
      let maxy;
      for (let i = 0; i < numvertices; i++) {
        let pos2d = orthobasis.to2D(poly3d.vertices[i]);
        // perform binning of y coordinates: If we have multiple vertices very
        // close to each other, give them the same y coordinate:
        const ycoordinatebin = Math.floor(pos2d[1] * ycoordinateBinningFactor);
        let newy;
        if (ycoordinatebin in ycoordinatebins) {
          newy = ycoordinatebins[ycoordinatebin];
        } else if (ycoordinatebin + 1 in ycoordinatebins) {
          newy = ycoordinatebins[ycoordinatebin + 1];
        } else if (ycoordinatebin - 1 in ycoordinatebins) {
          newy = ycoordinatebins[ycoordinatebin - 1];
        } else {
          newy = pos2d[1];
          ycoordinatebins[ycoordinatebin] = pos2d[1];
        }
        pos2d = vec2$7.fromValues(pos2d[0], newy);
        vertices2d.push(pos2d);
        const y = pos2d[1];
        if ((i === 0) || (y < miny)) {
          miny = y;
          minindex = i;
        }
        if ((i === 0) || (y > maxy)) {
          maxy = y;
        }
        if (!(y in ycoordinatetopolygonindexes)) {
          ycoordinatetopolygonindexes[y] = {};
        }
        ycoordinatetopolygonindexes[y][polygonindex] = true;
      }
      if (miny >= maxy) {
        // degenerate polygon, all vertices have same y coordinate. Just ignore it from now:
        vertices2d = [];
        numvertices = 0;
        minindex = -1;
      } else {
        if (!(miny in topy2polygonindexes)) {
          topy2polygonindexes[miny] = [];
        }
        topy2polygonindexes[miny].push(polygonindex);
      }
    } // if(numvertices > 0)
    // reverse the vertex order:
    vertices2d.reverse();
    minindex = numvertices - minindex - 1;
    polygonvertices2d.push(vertices2d);
    polygontopvertexindexes.push(minindex);
  }
  const ycoordinates = [];
  for (let ycoordinate in ycoordinatetopolygonindexes) ycoordinates.push(ycoordinate);
  ycoordinates.sort(fnNumberSort$1);

  // Now we will iterate over all y coordinates, from lowest to highest y coordinate
  // activepolygons: source polygons that are 'active', i.e. intersect with our y coordinate
  //   Is sorted so the polygons are in left to right order
  // Each element in activepolygons has these properties:
  //        polygonindex: the index of the source polygon (i.e. an index into the sourcepolygons
  //                      and polygonvertices2d arrays)
  //        leftvertexindex: the index of the vertex at the left side of the polygon (lowest x)
  //                         that is at or just above the current y coordinate
  //        rightvertexindex: dito at right hand side of polygon
  //        topleft, bottomleft: coordinates of the left side of the polygon crossing the current y coordinate
  //        topright, bottomright: coordinates of the right hand side of the polygon crossing the current y coordinate
  let activepolygons = [];
  let prevoutpolygonrow = [];
  for (let yindex = 0; yindex < ycoordinates.length; yindex++) {
    const newoutpolygonrow = [];
    const ycoordinateasstring = ycoordinates[yindex];
    const ycoordinate = Number(ycoordinateasstring);

    // update activepolygons for this y coordinate:
    // - Remove any polygons that end at this y coordinate
    // - update leftvertexindex and rightvertexindex (which point to the current vertex index
    //   at the the left and right side of the polygon
    // Iterate over all polygons that have a corner at this y coordinate:
    const polygonindexeswithcorner = ycoordinatetopolygonindexes[ycoordinateasstring];
    for (let activepolygonindex = 0; activepolygonindex < activepolygons.length; ++activepolygonindex) {
      const activepolygon = activepolygons[activepolygonindex];
      const polygonindex = activepolygon.polygonindex;
      if (polygonindexeswithcorner[polygonindex]) {
        // this active polygon has a corner at this y coordinate:
        const vertices2d = polygonvertices2d[polygonindex];
        const numvertices = vertices2d.length;
        let newleftvertexindex = activepolygon.leftvertexindex;
        let newrightvertexindex = activepolygon.rightvertexindex;
        // See if we need to increase leftvertexindex or decrease rightvertexindex:
        while (true) {
          let nextleftvertexindex = newleftvertexindex + 1;
          if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0;
          if (vertices2d[nextleftvertexindex][1] !== ycoordinate) break
          newleftvertexindex = nextleftvertexindex;
        }
        let nextrightvertexindex = newrightvertexindex - 1;
        if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1;
        if (vertices2d[nextrightvertexindex][1] === ycoordinate) {
          newrightvertexindex = nextrightvertexindex;
        }
        if ((newleftvertexindex !== activepolygon.leftvertexindex) && (newleftvertexindex === newrightvertexindex)) {
          // We have increased leftvertexindex or decreased rightvertexindex, and now they point to the same vertex
          // This means that this is the bottom point of the polygon. We'll remove it:
          activepolygons.splice(activepolygonindex, 1);
          --activepolygonindex;
        } else {
          activepolygon.leftvertexindex = newleftvertexindex;
          activepolygon.rightvertexindex = newrightvertexindex;
          activepolygon.topleft = vertices2d[newleftvertexindex];
          activepolygon.topright = vertices2d[newrightvertexindex];
          let nextleftvertexindex = newleftvertexindex + 1;
          if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0;
          activepolygon.bottomleft = vertices2d[nextleftvertexindex];
          let nextrightvertexindex = newrightvertexindex - 1;
          if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1;
          activepolygon.bottomright = vertices2d[nextrightvertexindex];
        }
      } // if polygon has corner here
    } // for activepolygonindex
    let nextycoordinate;
    if (yindex >= ycoordinates.length - 1) {
      // last row, all polygons must be finished here:
      activepolygons = [];
      nextycoordinate = null;
    } else { // yindex < ycoordinates.length-1
      nextycoordinate = Number(ycoordinates[yindex + 1]);
      const middleycoordinate = 0.5 * (ycoordinate + nextycoordinate);
      // update activepolygons by adding any polygons that start here:
      const startingpolygonindexes = topy2polygonindexes[ycoordinateasstring];
      for (let polygonindexKey in startingpolygonindexes) {
        const polygonindex = startingpolygonindexes[polygonindexKey];
        const vertices2d = polygonvertices2d[polygonindex];
        const numvertices = vertices2d.length;
        const topvertexindex = polygontopvertexindexes[polygonindex];
        // the top of the polygon may be a horizontal line. In that case topvertexindex can point to any point on this line.
        // Find the left and right topmost vertices which have the current y coordinate:
        let topleftvertexindex = topvertexindex;
        while (true) {
          let i = topleftvertexindex + 1;
          if (i >= numvertices) i = 0;
          if (vertices2d[i][1] !== ycoordinate) break
          if (i === topvertexindex) break // should not happen, but just to prevent endless loops
          topleftvertexindex = i;
        }
        let toprightvertexindex = topvertexindex;
        while (true) {
          let i = toprightvertexindex - 1;
          if (i < 0) i = numvertices - 1;
          if (vertices2d[i][1] !== ycoordinate) break
          if (i === topleftvertexindex) break // should not happen, but just to prevent endless loops
          toprightvertexindex = i;
        }
        let nextleftvertexindex = topleftvertexindex + 1;
        if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0;
        let nextrightvertexindex = toprightvertexindex - 1;
        if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1;
        const newactivepolygon = {
          polygonindex: polygonindex,
          leftvertexindex: topleftvertexindex,
          rightvertexindex: toprightvertexindex,
          topleft: vertices2d[topleftvertexindex],
          topright: vertices2d[toprightvertexindex],
          bottomleft: vertices2d[nextleftvertexindex],
          bottomright: vertices2d[nextrightvertexindex]
        };
        insertSorted$1(activepolygons, newactivepolygon, (el1, el2) => {
          const x1 = interpolateBetween2DPointsForY$1(el1.topleft, el1.bottomleft, middleycoordinate);
          const x2 = interpolateBetween2DPointsForY$1(el2.topleft, el2.bottomleft, middleycoordinate);
          if (x1 > x2) return 1
          if (x1 < x2) return -1
          return 0
        });
      } // for(let polygonindex in startingpolygonindexes)
    } //  yindex < ycoordinates.length-1
    // if( (yindex === ycoordinates.length-1) || (nextycoordinate - ycoordinate > EPS) )
    // FIXME : what ???
    {
      // Now activepolygons is up to date
      // Build the output polygons for the next row in newoutpolygonrow:
      for (let activepolygonKey in activepolygons) {
        const activepolygon = activepolygons[activepolygonKey];

        let x = interpolateBetween2DPointsForY$1(activepolygon.topleft, activepolygon.bottomleft, ycoordinate);
        const topleft = vec2$7.fromValues(x, ycoordinate);
        x = interpolateBetween2DPointsForY$1(activepolygon.topright, activepolygon.bottomright, ycoordinate);
        const topright = vec2$7.fromValues(x, ycoordinate);
        x = interpolateBetween2DPointsForY$1(activepolygon.topleft, activepolygon.bottomleft, nextycoordinate);
        const bottomleft = vec2$7.fromValues(x, nextycoordinate);
        x = interpolateBetween2DPointsForY$1(activepolygon.topright, activepolygon.bottomright, nextycoordinate);
        const bottomright = vec2$7.fromValues(x, nextycoordinate);
        const outpolygon = {
          topleft: topleft,
          topright: topright,
          bottomleft: bottomleft,
          bottomright: bottomright,
          leftline: line2$1.fromPoints(topleft, bottomleft),
          rightline: line2$1.fromPoints(bottomright, topright)
        };
        if (newoutpolygonrow.length > 0) {
          const prevoutpolygon = newoutpolygonrow[newoutpolygonrow.length - 1];
          const d1 = vec2$7.distance(outpolygon.topleft, prevoutpolygon.topright);
          const d2 = vec2$7.distance(outpolygon.bottomleft, prevoutpolygon.bottomright);
          if ((d1 < EPS$a) && (d2 < EPS$a)) {
            // we can join this polygon with the one to the left:
            outpolygon.topleft = prevoutpolygon.topleft;
            outpolygon.leftline = prevoutpolygon.leftline;
            outpolygon.bottomleft = prevoutpolygon.bottomleft;
            newoutpolygonrow.splice(newoutpolygonrow.length - 1, 1);
          }
        }
        newoutpolygonrow.push(outpolygon);
      } // for(activepolygon in activepolygons)
      if (yindex > 0) {
        // try to match the new polygons against the previous row:
        const prevcontinuedindexes = {};
        const matchedindexes = {};
        for (let i = 0; i < newoutpolygonrow.length; i++) {
          const thispolygon = newoutpolygonrow[i];
          for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
            if (!matchedindexes[ii]) { // not already processed?
              // We have a match if the sidelines are equal or if the top coordinates
              // are on the sidelines of the previous polygon
              const prevpolygon = prevoutpolygonrow[ii];
              if (vec2$7.distance(prevpolygon.bottomleft, thispolygon.topleft) < EPS$a) {
                if (vec2$7.distance(prevpolygon.bottomright, thispolygon.topright) < EPS$a) {
                  // Yes, the top of this polygon matches the bottom of the previous:
                  matchedindexes[ii] = true;
                  // Now check if the joined polygon would remain convex:
                  const v1 = line2$1.direction(thispolygon.leftline);
                  const v2 = line2$1.direction(prevpolygon.leftline);
                  const d1 = v1[0] - v2[0];

                  const v3 = line2$1.direction(thispolygon.rightline);
                  const v4 = line2$1.direction(prevpolygon.rightline);
                  const d2 = v3[0] - v4[0];

                  const leftlinecontinues = Math.abs(d1) < EPS$a;
                  const rightlinecontinues = Math.abs(d2) < EPS$a;
                  const leftlineisconvex = leftlinecontinues || (d1 >= 0);
                  const rightlineisconvex = rightlinecontinues || (d2 >= 0);
                  if (leftlineisconvex && rightlineisconvex) {
                    // yes, both sides have convex corners:
                    // This polygon will continue the previous polygon
                    thispolygon.outpolygon = prevpolygon.outpolygon;
                    thispolygon.leftlinecontinues = leftlinecontinues;
                    thispolygon.rightlinecontinues = rightlinecontinues;
                    prevcontinuedindexes[ii] = true;
                  }
                  break
                }
              }
            } // if(!prevcontinuedindexes[ii])
          } // for ii
        } // for i
        for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
          if (!prevcontinuedindexes[ii]) {
            // polygon ends here
            // Finish the polygon with the last point(s):
            const prevpolygon = prevoutpolygonrow[ii];
            prevpolygon.outpolygon.rightpoints.push(prevpolygon.bottomright);
            if (vec2$7.distance(prevpolygon.bottomright, prevpolygon.bottomleft) > EPS$a) {
              // polygon ends with a horizontal line:
              prevpolygon.outpolygon.leftpoints.push(prevpolygon.bottomleft);
            }
            // reverse the left half so we get a counterclockwise circle:
            prevpolygon.outpolygon.leftpoints.reverse();
            const points2d = prevpolygon.outpolygon.rightpoints.concat(prevpolygon.outpolygon.leftpoints);
            const vertices3d = points2d.map((point2d) => orthobasis.to3D(point2d));
            const polygon = poly3$6.fromPointsAndPlane(vertices3d, plane); // TODO support shared
            destpolygons.push(polygon);
          }
        }
      } // if(yindex > 0)
      for (let i = 0; i < newoutpolygonrow.length; i++) {
        const thispolygon = newoutpolygonrow[i];
        if (!thispolygon.outpolygon) {
          // polygon starts here:
          thispolygon.outpolygon = {
            leftpoints: [],
            rightpoints: []
          };
          thispolygon.outpolygon.leftpoints.push(thispolygon.topleft);
          if (vec2$7.distance(thispolygon.topleft, thispolygon.topright) > EPS$a) {
            // we have a horizontal line at the top:
            thispolygon.outpolygon.rightpoints.push(thispolygon.topright);
          }
        } else {
          // continuation of a previous row
          if (!thispolygon.leftlinecontinues) {
            thispolygon.outpolygon.leftpoints.push(thispolygon.topleft);
          }
          if (!thispolygon.rightlinecontinues) {
            thispolygon.outpolygon.rightpoints.push(thispolygon.topright);
          }
        }
      }
      prevoutpolygonrow = newoutpolygonrow;
    }
  } // for yindex
  return destpolygons
};

var reTesselateCoplanarPolygons_1 = reTesselateCoplanarPolygons;

const { vec3: vec3$6 } = math;

const { geom3: geom3$7 } = geometry;



const coplanar = (plane1, plane2) => {
  // expect the same distance from the origin, within tolerance
  if (Math.abs(plane1[3] - plane2[3]) < 0.00000015) {
    // expect a zero (0) angle between the normals
    if (vec3$6.angle(plane1, plane2) === 0) return true
  }
  return false
};

/*
  After boolean operations all coplanar polygon fragments are joined by a retesselating
  operation. geom3.reTesselate(geom).
  Retesselation is done through a linear sweep over the polygon surface.
  The sweep line passes over the y coordinates of all vertices in the polygon.
  Polygons are split at each sweep line, and the fragments are joined horizontally and vertically into larger polygons
  (making sure that we will end up with convex polygons).
*/
const retessellate = (geometry) => {
  if (geometry.isRetesselated) {
    return geometry
  }

  const polygons = geom3$7.toPolygons(geometry);
  const polygonsPerPlane = []; // elements: [plane, [poly3...]]
  polygons.forEach((polygon) => {
    let mapping = polygonsPerPlane.find((element) => coplanar(element[0], polygon.plane));
    if (mapping) {
      let polygons = mapping[1];
      polygons.push(polygon);
    } else {
      polygonsPerPlane.push([polygon.plane, [polygon]]);
    }
  });

  let destpolygons = [];
  polygonsPerPlane.forEach((mapping) => {
    let sourcepolygons = mapping[1];
    const retesselayedpolygons = reTesselateCoplanarPolygons_1(sourcepolygons);
    destpolygons = destpolygons.concat(retesselayedpolygons);
  });

  const result = geom3$7.create(destpolygons);
  result.isRetesselated = true;

  return result
};

var retessellate_1 = retessellate;

const { vec2: vec2$8, vec3: vec3$7 } = math;

const { geom2: geom2$5, geom3: geom3$8, path2: path2$2, poly3: poly3$7 } = geometry;

/*
 * Measure the min and max bounds of the given (path2) geometry.
 * @return {Array[]} the min and max bounds for the geometry
 */
const measureBoundsOfPath2 = (geometry) => {
  const points = path2$2.toPoints(geometry);

  let minpoint;
  if (points.length === 0) {
    minpoint = vec2$8.create();
  } else {
    minpoint = vec2$8.clone(points[0]);
  }
  let maxpoint = vec2$8.clone(minpoint);

  points.forEach((point) => {
    vec2$8.min(minpoint, minpoint, point);
    vec2$8.max(maxpoint, maxpoint, point);
  });
  minpoint = [minpoint[0], minpoint[1], 0];
  maxpoint = [maxpoint[0], maxpoint[1], 0];

  return [minpoint, maxpoint]
};

/*
 * Measure the min and max bounds of the given (geom2) geometry.
 * @return {Array[]} the min and max bounds for the geometry
 */
const measureBoundsOfGeom2 = (geometry) => {
  const points = geom2$5.toPoints(geometry);

  let minpoint;
  if (points.length === 0) {
    minpoint = vec2$8.create();
  } else {
    minpoint = vec2$8.clone(points[0]);
  }
  let maxpoint = vec2$8.clone(minpoint);

  points.forEach((point) => {
    vec2$8.min(minpoint, minpoint, point);
    vec2$8.max(maxpoint, maxpoint, point);
  });

  minpoint = [minpoint[0], minpoint[1], 0];
  maxpoint = [maxpoint[0], maxpoint[1], 0];

  return [minpoint, maxpoint]
};

/*
 * Measure the min and max bounds of the given (geom3) geometry.
 * @return {Array[]} the min and max bounds for the geometry
 */
const measureBoundsOfGeom3 = (geometry) => {
  const polygons = geom3$8.toPolygons(geometry);

  let minpoint = vec3$7.create();
  if (polygons.length > 0) {
    let points = poly3$7.toPoints(polygons[0]);
    vec3$7.clone(minpoint, points[0]);
  }
  let maxpoint = vec3$7.clone(minpoint);

  polygons.forEach((polygon) => {
    poly3$7.toPoints(polygon).forEach((point) => {
      vec3$7.min(minpoint, minpoint, point);
      vec3$7.max(maxpoint, maxpoint, point);
    });
  });

  minpoint = [minpoint[0], minpoint[1], minpoint[2]];
  maxpoint = [maxpoint[0], maxpoint[1], maxpoint[2]];

  return [minpoint, maxpoint]
};

/**
 * Measure the min and max bounds of the given geometry(s),
 * where min and max bounds are an array of [x,y,z]
 * @param {...geometries} geometries - the geometry(s) to measure
 * @return {Array[]} the min and max bounds for each geometry
 *
 * @example
 * let bounds = measureBounds(sphere())
 */
const measureBounds = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2$2.isA(geometry)) return measureBoundsOfPath2(geometry)
    if (geom2$5.isA(geometry)) return measureBoundsOfGeom2(geometry)
    if (geom3$8.isA(geometry)) return measureBoundsOfGeom3(geometry)
    return [[0, 0, 0], [0, 0, 0]]
  });
  return results.length === 1 ? results[0] : results
};

var measureBounds_1 = measureBounds;

const { EPS: EPS$b } = constants;



/**
 * Determine if the given geometries overlap by comparing min and max bounds.
 * NOTE: This is used in union for performace gains.
 * @param {geom3} geometry1 - geometry for comparision
 * @param {geom3} geometry2 - geometry for comparision
 * @returns {boolean} true if the geometries overlap
 */
const mayOverlap = (geometry1, geometry2) => {
  // FIXME accessing the data structure of the geometry should not be allowed
  if ((geometry1.polygons.length === 0) || (geometry2.polygons.length === 0)) {
    return false
  }

  let bounds1 = measureBounds_1(geometry1);
  let min1 = bounds1[0];
  let max1 = bounds1[1];

  let bounds2 = measureBounds_1(geometry2);
  let min2 = bounds2[0];
  let max2 = bounds2[1];

  if ((min2[0] - max1[0]) > EPS$b) return false
  if ((min1[0] - max2[0]) > EPS$b) return false
  if ((min2[1] - max1[1]) > EPS$b) return false
  if ((min1[1] - max2[1]) > EPS$b) return false
  if ((min2[2] - max1[2]) > EPS$b) return false
  if ((min1[2] - max2[2]) > EPS$b) return false
  return true
};

var mayOverlap_1 = mayOverlap;

const { plane: plane$2 } = math;

// # class Node
// Holds a node in a BSP tree. A BSP tree is built from a collection of polygons
// by picking a polygon to split along.
// Polygons are not stored directly in the tree, but in PolygonTreeNodes, stored in
// this.polygontreenodes. Those PolygonTreeNodes are children of the owning
// Tree.polygonTree
// This is not a leafy BSP tree since there is
// no distinction between internal and leaf nodes.
const Node = function (parent) {
  this.plane = null;
  this.front = null;
  this.back = null;
  this.polygontreenodes = [];
  this.parent = parent;
};

Node.prototype = {
  // Convert solid space to empty space and empty space to solid space.
  invert: function () {
    let queue = [this];
    let node;
    for (let i = 0; i < queue.length; i++) {
      node = queue[i];
      if (node.plane) node.plane = plane$2.flip(node.plane);
      if (node.front) queue.push(node.front);
      if (node.back) queue.push(node.back);
      let temp = node.front;
      node.front = node.back;
      node.back = temp;
    }
  },

  // clip polygontreenodes to our plane
  // calls remove() for all clipped PolygonTreeNodes
  clipPolygons: function (polygontreenodes, alsoRemovecoplanarFront) {
    let current = { 'node': this, 'polygontreenodes': polygontreenodes };
    let node;
    let stack = [];

    do {
      node = current.node;
      polygontreenodes = current.polygontreenodes;

      // begin "function"
      if (node.plane) {
        let backnodes = [];
        let frontnodes = [];
        let coplanarfrontnodes = alsoRemovecoplanarFront ? backnodes : frontnodes;
        let plane = node.plane;
        let numpolygontreenodes = polygontreenodes.length;
        for (let i = 0; i < numpolygontreenodes; i++) {
          let node1 = polygontreenodes[i];
          if (!node1.isRemoved()) {
            node1.splitByPlane(plane, coplanarfrontnodes, backnodes, frontnodes, backnodes);
          }
        }

        if (node.front && (frontnodes.length > 0)) {
          stack.push({ 'node': node.front, 'polygontreenodes': frontnodes });
        }
        let numbacknodes = backnodes.length;
        if (node.back && (numbacknodes > 0)) {
          stack.push({ 'node': node.back, 'polygontreenodes': backnodes });
        } else {
          // there's nothing behind this plane. Delete the nodes behind this plane:
          for (let i = 0; i < numbacknodes; i++) {
            backnodes[i].remove();
          }
        }
      }
      current = stack.pop();
    } while (current !== undefined)
  },

  // Remove all polygons in this BSP tree that are inside the other BSP tree
  // `tree`.
  clipTo: function (tree, alsoRemovecoplanarFront) {
    let node = this;
    let stack = [];
    do {
      if (node.polygontreenodes.length > 0) {
        tree.rootnode.clipPolygons(node.polygontreenodes, alsoRemovecoplanarFront);
      }
      if (node.front) stack.push(node.front);
      if (node.back) stack.push(node.back);
      node = stack.pop();
    } while (node !== undefined)
  },

  addPolygonTreeNodes: function (newpolygontreenodes) {
    let current = { 'node': this, 'polygontreenodes': newpolygontreenodes };
    let stack = [];
    do {
      let node = current.node;
      let polygontreenodes = current.polygontreenodes;

      if (polygontreenodes.length === 0) {
        current = stack.pop();
        continue
      }
      if (!node.plane) {
        let index = 0; // default
        index = Math.floor(polygontreenodes.length / 2);
        //index = polygontreenodes.length >> 1
        //index = Math.floor(Math.random()*polygontreenodes.length)
        let bestplane = polygontreenodes[index].getPolygon().plane;
        node.plane = bestplane;
      }
      let frontnodes = [];
      let backnodes = [];

      for (let i = 0, n = polygontreenodes.length; i < n; ++i) {
        polygontreenodes[i].splitByPlane(node.plane, node.polygontreenodes, backnodes, frontnodes, backnodes);
      }

      if (frontnodes.length > 0) {
        if (!node.front) node.front = new Node(node);
        stack.push({ 'node': node.front, 'polygontreenodes': frontnodes });
      }
      if (backnodes.length > 0) {
        if (!node.back) node.back = new Node(node);
        stack.push({ 'node': node.back, 'polygontreenodes': backnodes });
      }

      current = stack.pop();
    } while (current !== undefined)
  },

  // TODO is this still used?
  getParentPlaneNormals: function (normals, maxdepth) {
    if (maxdepth > 0) {
      if (this.parent) {
        normals.push(this.parent.plane.normal);
        this.parent.getParentPlaneNormals(normals, maxdepth - 1);
      }
    }
  }
};

var Node_1 = Node;

const { vec3: vec3$8 } = math;

const splitLineSegmentByPlane$1 = (plane, p1, p2) => {
  const direction = vec3$8.subtract(p2, p1);
  let lambda = (plane[3] - vec3$8.dot(plane, p1)) / vec3$8.dot(plane, direction);
  if (Number.isNaN(lambda)) lambda = 0;
  if (lambda > 1) lambda = 1;
  if (lambda < 0) lambda = 0;

  vec3$8.scale(direction, lambda, direction);
  vec3$8.add(direction, p1, direction);
  return direction
};

var splitLineSegmentByPlane_1$1 = splitLineSegmentByPlane$1;



const { EPS: EPS$c } = constants;

const { plane: plane$3, vec3: vec3$9 } = math;

const { poly3: poly3$8 } = geometry;



// Returns object:
// .type:
//   0: coplanar-front
//   1: coplanar-back
//   2: front
//   3: back
//   4: spanning
// In case the polygon is spanning, returns:
// .front: a Polygon3 of the front part
// .back: a Polygon3 of the back part
const splitPolygonByPlane = (splane, polygon) => {
  let result = {
    type: 0,
    front:  {
      vertices: [] as any,
      plane: [] as any
    },
    back: {
      vertices: [] as any,
      plane: [] as any
    },
  };
  // cache in local lets (speedup):
  let vertices = polygon.vertices;
  let numvertices = vertices.length;
  if (plane$3.equals(polygon.plane, splane)) {
    result.type = 0;
  } else {
    let hasfront = false;
    let hasback = false;
    let vertexIsBack = [];
    let MINEPS = -EPS$c;
    for (let i = 0; i < numvertices; i++) {
      let t = vec3$9.dot(splane, vertices[i]) - splane[3];
      let isback = (t < 0);
      vertexIsBack.push(isback);
      if (t > EPS$c) hasfront = true;
      if (t < MINEPS) hasback = true;
    }
    if ((!hasfront) && (!hasback)) {
      // all points coplanar
      let t = vec3$9.dot(splane, polygon.plane);
      result.type = (t >= 0) ? 0 : 1;
    } else if (!hasback) {
      result.type = 2;
    } else if (!hasfront) {
      result.type = 3;
    } else {
      // spanning
      result.type = 4;
      let frontvertices = [];
      let backvertices = [];
      let isback = vertexIsBack[0];
      for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        let vertex = vertices[vertexindex];
        let nextvertexindex = vertexindex + 1;
        if (nextvertexindex >= numvertices) nextvertexindex = 0;
        let nextisback = vertexIsBack[nextvertexindex];
        if (isback === nextisback) {
          // line segment is on one side of the plane:
          if (isback) {
            backvertices.push(vertex);
          } else {
            frontvertices.push(vertex);
          }
        } else {
          // line segment intersects plane:
          let point = vertex;
          let nextpoint = vertices[nextvertexindex];
          let intersectionpoint = splitLineSegmentByPlane_1$1(splane, point, nextpoint);
          if (isback) {
            backvertices.push(vertex);
            backvertices.push(intersectionpoint);
            frontvertices.push(intersectionpoint);
          } else {
            frontvertices.push(vertex);
            frontvertices.push(intersectionpoint);
            backvertices.push(intersectionpoint);
          }
        }
        isback = nextisback;
      } // for vertexindex
      // remove duplicate vertices:
      let EPS_SQUARED = EPS$c * EPS$c;
      if (backvertices.length >= 3) {
        let prevvertex = backvertices[backvertices.length - 1];
        for (let vertexindex = 0; vertexindex < backvertices.length; vertexindex++) {
          let vertex = backvertices[vertexindex];
          if (vec3$9.squaredDistance(vertex, prevvertex) < EPS_SQUARED) {
            backvertices.splice(vertexindex, 1);
            vertexindex--;
          }
          prevvertex = vertex;
        }
      }
      if (frontvertices.length >= 3) {
        let prevvertex = frontvertices[frontvertices.length - 1];
        for (let vertexindex = 0; vertexindex < frontvertices.length; vertexindex++) {
          let vertex = frontvertices[vertexindex];
          if (vec3$9.squaredDistance(vertex, prevvertex) < EPS_SQUARED) {
            frontvertices.splice(vertexindex, 1);
            vertexindex--;
          }
          prevvertex = vertex;
        }
      }
      if (frontvertices.length >= 3) {
        result.front = poly3$8.fromPointsAndPlane(frontvertices, polygon.plane);
      }
      if (backvertices.length >= 3) {
        result.back = poly3$8.fromPointsAndPlane(backvertices, polygon.plane);
      }
    }
  }
  return result
};

var splitPolygonByPlane_1 = splitPolygonByPlane;

const { EPS: EPS$d } = constants;

const { vec3: vec3$a } = math;

const { poly3: poly3$9 } = geometry;



// # class PolygonTreeNode
// This class manages hierarchical splits of polygons
// At the top is a root node which doesn hold a polygon, only child PolygonTreeNodes
// Below that are zero or more 'top' nodes; each holds a polygon. The polygons can be in different planes
// splitByPlane() splits a node by a plane. If the plane intersects the polygon, two new child nodes
// are created holding the splitted polygon.
// getPolygons() retrieves the polygon from the tree. If for PolygonTreeNode the polygon is split but
// the two split parts (child nodes) are still intact, then the unsplit polygon is returned.
// This ensures that we can safely split a polygon into many fragments. If the fragments are untouched,
//  getPolygons() will return the original unsplit polygon instead of the fragments.
// remove() removes a polygon from the tree. Once a polygon is removed, the parent polygons are invalidated
// since they are no longer intact.
// constructor creates the root node:
const PolygonTreeNode = function () {
  this.parent = null;
  this.children = [];
  this.polygon = null;
  this.removed = false;
};

PolygonTreeNode.prototype = {
  // fill the tree with polygons. Should be called on the root node only; child nodes must
  // always be a derivate (split) of the parent node.
  addPolygons: function (polygons) {
    // new polygons can only be added to root node; children can only be splitted polygons
    if (!this.isRootNode()) {
      throw new Error('Assertion failed')
    }
    let _this = this;
    polygons.forEach(function (polygon) {
      _this.addChild(polygon);
    });
  },

  // remove a node
  // - the siblings become toplevel nodes
  // - the parent is removed recursively
  remove: function () {
    if (!this.removed) {
      this.removed = true;

      // remove ourselves from the parent's children list:
      let parentschildren = this.parent.children;
      let i = parentschildren.indexOf(this);
      if (i < 0) throw new Error('Assertion failed')
      parentschildren.splice(i, 1);

      // invalidate the parent's polygon, and of all parents above it:
      this.parent.recursivelyInvalidatePolygon();
    }
  },

  isRemoved: function () {
    return this.removed
  },

  isRootNode: function () {
    return !this.parent
  },

  // invert all polygons in the tree. Call on the root node
  invert: function () {
    if (!this.isRootNode()) throw new Error('Assertion failed') // can only call this on the root node
    this.invertSub();
  },

  getPolygon: function () {
    if (!this.polygon) throw new Error('Assertion failed') // doesn't have a polygon, which means that it has been broken down
    return this.polygon
  },

  getPolygons: function (result) {
    let children = [this];
    let queue = [children];
    let i, j, l, node;
    for (i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
      children = queue[i];
      for (j = 0, l = children.length; j < l; j++) { // ok to cache length
        node = children[j];
        if (node.polygon) {
          // the polygon hasn't been broken yet. We can ignore the children and return our polygon:
          result.push(node.polygon);
        } else {
          // our polygon has been split up and broken, so gather all subpolygons from the children
          if (node.children.length > 0) queue.push(node.children);
        }
      }
    }
  },

  // split the node by a plane; add the resulting nodes to the frontnodes and backnodes array
  // If the plane doesn't intersect the polygon, the 'this' object is added to one of the arrays
  // If the plane does intersect the polygon, two new child nodes are created for the front and back fragments,
  //  and added to both arrays.
  splitByPlane: function (plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
    if (this.children.length) {
      let queue = [this.children];
      let i;
      let j;
      let l;
      let node;
      let nodes;
      for (i = 0; i < queue.length; i++) { // queue.length can increase, do not cache
        nodes = queue[i];
        for (j = 0, l = nodes.length; j < l; j++) { // ok to cache length
          node = nodes[j];
          if (node.children.length > 0) {
            queue.push(node.children);
          } else {
            // no children. Split the polygon:
            node._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes);
          }
        }
      }
    } else {
      this._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes);
    }
  },

  // only to be called for nodes with no children
  _splitByPlane: function (splane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
    let polygon = this.polygon;
    if (polygon) {
      let bound = poly3$9.measureBoundingSphere(polygon);
      let sphereradius = bound[1] + EPS$d; // ensure radius is LARGER then polygon
      let spherecenter = bound[0];
      let d = vec3$a.dot(splane, spherecenter) - splane[3];
      if (d > sphereradius) {
        frontnodes.push(this);
      } else if (d < -sphereradius) {
        backnodes.push(this);
      } else {
        let splitresult = splitPolygonByPlane_1(splane, polygon);
        switch (splitresult.type) {
          case 0:
            // coplanar front:
            coplanarfrontnodes.push(this);
            break

          case 1:
            // coplanar back:
            coplanarbacknodes.push(this);
            break

          case 2:
            // front:
            frontnodes.push(this);
            break

          case 3:
            // back:
            backnodes.push(this);
            break

          case 4:
            // spanning:
            if (splitresult.front) {
              let frontnode = this.addChild(splitresult.front);
              frontnodes.push(frontnode);
            }
            if (splitresult.back) {
              let backnode = this.addChild(splitresult.back);
              backnodes.push(backnode);
            }
            break
        }
      }
    }
  },

  // PRIVATE methods from here:
  // add child to a node
  // this should be called whenever the polygon is split
  // a child should be created for every fragment of the split polygon
  // returns the newly created child
  addChild: function (polygon) {
    let newchild = new PolygonTreeNode();
    newchild.parent = this;
    newchild.polygon = polygon;
    this.children.push(newchild);
    return newchild
  },

  invertSub: function () {
    let children = [this];
    let queue = [children];
    let i, j, l, node;
    for (i = 0; i < queue.length; i++) {
      children = queue[i];
      for (j = 0, l = children.length; j < l; j++) {
        node = children[j];
        if (node.polygon) {
          node.polygon = poly3$9.flip(node.polygon);
        }
        if (node.children.length > 0) queue.push(node.children);
      }
    }
  },

  recursivelyInvalidatePolygon: function () {
    let node = this;
    while (node.polygon) {
      node.polygon = null;
      if (node.parent) {
        node = node.parent;
      }
    }
  },

  clear: function () {
    let children = [this];
    let queue = [children];
    for (let i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
      children = queue[i];
      let l = children.length;
      for (let j = 0; j < l; j++) {
        let node = children[j];
        if (node.polygon) {
          node.polygon = null;
        }
        if (node.parent) {
          node.parent = null;
        }
        if (node.children.length > 0) queue.push(node.children);
        node.children = [];
      }
    }
  },

  toString: function () {
    let result = '';
    let children = [this];
    let queue = [children];
    let i, j, l, node;
    for (i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
      children = queue[i];
      let prefix = ' '.repeat(i);
      for (j = 0, l = children.length; j < l; j++) { // ok to cache length
        node = children[j];
        result += `${prefix}PolygonTreeNode (${node.isRootNode()}): ${node.children.length}`;
        if (node.polygon) {
          result += `\n ${prefix}poly3\n`;
        } else {
          result += '\n';
        }
        if (node.children.length > 0) queue.push(node.children);
      }
    }
    return result
  }
};

var PolygonTreeNode_1 = PolygonTreeNode;


// # class Tree
// This is the root of a BSP tree
// We are using this separate class for the root of the tree, to hold the PolygonTreeNode root
// The actual tree is kept in this.rootnode
const Tree = function (polygons) {
  this.polygonTree = new PolygonTreeNode_1();
  this.rootnode = new Node_1(null);
  if (polygons) this.addPolygons(polygons);
};

Tree.prototype = {
  invert: function () {
    this.polygonTree.invert();
    this.rootnode.invert();
  },

  // Remove all polygons in this BSP tree that are inside the other BSP tree
  // `tree`.
  clipTo: function (tree, alsoRemovecoplanarFront) {
    alsoRemovecoplanarFront = !!alsoRemovecoplanarFront;
    this.rootnode.clipTo(tree, alsoRemovecoplanarFront);
  },

  allPolygons: function () {
    let result = [];
    this.polygonTree.getPolygons(result);
    return result
  },

  addPolygons: function (polygons) {
    let polygontreenodes = new Array(polygons.length);
    for (let i = 0; i < polygons.length; i++) {
      polygontreenodes[i] = this.polygonTree.addChild(polygons[i]);
    }
    this.rootnode.addPolygonTreeNodes(polygontreenodes);
  },

  clear: function () {
    this.polygonTree.clear();
  },

  toString: function () {
    let result = 'Tree: ' + this.polygonTree.toString('');
    return result
  }
};

var Tree_1 = Tree;

var trees = {
  Tree: Tree_1
};

const { geom3: geom3$9 } = geometry;


const { Tree: Tree$1 } = trees;

/*
 * Return a new 3D geometry representing the space in both the first geometry and
 * the second geometry. None of the given geometries are modified.
 * @param {geom3} geometry1 - a geometry
 * @param {geom3} geometry2 - a geometry
 * @returns {geom3} new 3D geometry
 */
const intersectGeom3Sub = (geometry1, geometry2) => {
  if (!mayOverlap_1(geometry1, geometry2)) {
    return geom3$9.create() // empty geometry
  }

  let a = new Tree$1(geom3$9.toPolygons(geometry1));
  let b = new Tree$1(geom3$9.toPolygons(geometry2));

  a.invert();
  b.clipTo(a);
  b.invert();
  a.clipTo(b);
  b.clipTo(a);
  a.addPolygons(b.allPolygons());
  a.invert();

  let newpolygons = a.allPolygons();
  return geom3$9.create(newpolygons)
};

var intersectGeom3Sub_1 = intersectGeom3Sub;

/*
 * Return a new 3D geometry representing space in both the first geometry and
 * in the subsequent geometries. None of the given geometries are modified.
 * @param {...geom3} geometries - list of 3D geometries
 * @returns {geom3} new 3D geometry
 */
const intersect$1 = (...geometries) => {
  geometries = flatten_1(geometries);

  let newgeometry = geometries.shift();
  geometries.forEach((geometry) => {
    newgeometry = intersectGeom3Sub_1(newgeometry, geometry);
  });

  newgeometry = retessellate_1(newgeometry);
  return newgeometry
};

var intersectGeom3 = intersect$1;

const { geom3: geom3$a } = geometry;





/*
 * Return a new 2D geometry representing space in both the first geometry and
 * in the subsequent geometries. None of the given geometries are modified.
 * @param {...geom2} geometries - list of 2D geometries
 * @returns {geom2} new 2D geometry
 */
const intersect$2 = (...geometries) => {
  geometries = flatten_1(geometries);
  const newgeometries = geometries.map((geometry) => to3DWalls_1({ z0: -1, z1: 1 }, geometry));

  let newgeom3 = intersectGeom3(newgeometries);

  return fromFakePolygons_1(geom3$a.toPolygons(newgeom3))
};

var intersectGeom2 = intersect$2;

const { geom2: geom2$6, geom3: geom3$b } = geometry;





/**
 * Return a new geometry representing space in both the first geometry and
 * all subsequent geometries.
 * Note: None of the given geometries are modified.
 *
 * @param {...geometries} geometries - list of geometries
 * @returns {geom2|geom3} a new geometry
 *
 * @example
 * let myshape = intersect(cube({size: [5,5,5]}), cube({size: [5,5,5], center: [5,5,5]}))
 *
 * @example
 * +-------+
 * |       |
 * |   A   |
 * |    +--+----+   =   +--+
 * +----+--+    |       +--+
 *      |   B   |
 *      |       |
 *      +-------+
 */
const intersect$3 = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType_1(geometries)) ;

  let geometry = geometries[0];
  // if (path.isA(geometry)) return pathintersect(matrix, geometries)
  if (geom2$6.isA(geometry)) return intersectGeom2(geometries)
  if (geom3$b.isA(geometry)) return intersectGeom3(geometries)
  return geometry
};

var intersect_1$1 = intersect$3;

const { geom3: geom3$c } = geometry;


const { Tree: Tree$2 } = trees;

/*
 * Return a new 3D geometry representing the space in the first geometry but not
 * in the second geometry. None of the given geometries are modified.
 * @param {geom3} geometry1 - a geometry
 * @param {geom3} geometry2 - a geometry
 * @returns {geom3} new 3D geometry
 */
const subtractGeom3Sub = (geometry1, geometry2) => {
  if (!mayOverlap_1(geometry1, geometry2)) {
    return geom3$c.clone(geometry1)
  }

  let a = new Tree$2(geom3$c.toPolygons(geometry1));
  let b = new Tree$2(geom3$c.toPolygons(geometry2));

  a.invert();
  a.clipTo(b);
  b.clipTo(a, true);
  a.addPolygons(b.allPolygons());
  a.invert();

  let newpolygons = a.allPolygons();
  return geom3$c.create(newpolygons)
};

var subtractGeom3Sub_1 = subtractGeom3Sub;

/*
 * Return a new 3D geometry representing space in this geometry but not in the given geometries.
 * Neither this geometry nor the given geometries are modified.
 * @param {...geom3} geometries - list of geometries
 * @returns {geom3} new 3D geometry
 */
const subtract$3 = (...geometries) => {
  geometries = flatten_1(geometries);

  let newgeometry = geometries.shift();
  geometries.forEach((geometry) => {
    newgeometry = subtractGeom3Sub_1(newgeometry, geometry);
  });

  newgeometry = retessellate_1(newgeometry);
  return newgeometry
};

var subtractGeom3 = subtract$3;

const { geom3: geom3$d } = geometry;





/*
 * Return a new 2D geometry representing space in the first geometry but
 * not in the subsequent geometries. None of the given geometries are modified.
 * @param {...geom2} geometries - list of geometries
 * @returns {geom2} new 2D geometry
 */
const subtract$4 = (...geometries) => {
  geometries = flatten_1(geometries);
  const newgeometries = geometries.map((geometry) => to3DWalls_1({ z0: -1, z1: 1 }, geometry));

  let newgeom3 = subtractGeom3(newgeometries);

  return fromFakePolygons_1(geom3$d.toPolygons(newgeom3))
};

var subtractGeom2 = subtract$4;

const { geom2: geom2$7, geom3: geom3$e } = geometry;





/**
 * Return a new geometry representing space in the first geometry but
 * not in all subsequent geometries.
 * Note: None of the given geometries are modified.
 *
 * @param {...geometries} geometries - list of geometries
 * @returns {geom2|geom3} a new geometry
 *
 * @example
 * let myshape = subtract(cubiod({size: [5,5,5]}), cubiod({size: [5,5,5], center: [5,5,5]}))
 *
 * @example
 * +-------+            +-------+
 * |       |            |       |
 * |   A   |            |       |
 * |    +--+----+   =   |    +--+
 * +----+--+    |       +----+
 *      |   B   |
 *      |       |
 *      +-------+
 */
const subtract$5 = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType_1(geometries)) ;

  let geometry = geometries[0];
  // if (path.isA(geometry)) return pathsubtract(matrix, geometries)
  if (geom2$7.isA(geometry)) return subtractGeom2(geometries)
  if (geom3$e.isA(geometry)) return subtractGeom3(geometries)
  return geometry
};

var subtract_1$3 = subtract$5;

const { geom3: geom3$f } = geometry;


const { Tree: Tree$3 } = trees;

/*
 * Return a new 3D geometry representing the space in the given geometries.
 * @param {geom3} geometry1 - geometry to union
 * @param {geom3} geometry2 - geometry to union
 * @returns {goem3} new 3D geometry
 */
const unionSub = (geometry1, geometry2) => {
  if (!mayOverlap_1(geometry1, geometry2)) {
    return unionForNonIntersecting(geometry1, geometry2)
  }

  let a = new Tree$3(geom3$f.toPolygons(geometry1));
  let b = new Tree$3(geom3$f.toPolygons(geometry2));

  a.clipTo(b, false);
  // b.clipTo(a, true); // ERROR: doesn't work
  b.clipTo(a);
  b.invert();
  b.clipTo(a);
  b.invert();

  let newpolygons = a.allPolygons().concat(b.allPolygons());
  let result = geom3$f.create(newpolygons);
  return result
};

// Like union, but when we know that the two solids are not intersecting
// Do not use if you are not completely sure that the solids do not intersect!
const unionForNonIntersecting = (geometry1, geometry2) => {
  let newpolygons = geom3$f.toPolygons(geometry1);
  newpolygons = newpolygons.concat(geom3$f.toPolygons(geometry2));
  return geom3$f.create(newpolygons)
};

var unionGeom3Sub = unionSub;

/*
 * Return a new 3D geometry representing the space in the given 3D geometries.
 * @param {...objects} geometries - list of geometries to union
 * @returns {geom3} new 3D geometry
 */
const union = (...geometries) => {
  geometries = flatten_1(geometries);

  // combine geometries in a way that forms a balanced binary tree pattern
  let i;
  for (i = 1; i < geometries.length; i += 2) {
    geometries.push(unionGeom3Sub(geometries[i - 1], geometries[i]));
  }
  let newgeometry = geometries[i - 1];
  newgeometry = retessellate_1(newgeometry);
  return newgeometry
};

var unionGeom3 = union;

const { geom3: geom3$g } = geometry;





/*
 * Return a new 2D geometry representing the total space in the given 2D geometries.
 * @param {...geom2} geometries - list of 2D geometries to union
 * @returns {geom2} new 2D geometry
 */
const union$1 = (...geometries) => {
  geometries = flatten_1(geometries);
  const newgeometries = geometries.map((geometry) => to3DWalls_1({ z0: -1, z1: 1 }, geometry));

  let newgeom3 = unionGeom3(newgeometries);

  return fromFakePolygons_1(geom3$g.toPolygons(newgeom3))
};

var unionGeom2 = union$1;

const { geom2: geom2$8, geom3: geom3$h } = geometry;




/**
 * Return a new geometry representing the total space in the given geometries.
 * NOTE: None of the given geometries are modified.
 *
 * @param {...geometry} geometries - list of geometries to union
 * @returns {geom2|geom3} a new geometry
 *
 * @example
 * let myshape = union(cube({size: [5,5,5]}), cube({size: [5,5,5], center: [5,5,5]}))
 *
 * @example
 * +-------+            +-------+
 * |       |            |       |
 * |   A   |            |       |
 * |    +--+----+   =   |       +----+
 * +----+--+    |       +----+       |
 *      |   B   |            |       |
 *      |       |            |       |
 *      +-------+            +-------+
 */
const union$2 = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType_1(geometries)) ;

  let geometry = geometries[0];
  // if (path.isA(geometry)) return pathunion(matrix, geometries)
  if (geom2$8.isA(geometry)) return unionGeom2(geometries)
  if (geom3$h.isA(geometry)) return unionGeom3(geometries)
  return geometry
};

var union_1 = union$2;

export const booleans = {
  intersect: intersect_1$1,
  subtract: subtract_1$3,
  union: union_1
};

const { EPS: EPS$e } = constants;

const { intersect: intersect$4 } = utils;

const { line2: line2$2, vec2: vec2$9 } = math;

const { poly2: poly2$1 } = geometry;

/*
 * Create a set of offset points from the given points using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {Array} points - array of 2D points
 * @returns {Array} new set of offset points, plus points for each rounded corner
 */
const offsetFromPoints = (options, points) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    closed: false,
    segments: 16
  };
  let { delta, corners, closed, segments } = Object.assign({ }, defaults, options);

  if (Math.abs(delta) < EPS$e) return points

  let rotation = poly2$1.measureArea(poly2$1.create(points)); // + counter clockwise, - clockwise
  if (rotation === 0) rotation = 1.0;

  // use right hand normal?
  let orientation = ((rotation > 0) && (delta >= 0)) || ((rotation < 0) && (delta < 0));
  delta = Math.abs(delta); // sign is no longer required

  let prevsegment = null;
  const newpoints = [];
  const newcorners = [];
  let n = points.length;
  for (let i = 0; i < n; i++) {
    let j = (i + 1) % n;
    let p0 = points[i];
    let p1 = points[j];
    // calculate the unit normal
    let of = orientation ? vec2$9.normal(vec2$9.subtract(p0, p1)) : vec2$9.normal(vec2$9.subtract(p1, p0));
    vec2$9.normalize(of, of);
    // calculate the offset vector
    vec2$9.scale(of, delta, of);
    // calculate the new points (edge)
    let n0 = vec2$9.add(p0, of);
    let n1 = vec2$9.add(p1, of);

    let cursegment = [n0, n1];
    if (prevsegment != null) {
      if (closed || (!closed && j !== 0)) {
        // check for intersection of new line segments
        let ip = intersect$4(prevsegment[0], prevsegment[1], cursegment[0], cursegment[1]);
        if (ip) {
          // adjust the previous points
          newpoints.pop();
          // adjust current points
          cursegment[0] = ip;
        } else {
          newcorners.push({ c: p0, s0: prevsegment, s1: cursegment });
        }
      }
    }
    prevsegment = [n0, n1];

    if (j === 0 && !closed) continue

    newpoints.push(cursegment[0]);
    newpoints.push(cursegment[1]);
  }
  // complete the closure if required
  if (closed && prevsegment != null) {
    // check for intersection of closing line segments
    let n0 = newpoints[0];
    let n1 = newpoints[1];
    let ip = intersect$4(prevsegment[0], prevsegment[1], n0, n1);
    if (ip) {
      // adjust the previous points
      newpoints[0] = ip;
      newpoints.pop();
    } else {
      let p0 = points[0];
      let cursegment = [n0, n1];
      newcorners.push({ c: p0, s0: prevsegment, s1: cursegment });
    }
  }

  // generate corners if necessary

  if (corners === 'edge') {
    // create edge corners
    newcorners.forEach((corner) => {
      let line0 = line2$2.fromPoints(corner.s0[0], corner.s0[1]);
      let line1 = line2$2.fromPoints(corner.s1[0], corner.s1[1]);
      let ip = line2$2.intersectPointOfLines(line0, line1);
      let p0 = corner.s0[1];
      let i = newpoints.findIndex((point) => vec2$9.equals(p0, point));
      i = (i + 1) % newpoints.length;
      newpoints.splice(i, 0, ip);
    });
  }

  if (corners === 'round') {
    // create rounded corners
    let cornersegments = Math.floor(segments / 4);
    newcorners.forEach((corner) => {
      // calculate angle of rotation
      let rotation = vec2$9.angle(vec2$9.subtract(corner.s1[0], corner.c));
      rotation -= vec2$9.angle(vec2$9.subtract(corner.s0[1], corner.c));
      if (orientation && rotation < 0) {
        rotation = rotation + Math.PI;
        if (rotation < 0) rotation = rotation + Math.PI;
      }
      if ((!orientation) && rotation > 0) {
        rotation = rotation - Math.PI;
        if (rotation > 0) rotation = rotation - Math.PI;
      }

      // generate the segments
      cornersegments = Math.floor(segments * (Math.abs(rotation) / (2 * Math.PI)));
      let step = rotation / cornersegments;
      let start = vec2$9.angle(vec2$9.subtract(corner.s0[1], corner.c));
      let cornerpoints = [];
      for (let i = 1; i < cornersegments; i++) {
        let radians = start + (step * i);
        let point = vec2$9.add(corner.c, vec2$9.scale(delta, vec2$9.fromAngleRadians(radians)));
        cornerpoints.push(point);
      }
      if (cornerpoints.length > 0) {
        let p0 = corner.s0[1];
        let i = newpoints.findIndex((point) => vec2$9.equals(p0, point));
        i = (i + 1) % newpoints.length;
        newpoints.splice(i, 0, ...cornerpoints);
      }
    });
  }
  return newpoints
};

var offsetFromPoints_1 = offsetFromPoints;

const { geom2: geom2$9 } = geometry;



/*
 * Expand the given geometry (geom2) using the given options (if any).
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+/-) of expansion
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {geom2} geometry - the geometry to expand
 * @returns {geom2} expanded geometry
 */
const expandGeom2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    segments: 16
  };
  let { delta, corners, segments } = Object.assign({ }, defaults, options);

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  // convert the geometry to outlines, and generate offsets from each
  let outlines = geom2$9.toOutlines(geometry);
  let newoutlines = outlines.map((outline) => {
    options = {
      delta,
      corners,
      closed: true,
      segments
    };
    return offsetFromPoints_1(options, outline)
  });

  // create a composite geometry from the new outlines
  let allsides = newoutlines.reduce((sides, newoutline) => {
    return sides.concat(geom2$9.toSides(geom2$9.fromPoints(newoutline)))
  }, []);
  return geom2$9.create(allsides)
};

var expandGeom2_1 = expandGeom2;

const { mat4: mat4$2, vec3: vec3$b } = math;

const { geom3: geom3$i, poly3: poly3$a } = geometry;

// Extrude a polygon in the direction of the offsetvector.
// Returns (geom3) a new geometry
const extrudePolygon = (offsetvector, polygon1) => {
  let direction = vec3$b.dot(polygon1.plane, offsetvector);
  if (direction > 0) {
    polygon1 = poly3$a.flip(polygon1);
  }

  let newpolygons = [polygon1];

  let polygon2 = poly3$a.transform(mat4$2.fromTranslation(offsetvector), polygon1);
  let numvertices = polygon1.vertices.length;
  for (let i = 0; i < numvertices; i++) {
    let sidefacepoints = [];
    let nexti = (i < (numvertices - 1)) ? i + 1 : 0;
    sidefacepoints.push(polygon1.vertices[i]);
    sidefacepoints.push(polygon2.vertices[i]);
    sidefacepoints.push(polygon2.vertices[nexti]);
    sidefacepoints.push(polygon1.vertices[nexti]);
    let sidefacepolygon = poly3$a.fromPoints(sidefacepoints);
    newpolygons.push(sidefacepolygon);
  }
  newpolygons.push(poly3$a.flip(polygon2));

  return geom3$i.create(newpolygons)
};

var extrudePolygon_1 = extrudePolygon;

const { EPS: EPS$f } = constants;

const { mat4: mat4$3, vec3: vec3$c } = math;

const { fnNumberSort: fnNumberSort$2 } = utils$1;

const { geom3: geom3$j, poly3: poly3$b } = geometry;

const { sphere: sphere$1 } = primitives;






const mapPlaneToVertex = (map, vertex, plane) => {
  let i = map.findIndex((item) => vec3$c.equals(item[0], vertex));
  if (i < 0) {
    let entry = [vertex, [plane]];
    map.push(entry);
    return map.length
  }
  let planes = map[i][1];
  planes.push(plane);
  return i
};

const mapPlaneToEdge = (map, edge, plane) => {
  let i = map.findIndex((item) => {
    return (vec3$c.equals(item[0], edge[0]) && vec3$c.equals(item[1], edge[1])) ||
           (vec3$c.equals(item[0], edge[1]) && vec3$c.equals(item[1], edge[0]))
  });
  if (i < 0) {
    let entry = [edge, [plane]];
    map.push(entry);
    return map.length
  }
  let planes = map[i][1];
  planes.push(plane);
  return i
};

const addUniqueAngle = (map, angle) => {
  let i = map.findIndex((item) => item === angle);
  if (i < 0) {
    map.push(angle);
    return map.length
  }
  return i
};

/*
 * Create the expanded shell of the solid:
 * All faces are extruded to 2 times delta
 * Cylinders are constructed around every side
 * Spheres are placed on every vertex
 * the result is a true expansion of the solid
 * @param  {Number} delta
 * @param  {Integer} segments
 */
const expandShell = (options, geometry) => {
  const defaults = {
    delta: 1,
    segments: 12
  };
  let { delta, segments } = Object.assign({ }, defaults, options);

  let result = geom3$j.create();
  let vertices2planes = []; // contents: [vertex, [plane, ...]]
  let edges2planes = []; // contents: [[vertex, vertex], [plane, ...]]

  // loop through the polygons
  // - extruded the polygon, and add to the composite result
  // - add the plane to the unique vertice map
  // - add the plane to the unique edge map
  const polygons = geom3$j.toPolygons(geometry);
  polygons.forEach((polygon) => {
    let extrudevector = vec3$c.scale(2 * delta, polygon.plane);
    let translatedpolygon = poly3$b.transform(mat4$3.fromTranslation(vec3$c.scale(-0.5, extrudevector)), polygon);
    let extrudedface = extrudePolygon_1(extrudevector, translatedpolygon);
    result = unionGeom3Sub(result, extrudedface);

    let vertices = polygon.vertices;
    for (let i = 0; i < vertices.length; i++) {
      mapPlaneToVertex(vertices2planes, vertices[i], polygon.plane);
      let j = (i + 1) % vertices.length;
      let edge = [vertices[i], vertices[j]];
      mapPlaneToEdge(edges2planes, edge, polygon.plane);
    }
  });

  // now construct a cylinder on every side
  // The cylinder is always an approximation of a true cylinder, having polygons
  // around the sides. We will make sure though that the cylinder will have an edge at every
  // face that touches this side. This ensures that we will get a smooth fill even
  // if two edges are at, say, 10 degrees and the segments is low.
  edges2planes.forEach((item) => {
    let edge = item[0];
    let planes = item[1];
    let startpoint = edge[0];
    let endpoint = edge[1];

    // our x,y and z vectors:
    let zbase = vec3$c.unit(vec3$c.subtract(endpoint, startpoint));
    let xbase = planes[0];
    let ybase = vec3$c.cross(xbase, zbase);

    // make a list of angles that the cylinder should traverse:
    let angles = [];

    // first of all equally spaced around the cylinder:
    for (let i = 0; i < segments; i++) {
      addUniqueAngle(angles, (i * Math.PI * 2 / segments));
    }

    // and also at every normal of all touching planes:
    for (let i = 0, iMax = planes.length; i < iMax; i++) {
      let planenormal = planes[i];
      let si = vec3$c.dot(ybase, planenormal);
      let co = vec3$c.dot(xbase, planenormal);
      let angle = Math.atan2(si, co);

      if (angle < 0) angle += Math.PI * 2;
      addUniqueAngle(angles, angle);
      angle = Math.atan2(-si, -co);
      if (angle < 0) angle += Math.PI * 2;
      addUniqueAngle(angles, angle);
    }

    // this will result in some duplicate angles but we will get rid of those later.
    angles = angles.sort(fnNumberSort$2);

    // Now construct the cylinder by traversing all angles:
    let numangles = angles.length;
    let prevp1;
    let prevp2;
    let startfacevertices = [];
    let endfacevertices = [];
    let polygons = [];
    for (let i = -1; i < numangles; i++) {
      let angle = angles[(i < 0) ? (i + numangles) : i];
      let si = Math.sin(angle);
      let co = Math.cos(angle);
      let p = vec3$c.add(vec3$c.scale(co * delta, xbase), vec3$c.scale(si * delta, ybase));
      let p1 = vec3$c.add(startpoint, p);
      let p2 = vec3$c.add(endpoint, p);
      let skip = false;
      if (i >= 0) {
        if (vec3$c.distance(p1, prevp1) < EPS$f) {
          skip = true;
        }
      }
      if (!skip) {
        if (i >= 0) {
          startfacevertices.push(p1);
          endfacevertices.push(p2);
          let points = [prevp2, p2, p1, prevp1];
          let polygon = poly3$b.fromPoints(points);
          polygons.push(polygon);
        }
        prevp1 = p1;
        prevp2 = p2;
      }
    }
    endfacevertices.reverse();
    polygons.push(poly3$b.fromPoints(startfacevertices));
    polygons.push(poly3$b.fromPoints(endfacevertices));

    let cylinder = geom3$j.create(polygons);
    result = unionGeom3Sub(result, cylinder);
  });

  // build spheres at each unique vertex
  // We will try to set the x and z axis to the normals of 2 planes
  // This will ensure that our sphere tesselation somewhat matches 2 planes
  vertices2planes.forEach((item) => {
    let vertex = item[0];
    let planes = item[1];
    // use the first normal to be the x axis of our sphere:
    let xaxis = planes[0];
    // and find a suitable z axis. We will use the normal which is most perpendicular to the x axis:
    let bestzaxis = null;
    let bestzaxisorthogonality = 0;
    for (let i = 1; i < planes.length; i++) {
      let normal = planes[i];
      let cross = vec3$c.cross(xaxis, normal);
      let crosslength = vec3$c.length(cross);
      if (crosslength > 0.05) {
        if (crosslength > bestzaxisorthogonality) {
          bestzaxisorthogonality = crosslength;
          bestzaxis = normal;
        }
      }
    }
    if (!bestzaxis) {
      bestzaxis = vec3$c.random(xaxis);
    }
    let yaxis = vec3$c.unit(vec3$c.cross(xaxis, bestzaxis));
    let zaxis = vec3$c.cross(yaxis, xaxis);
    let corner = sphere$1({
      center: [vertex[0], vertex[1], vertex[2]],
      radius: delta,
      segments: segments,
      axes: [xaxis, yaxis, zaxis]
    });
    result = unionGeom3Sub(result, corner);
  });
  // FIXME ... hack hack hack
  result.isCanonicalized = true;
  return retessellate_1(result)
};

var expandShell_1 = expandShell;

const { geom3: geom3$k } = geometry;





/*
 * Expand the given geometry (geom3) using the given options (if any).
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+/-) of expansion
 * @param {String} [options.corners='round'] - type corner to create during of expansion; round
 * @param {Integer} [options.segments=12] - number of segments when creating round corners
 * @param {geom3} geometry - the geometry to expand
 * @returns {geom3} expanded geometry
 */
const expandGeom3 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'round',
    segments: 12
  };
  let { delta, corners, segments } = Object.assign({ }, defaults, options);

  if (!(corners === 'round')) {
    throw new Error('corners must be "round" for 3D geometries')
  }

  const polygons = geom3$k.toPolygons(geometry);
  if (polygons.length === 0) throw new Error('the given geometry cannot be empty')

  options = { delta, corners, segments };
  let expanded = expandShell_1(options, geometry);
  return union_1(geometry, expanded)
};

var expandGeom3_1 = expandGeom3;

const { area: area$1 } = utils;

const { vec2: vec2$a } = math;

const { geom2: geom2$a, path2: path2$3 } = geometry;



/*
 * Expand the given geometry (path2) using the given options (if any).
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+) of expansion
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {path2} geometry - the geometry to expand
 * @returns {geom2} expanded geometry
 */
const expandPath2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    segments: 16
  };
  let { delta, corners, segments } = Object.assign({ }, defaults, options);

  if (delta <= 0) throw new Error('the given delta must be positive for paths')

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  let closed = geometry.isClosed;
  let points = path2$3.toPoints(geometry);
  if (points.length === 0) throw new Error('the given geometry cannot be empty')

  let offsetopts = { delta, corners, segments, closed };
  let external = offsetFromPoints_1(offsetopts, points);

  offsetopts = { delta: -delta, corners, segments, closed };
  let internal = offsetFromPoints_1(offsetopts, points);

  let newgeometry = null;
  if (geometry.isClosed) {
    // NOTE: creating path2 from the points insures proper closure
    let epath = path2$3.fromPoints({ closed: true }, external);
    let ipath = path2$3.fromPoints({ closed: true }, internal.reverse());
    let esides = geom2$a.toSides(geom2$a.fromPoints(path2$3.toPoints(epath)));
    let isides = geom2$a.toSides(geom2$a.fromPoints(path2$3.toPoints(ipath)));
    newgeometry = geom2$a.create(esides.concat(isides));
  } else {
    let capsegments = Math.floor(segments / 2); // rotation is 180 degrees
    let e2iCap = [];
    let i2eCap = [];
    if (corners === 'round' && capsegments > 0) {
      // added round caps to the geometry
      let orientation = area$1(points);
      let rotation = orientation < 0 ? -Math.PI : Math.PI;
      let step = rotation / capsegments;
      let eCorner = points[points.length - 1];
      let e2iStart = vec2$a.angle(vec2$a.subtract(external[external.length - 1], eCorner));
      let iCorner = points[0];
      let i2eStart = vec2$a.angle(vec2$a.subtract(internal[0], iCorner));
      for (let i = 1; i < capsegments; i++) {
        let radians = e2iStart + (step * i);
        let point = vec2$a.add(eCorner, vec2$a.scale(delta, vec2$a.fromAngleRadians(radians)));
        e2iCap.push(point);

        radians = i2eStart + (step * i);
        point = vec2$a.add(iCorner, vec2$a.scale(delta, vec2$a.fromAngleRadians(radians)));
        i2eCap.push(point);
      }
    }
    let allpoints = external.concat(e2iCap, internal.reverse(), i2eCap);
    newgeometry = geom2$a.fromPoints(allpoints);
  }
  return newgeometry
};

var expandPath2_1 = expandPath2;

const { geom2: geom2$b, geom3: geom3$l, path2: path2$4 } = geometry;





/**
 * Expand the given object(s) using the given options (if any)
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+/-) of expansion
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating rounded corners
 * @param {Object|Array} objects - the object(s) to expand
 * @return {Object|Array} the expanded object(s)
 *
 * @example
 * let newsphere = expand({delta: 2}, cube({center: [0,0,15], size: [20, 25, 5]}))
 */
const expand = (options, ...objects) => {
  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    if (path2$4.isA(object)) return expandPath2_1(options, object)
    if (geom2$b.isA(object)) return expandGeom2_1(options, object)
    if (geom3$l.isA(object)) return expandGeom3_1(options, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

var expand_1 = expand;

const { geom2: geom2$c, poly2: poly2$2 } = geometry;



/*
 * Create a offset geometry from the given geom2 using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {geom2} geometry - geometry from which to create the offset
 * @returns {geom2} offset geometry, plus rounded corners
 */
const offsetGeom2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    segments: 0
  };
  let { delta, corners, segments } = Object.assign({ }, defaults, options);

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  // convert the geometry to outlines, and generate offsets from each
  let outlines = geom2$c.toOutlines(geometry);
  let newoutlines = outlines.map((outline) => {
    let level = outlines.reduce((acc, polygon) => {
      return acc + poly2$2.arePointsInside(outline, poly2$2.create(polygon))
    }, 0);
    let outside = (level % 2) === 0;

    options = {
      delta: outside ? delta : -delta,
      corners,
      closed: true,
      segments
    };
    return offsetFromPoints_1(options, outline)
  });

  // create a composite geometry from the new outlines
  let allsides = newoutlines.reduce((sides, newoutline) => {
    return sides.concat(geom2$c.toSides(geom2$c.fromPoints(newoutline)))
  }, []);
  return geom2$c.create(allsides)
};

var offsetGeom2_1 = offsetGeom2;

const { path2: path2$5 } = geometry;



/*
 * Create a offset geometry from the given path using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {path2} geometry - geometry from which to create the offset
 * @returns {path2} offset geometry, plus rounded corners
 */
const offsetPath2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    closed: geometry.isClosed,
    segments: 16
  };
  let { delta, corners, closed, segments } = Object.assign({ }, defaults, options);

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  options = { delta, corners, closed, segments };
  let newpoints = offsetFromPoints_1(options, path2$5.toPoints(geometry));
  return path2$5.fromPoints({ closed: closed }, newpoints)
};

var offsetPath2_1 = offsetPath2;

const { geom2: geom2$d, path2: path2$6 } = geometry;




/**
 * Create offset geometry(s) from the given object(s) using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {Object|Array} objects - object(s) to offset
 * @return {Object|Array} the offset objects(s)
 */
const offset = (options, ...objects) => {
  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    if (path2$6.isA(object)) return offsetPath2_1(options, object)
    if (geom2$d.isA(object)) return offsetGeom2_1(options, object)
    // if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

var offset_1 = offset;

export const expansions = {
  expand: expand_1,
  offset: offset_1
};

const { plane: plane$4, vec3: vec3$d } = math;

/**
 * Calculate the plane of the given slice.
 * NOTE: The points are assumed to be planar from the beginning.
 * @param {slice} slice - the slice
 * @returns {plane} the plane of the slice
 * @example
 * let myplane = toPlane(slice)
 */
const calculatePlane = (slice) => {
  const edges = slice.edges;
  if (edges.length < 3) throw new Error('slices must have 3 or more edges to calculate a plane')

  // find the midpoint of the slice, which will lie on the plane by definition
  const midpoint = edges.reduce((point, edge) => vec3$d.add(point, edge[0]), vec3$d.create());
  vec3$d.scale(midpoint, 1 / edges.length, midpoint);

  // find the farthest edge from the midpoint, which will be on an outside edge
  let farthestEdge = [[NaN, NaN, NaN], [NaN, NaN, NaN]];
  let distance = 0;
  edges.forEach((edge) => {
    let d = vec3$d.squaredDistance(midpoint, edge[0]);
    if (d > distance) {
      farthestEdge = edge;
      distance = d;
    }
  });

  return plane$4.fromPoints(midpoint, farthestEdge[0], farthestEdge[1])
};

var calculatePlane_1 = calculatePlane;

/**
 * Creates a new empty slice.
 *
 * @returns {slice} a new slice
 */
const create$c = (edges) => {
  if (!edges) {
    edges = [];
  }
  return { edges }
};

var create_1$c = create$c;

/**
 * Create a deep clone of the given slice.
 *
 * @param {vec3} [out] - receiving slice
 * @param {vec3} slice - slice to clone
 * @returns {vec3} clone of the slice
 */
const clone$a = (...params) => {
  let out;
  let slice;
  if (params.length === 1) {
    out = create_1$c();
    slice = params[0];
  } else {
    out = params[0];
    slice = params[1];
  }
  // deep clone of edges
  out.edges = slice.edges.map((edge) => [vec3.clone(edge[0]), vec3.clone(edge[1])]);
  return out
};

var clone_1$a = clone$a;

/**
  * Determine if the given slices are equal.
  * @param {slice} a - the first slice to compare
  * @param {slice} b - the second slice to compare
  * @returns {boolean}
  */
const equals$7 = (a, b) => {
  let aedges = a.edges;
  let bedges = b.edges;

  if (aedges.length !== bedges.length) {
    return false
  }

  let isEqual = aedges.reduce((acc, aedge, i) => {
    let bedge = bedges[i];
    let d = vec3.squaredDistance(aedge[0], bedge[0]);
    return acc && (d < Number.EPSILON)
  }, true);

  return isEqual
};

var equals_1$7 = equals$7;

/**
 * Create a slice from the given points.
 *
 * @param {vec2[]|vec3[]} points - list of points
 *
 * @example
 * const points = [
 *   [0,  0],
 *   [0, 10],
 *   [0, 10]
 * ]
 * const slice = fromPoints(points)
 */
const fromPoints$7 = (points) => {
  if (!Array.isArray(points)) throw new Error('the given points must be an array')
  if (points.length < 3) throw new Error('the given points must contain THREE or more points')

  // create a list of edges from the points
  let edges = [];
  let prevpoint = points[points.length - 1];
  points.forEach((point) => {
    if (point.length === 2) edges.push([vec3.fromVec2(prevpoint), vec3.fromVec2(point)]);
    if (point.length === 3) edges.push([prevpoint, point]);
    prevpoint = point;
  });
  return create_1$c(edges)
};

var fromPoints_1$7 = fromPoints$7;

/**
 * Create a slice from the given sides (see geom2).
 *
 * @param {sides[]} sides - list of 2D sides
 *
 * @example
 * const myshape = circle({radius: 10})
 * const slice = fromSides(geom2.toSides(myshape))
 */
const fromSides = (sides) => {
  if (!Array.isArray(sides)) throw new Error('the given sides must be an array')

  // create a list of edges from the sides
  let edges = [];
  sides.forEach((side) => {
    edges.push([vec3.fromVec2(side[0]), vec3.fromVec2(side[1])]);
  });
  return create_1$c(edges)
};

var fromSides_1 = fromSides;

/**
 * Determin if the given object is a slice.
 * @params {slice} object - the object to interogate
 * @returns {true} if the object matches a slice based object
 */
const isA$4 = (object) => {
  if (object && typeof object === 'object') {
    if ('edges' in object) {
      if (Array.isArray(object.edges)) {
        return true
      }
    }
  }
  return false
};

var isA_1$4 = isA$4;

/**
 * Reverse the edges of the given slice.
 *
 * @param {slice} [out] - receiving slice
 * @param {slice} slice - slice to reverse
 * @returns {slice} reverse of the slice
 */
const reverse$4 = (...params) => {
  let out;
  let slice;
  if (params.length === 1) {
    out = create_1$c();
    slice = params[0];
  } else {
    out = params[0];
    slice = params[1];
  }
  // reverse the edges
  out.edges = slice.edges.map((edge) => [edge[1], edge[0]]);
  return out
};

var reverse_1$4 = reverse$4;

/**
 * Produces an array of edges from the given slice.
 * The returned array should not be modified as the data is shared with the slice.
 * @param {slice} slice - the slice
 * @returns {Array} an array of edges, each edge contains an array of three points (vec3)
 * @example
 * let sharededges = toEdges(slice)
 */
const toEdges$1 = (slice) => slice.edges;

var toEdges_1 = toEdges$1;

const { vec3: vec3$e } = math;

const { geom3: geom3$m, poly3: poly3$c } = geometry;





const toPolygon3D = (vector, edge) => {
  const points = [
    vec3$e.subtract(edge[0], vector),
    vec3$e.subtract(edge[1], vector),
    vec3$e.add(edge[1], vector),
    vec3$e.add(edge[0], vector)
  ];
  return poly3$c.fromPoints(points)
};

/**
 * Calculate the plane of the given slice.
 * NOTE: The points are assumed to be planar from the beginning.
 * @param {slice} slice - the slice
 * @returns {plane} the plane of the slice
 * @example
 * let myplane = toPlane(slice)
 */
const toPolygons$1 = (slice) => {
  const splane = calculatePlane_1(slice);

  // find the midpoint of the slice, which will lie on the plane by definition
  const edges = slice.edges;
  const midpoint = edges.reduce((point, edge) => vec3$e.add(point, edge[0]), vec3$e.create());
  vec3$e.scale(midpoint, 1 / edges.length, midpoint);

  // find the farthest edge from the midpoint, which will be on an outside edge
  let farthestEdge = [[NaN, NaN, NaN], [NaN, NaN, NaN]];
  let distance = 0;
  edges.forEach((edge) => {
    let d = vec3$e.squaredDistance(midpoint, edge[0]);
    if (d > distance) {
      farthestEdge = edge;
      distance = d;
    }
  });

  // create one LARGE polygon to encompass the side, i.e. base
  const direction = vec3$e.subtract(farthestEdge[0], midpoint);
  const perpendicular = vec3$e.cross(splane, direction);

  const p1 = vec3$e.add(midpoint, direction);
  vec3$e.add(p1, p1, direction);
  const p2 = vec3$e.add(midpoint, perpendicular);
  vec3$e.add(p2, p2, perpendicular);
  const p3 = vec3$e.subtract(midpoint, direction);
  vec3$e.subtract(p3, p3, direction);
  const p4 = vec3$e.subtract(midpoint, perpendicular);
  vec3$e.subtract(p4, p4, perpendicular);
  const poly1 = poly3$c.fromPoints([p1, p2, p3, p4]);
  const base = geom3$m.create([poly1]);

  const wallPolygons = edges.map((edge) => toPolygon3D(splane, edge));
  const walls = geom3$m.create(wallPolygons);

  // make an insection of the base and the walls, creating... a set of polygons!
  const geometry3 = intersectGeom3Sub_1(base, walls);

  // return only those polygons from the base
  let polygons = geom3$m.toPolygons(geometry3);
  polygons = polygons.filter((polygon) => {
    let a = vec3$e.angle(splane, polygon.plane);
    // walls should be PI / 2 radians rotated from the base
    return Math.abs(a) < (Math.PI / 90)
  });
  return polygons
};

var toPolygons_1$1 = toPolygons$1;

const edgesToString = (edges) => edges.reduce((result, edge) => result += `[${vec3.toString(edge[0])}, ${vec3.toString(edge[1])}], `, '');

const toString$b = (slice) => `[${edgesToString(slice.edges)}]`;

var toString_1$b = toString$b;

const { vec3: vec3$f } = math;



/**
 * Transform the given slice using the given matrix.
 * @param {mat4} matrix - transform matrix
 * @param {slice} slice - slice to transform
 * @returns {slice} the transformed slice
 */
const transform$b = (matrix, slice) => {
  const edges = slice.edges.map((edge) => [vec3$f.transform(matrix, edge[0]), vec3$f.transform(matrix, edge[1])]);
  return create_1$c(edges)
};

var transform_1$b = transform$b;

var slice = {
  calculatePlane: calculatePlane_1,
  clone: clone_1$a,
  create: create_1$c,
  equals: equals_1$7,
  fromPoints: fromPoints_1$7,
  fromSides: fromSides_1,
  isA: isA_1$4,
  reverse: reverse_1$4,
  toEdges: toEdges_1,
  toPolygons: toPolygons_1$1,
  toString: toString_1$b,
  transform: transform_1$b
};

const { vec3: vec3$g } = math;

const { poly3: poly3$d } = geometry;



// https://en.wikipedia.org/wiki/Greatest_common_divisor#Using_Euclid's_algorithm
const gcd = (a, b) => {
  if (a === b) { return a }
  if (a < b) { return gcd(b, a) }
  if (b === 1) { return 1 }
  if (b === 0) { return a }
  return gcd(b, a % b)
};

const lcm = (a, b) => (a * b) / gcd(a, b);

// Return a set of edges that encloses the same area by splitting
// the given edges to have newlength total edges.
const repartitionEdges = (newlength, edges) => {
  // NOTE: This implementation splits each edge evenly.
  const multiple = newlength / edges.length;
  if (multiple === 1) {
    return edges
  }

  const divisor = vec3$g.fromValues(multiple, multiple, multiple);

  const newEdges = [];
  edges.forEach((edge) => {
    const increment = vec3$g.divide(vec3$g.subtract(edge[1], edge[0]), divisor);

    // repartition the edge
    let prev = edge[0];
    for (let i = 1; i <= multiple; ++i) {
      let next = vec3$g.add(prev, increment);
      newEdges.push([prev, next]);
      prev = next;
    }
  });
  return newEdges
};

const extrudeWalls = (slice0, slice1) => {
  let edges0 = slice.toEdges(slice0);
  let edges1 = slice.toEdges(slice1);

  if (edges0.length !== edges1.length) {
    // different shapes, so adjust one or both to the same number of edges
    const newlength = lcm(edges0.length, edges1.length);
    if (newlength !== edges0.length) edges0 = repartitionEdges(newlength, edges0);
    if (newlength !== edges1.length) edges1 = repartitionEdges(newlength, edges1);
  }

  const walls = [];
  edges0.forEach((edge0, i) => {
    let edge1 = edges1[i];

    let poly0 = poly3$d.fromPoints([edge0[0], edge0[1], edge1[1]]);
    let poly1 = poly3$d.fromPoints([edge0[0], edge1[1], edge1[0]]);

    walls.push(poly0, poly1);
  });
  return walls
};

var extrudeWalls_1 = extrudeWalls;

const { mat4: mat4$4 } = math;

const { geom2: geom2$e, geom3: geom3$n, poly3: poly3$e } = geometry;





const defaultCallback = (progress, index, base) => {
  let baseSlice = null;
  if (geom2$e.isA(base)) baseSlice = slice.fromSides(geom2$e.toSides(base));
  if (poly3$e.isA(base)) baseSlice = slice.fromPoints(poly3$e.toPoints(base));

  return progress === 0 || progress === 1 ? slice.transform(mat4$4.fromTranslation([0, 0, progress]), baseSlice) : null
};

/**
 * Extrude a solid from the slices as returned by the callback function.
 *
 * @param {Object} options - options for extrude
 * @param {Integer} [options.numberOfSlices=2] the number of slices to be generated by the callback
 * @param {Boolean} [options.isCapped=true] the solid should have caps at both start and end
 * @param {Function} [options.callback] the callback function that generates each slice
 * @param {Object} base - the base object which is used to create slices (see below for callback information)
 * @return {geom3} the extruded shape
 *
 * @example
 * // Parameters:
 * //   progress : the percent complete [0..1]
 * //   index : the index of the current slice [0..numberOfSlices - 1]
 * //   base : the base object as given
 * // Return Value:
 * //   slice or null (to skip)
 * const callback = (progress, index, base) => {
 *   ...
 *   return slice
 * }
 */
const extrudeFromSlices = (options, base) => {
  const defaults = {
    numberOfSlices: 2,
    isCapped: true,
    callback: defaultCallback
  };
  let { numberOfSlices, isCapped, callback } = Object.assign({ }, defaults, options);

  if (numberOfSlices < 2) throw new Error('numberOfSlices must be 2 or more')

  const sMax = numberOfSlices - 1;

  let startSlice = null;
  let endSlice = null;
  let prevSlice = null;
  let polygons = [];
  for (let s = 0; s < numberOfSlices; s++) {
    // invoke the callback function to get the next slice
    // NOTE: callback can return null to skip the slice
    let currentSlice = callback(s / sMax, s, base);

    if (currentSlice) {
      if (!slice.isA(currentSlice)) throw new Error('the callback function must return slice objects')

      let edges = slice.toEdges(currentSlice);
      if (edges.length === 0) throw new Error('the callback function must return slices with one or more edges')

      if (prevSlice) {
        polygons = polygons.concat(extrudeWalls_1(prevSlice, currentSlice));
      }

      // save start and end slices for caps if necessary
      if (s === 0) startSlice = currentSlice;
      if (s === (numberOfSlices - 1)) endSlice = currentSlice;

      prevSlice = currentSlice;
    }
  }

  if (isCapped) {
    // create caps at both ends (closed volume)
    const endPolygons = slice.toPolygons(endSlice);
    polygons = polygons.concat(endPolygons);

    slice.reverse(startSlice, startSlice);
    const startPolygons = slice.toPolygons(startSlice);
    polygons = polygons.concat(startPolygons);
  } else {
    // create walls between end and start slices
    if (!slice.equals(endSlice, startSlice)) {
      polygons = polygons.concat(extrudeWalls_1(endSlice, startSlice));
    }
  }
  return geom3$n.create(polygons)
};

var extrudeFromSlices_1 = extrudeFromSlices;

const { mat4: mat4$5, vec3: vec3$h } = math;

const { geom2: geom2$f } = geometry;





/*
 * Extrude the given geometry using the given options.
 *
 * @param {Object} [options] - options for extrude
 * @param {Array} [options.offset] - the direction of the extrusion as a 3D vector
 * @param {Number} [options.twistAngle] - the final rotation (RADIANS) about the origin
 * @param {Integer} [options.twistSteps] - the number of steps created to produce the twist (if any)
 * @param {geom2} geometry - the geometry to extrude
 * @returns {geom3} the extruded 3D geometry
*/
const extrudeGeom2 = (options, geometry) => {
  const defaults = {
    offset: [0, 0, 1],
    twistAngle: 0,
    twistSteps: 12
  };
  let { offset, twistAngle, twistSteps } = Object.assign({ }, defaults, options);

  if (twistSteps < 1) throw new Error('twistSteps must be 1 or more')

  if (twistAngle === 0) {
    twistSteps = 1;
  }

  // convert to vector in order to perform transforms
  let offsetv = vec3$h.fromArray(offset);

  const baseSides = geom2$f.toSides(geometry);
  if (baseSides.length === 0) throw new Error('the given geometry cannot be empty')

  const baseSlice = slice.fromSides(baseSides);
  if (offsetv[2] < 0) slice.reverse(baseSlice, baseSlice);

  const createTwist = (progress, index, base) => {
    let Zrotation = index / twistSteps * twistAngle;
    let Zoffset = vec3$h.scale(index / twistSteps, offsetv);
    let matrix = mat4$5.multiply(mat4$5.fromZRotation(Zrotation), mat4$5.fromTranslation(Zoffset));

    return slice.transform(matrix, base)
  };

  options = {
    numberOfSlices: twistSteps + 1,
    isCapped: true,
    callback: createTwist
  };
  return extrudeFromSlices_1(options, baseSlice)
};

var extrudeLinearGeom2 = extrudeGeom2;

const { geom2: geom2$g } = geometry;



/**
 * Extrude the given object(s) in a linear direction using the given options.
 * @param {Object} [options] - options for extrude
 * @param {Array} [options.height=1] the height of the extrusion
 * @param {Number} [options.twistAngle=0] the final rotation (RADIANS) about the origin of the shape (if any)
 * @param {Integer} [options.twistSteps=1] the resolution of the twist about the axis (if any)
 * @param {Object|Array} objects - the objects(s) to extrude
 * @return {Object|Array} the extruded object(s)
 *
 * @example
 * let myshape = extrudeLinear({height: 10}, rectangle({size: [20, 25]}))
 */
const extrudeLinear = (options, ...objects) => {
  const defaults = {
    height: 1,
    twistAngle: 0,
    twistSteps: 1
  };
  let { height, twistAngle, twistSteps } = Object.assign({ }, defaults, options);

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  options = { offset: [0, 0, height], twistAngle: twistAngle, twistSteps: twistSteps };

  const results = objects.map((object) => {
    // if (path.isA(object)) return pathextrude(options, object)
    if (geom2$g.isA(object)) return extrudeLinearGeom2(options, object)
    // if (geom3.isA(object)) return geom3.extrude(options, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

var extrudeLinear_1 = extrudeLinear;

const { path2: path2$7 } = geometry;

const { expand: expand$1 } = expansions;



/*
 * Expand and extrude the given geometry (path2).
 * @See expand for addition options
 * @param {Object} options - options for extrusion, if any
 * @param {Number} [options.size=1] - size of the rectangle
 * @param {Number} [options.height=1] - height of the extrusion
 * @param {path2} geometry - the geometry to extrude
 * @return {geom3} the extruded geometry
 */
const extrudeRectangularPath2 = (options, geometry) => {
  const defaults = {
    size: 1,
    height: 1
  };
  let { size, height } = Object.assign({ }, defaults, options);

  options.delta = size;
  options.offset = [0, 0, height];

  const points = path2$7.toPoints(geometry);
  if (points.length === 0) throw new Error('the given geometry cannot be empty')

  let newgeometry = expand$1(options, geometry);
  return extrudeLinearGeom2(options, newgeometry)
};

var extrudeRectangularPath2_1 = extrudeRectangularPath2;

const { area: area$2 } = utils;

const { geom2: geom2$h, path2: path2$8 } = geometry;

const { expand: expand$2 } = expansions;



/*
 * Expand and extrude the given geometry (geom2).
 * @see expand for additional options
 * @param {Object} options - options for extrusion, if any
 * @param {Number} [options.size=1] - size of the rectangle
 * @param {Number} [options.height=1] - height of the extrusion
 * @param {geom2} geometry - the geometry to extrude
 * @return {geom3} the extruded geometry
 */
const extrudeRectangularGeom2 = (options, geometry) => {
  const defaults = {
    size: 1,
    height: 1
  };
  let { size, height } = Object.assign({ }, defaults, options);

  options.delta = size;
  options.offset = [0, 0, height];

  // convert the geometry to outlines
  let outlines = geom2$h.toOutlines(geometry);
  if (outlines.length === 0) throw new Error('the given geometry cannot be empty')

  // expand the outlines
  let newparts = outlines.map((outline) => {
    if (area$2(outline) < 0) outline.reverse(); // all outlines must wind counter clockwise
    return expand$2(options, path2$8.fromPoints({ closed: true }, outline))
  });

  // create a composite geometry
  let allsides = newparts.reduce((sides, part) => sides.concat(geom2$h.toSides(part)), []);
  let newgeometry = geom2$h.create(allsides);

  return extrudeLinearGeom2(options, newgeometry)
};

var extrudeRectangularGeom2_1 = extrudeRectangularGeom2;

const { geom2: geom2$i, path2: path2$9 } = geometry;




/**
 * Extrude the given object(s) by following the outline(s) with a rectangle.
 * @See expand for addition options
 * @param {Object} options - options for extrusion, if any
 * @param {Number} [options.size=1] - size of the rectangle
 * @param {Number} [options.height=1] - height of the extrusion
 * @param {Object|Array} objects - the objects(s) to extrude
 * @return {Object|Array} the extruded object(s)
 *
 * @example:
 * let mywalls = extrudeRectangular({offset: [0,0,10]}, square())
 */
const extrudeRectangular = (options, ...objects) => {
  const defaults = {
    size: 1,
    height: 1
  };
  let { size, height } = Object.assign({}, defaults, options);

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  if (size <= 0) throw new Error('size must be positive')
  if (height <= 0) throw new Error('height must be positive')

  const results = objects.map((object) => {
    if (path2$9.isA(object)) return extrudeRectangularPath2_1(options, object)
    if (geom2$i.isA(object)) return extrudeRectangularGeom2_1(options, object)
    // if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

var extrudeRectangular_1 = extrudeRectangular;

const { mat4: mat4$6 } = math;

const { geom2: geom2$j } = geometry;





/**
 * Rotate extrude the given geometry using the given options.
 *
 * @param {Object} [options] - options for extrusion
 * @param {Float} [options.angle=PI*2] - angle of the extrusion (RADIANS)
 * @param {Float} [options.startAngle=0] - start angle of the extrusion (RADIANS)
 * @param {Float} [options.overflow='cap'] - what to do with points outside of bounds (+ / - x) :
 * defaults to capping those points to 0 (only supported behaviour for now)
 * @param {Integer} [options.segments=12] - number of segments of the extrusion
 * @param {geom2} geometry - the 2D geometry to extrude
 * @returns {geom3} new extruded 3D geometry
 */
const extrudeRotate = (options, geometry) => {
  const defaults = {
    segments: 12,
    startAngle: 0,
    angle: (Math.PI * 2),
    overflow: 'cap'
  };
  let { segments, startAngle, angle, overflow } = Object.assign({}, defaults, options);

  if (segments < 3) throw new Error('segments must be greater then 3')

  startAngle = Math.abs(startAngle) > (Math.PI * 2) ? startAngle % (Math.PI * 2) : startAngle;
  angle = Math.abs(angle) > (Math.PI * 2) ? angle % (Math.PI * 2) : angle;

  let endAngle = startAngle + angle;
  endAngle = Math.abs(endAngle) > (Math.PI * 2) ? endAngle % (Math.PI * 2) : endAngle;

  if (endAngle < startAngle) {
    let x = startAngle;
    startAngle = endAngle;
    endAngle = x;
  }
  let totalRotation = endAngle - startAngle;
  if (totalRotation <= 0.0) totalRotation = (Math.PI * 2);

  if (Math.abs(totalRotation) < (Math.PI * 2)) {
    // adjust the segments to achieve the total rotation requested
    let anglePerSegment = (Math.PI * 2) / segments;
    segments = Math.floor(Math.abs(totalRotation) / anglePerSegment);
    if (Math.abs(totalRotation) > (segments * anglePerSegment)) segments++;
  }

  // console.log('startAngle: '+startAngle)
  // console.log('endAngle: '+endAngle)
  // console.log(totalRotation)
  // console.log(segments)

  // convert geometry to an array of sides, easier to deal with
  let shapeSides = geom2$j.toSides(geometry);
  if (shapeSides.length === 0) throw new Error('the given geometry cannot be empty')

  // determine if the rotate extrude can be computed in the first place
  // ie all the points have to be either x > 0 or x < 0

  // generic solution to always have a valid solid, even if points go beyond x/ -x
  // 1. split points up between all those on the 'left' side of the axis (x<0) & those on the 'righ' (x>0)
  // 2. for each set of points do the extrusion operation IN OPOSITE DIRECTIONS
  // 3. union the two resulting solids

  // 1. alt : OR : just cap of points at the axis ?

  const pointsWithNegativeX = shapeSides.filter((s) => (s[0][0] < 0));
  const pointsWithPositiveX = shapeSides.filter((s) => (s[0][0] >= 0));
  const arePointsWithNegAndPosX = pointsWithNegativeX.length > 0 && pointsWithPositiveX.length > 0;

  // FIXME actually there are cases where setting X=0 will change the basic shape
  // - Alternative #1 : don't allow shapes with both negative and positive X values
  // - Alternative #2 : remove one half of the shape (costly)
  if (arePointsWithNegAndPosX && overflow === 'cap') {
    if (pointsWithNegativeX.length > pointsWithPositiveX.length) {
      shapeSides = shapeSides.map((side) => {
        let point0 = side[0];
        let point1 = side[1];
        point0 = [Math.min(point0[0], 0), point0[1]];
        point1 = [Math.min(point1[0], 0), point1[1]];
        return [point0, point1]
      });
    } else if (pointsWithPositiveX.length >= pointsWithNegativeX.length) {
      shapeSides = shapeSides.map((side) => {
        let point0 = side[0];
        let point1 = side[1];
        point0 = [Math.max(point0[0], 0), point0[1]];
        point1 = [Math.max(point1[0], 0), point1[1]];
        return [point0, point1]
      });
    }
    // recreate the geometry from the capped points
    geometry = geom2$j.create(shapeSides);
  }

  const rotationPerSlice = totalRotation / segments;
  const isCapped = Math.abs(totalRotation) < (Math.PI * 2);
  const baseSlice = slice.fromSides(geom2$j.toSides(geometry));
  slice.reverse(baseSlice, baseSlice);

  const createSlice = (progress, index, base) => {
    let Zrotation = rotationPerSlice * index + startAngle;
    let matrix = mat4$6.multiply(mat4$6.fromZRotation(Zrotation), mat4$6.fromXRotation(Math.PI / 2));

    return slice.transform(matrix, base)
  };

  options = {
    numberOfSlices: segments + 1,
    isCapped: isCapped,
    callback: createSlice
  };
  return extrudeFromSlices_1(options, baseSlice)
};

var extrudeRotate_1 = extrudeRotate;

export const extrusions = {
  extrudeFromSlices: extrudeFromSlices_1,
  extrudeLinear: extrudeLinear_1,
  extrudeRectangular: extrudeRectangular_1,
  extrudeRotate: extrudeRotate_1,
  slice: slice
};

const { vec2: vec2$b } = math;

const angleBetweenPoints = (p0, p1) => {
  return Math.atan2((p1[1] - p0[1]), (p1[0] - p0[0]))
};

const compareIndex = (index1, index2) => {
  if (index1.angle < index2.angle) {
    return -1
  } else if (index1.angle > index2.angle) {
    return 1
  } else {
    if (index1.distance < index2.distance) {
      return -1
    } else if (index1.distance > index2.distance) {
      return 1
    }
  }
  return 0
};

// Ported from https://github.com/bkiers/GrahamScan
const compute = (points) => {
  if (points.length < 3) {
    return points
  }

  // Find the lowest point
  let min = 0;
  points.forEach((point, i) => {
    let minpoint = points[min];
    if (point[1] === minpoint[1]) {
      if (point[0] < minpoint[0]) {
        min = i;
      }
    } else if (point[1] < minpoint[1]) {
      min = i;
    }
  });

  // Calculate angles and distances from the lowest point
  let al = [];
  let angle = 0.0;
  let dist = 0.0;
  for (let i = 0; i < points.length; i++) {
    if (i === min) {
      continue
    }
    angle = angleBetweenPoints(points[min], points[i]);
    if (angle < 0) {
      angle += Math.PI;
    }
    dist = vec2$b.squaredDistance(points[min], points[i]);
    al.push({ index: i, angle: angle, distance: dist });
  }

  al.sort(function (a, b) { return compareIndex(a, b) });

  // Wind around the points CCW, removing interior points
  let stack = new Array(points.length + 1);
  let j = 2;
  for (let i = 0; i < points.length; i++) {
    if (i === min) {
      continue
    }
    stack[j] = al[j - 2].index;
    j++;
  }
  stack[0] = stack[points.length];
  stack[1] = min;

  const ccw = (i1, i2, i3) => {
    return (points[i2][0] - points[i1][0]) * (points[i3][1] - points[i1][1]) -
           (points[i2][1] - points[i1][1]) * (points[i3][0] - points[i1][0])
  };

  let tmp;
  let M = 2;
  for (let i = 3; i <= points.length; i++) {
    while (ccw(stack[M - 1], stack[M], stack[i]) < 1e-5) {
      M--;
    }
    M++;
    tmp = stack[i];
    stack[i] = stack[M];
    stack[M] = tmp;
  }

  // Return the indices to the points
  const indices = new Array(M);
  for (let i = 0; i < M; i++) {
    indices[i] = stack[i + 1];
  }
  return indices
};

/*
 * Create a convex hull of the given set of points,  where each point is an array of [x,y].
 * @param {Array} uniquepoints - list of UNIQUE points from which to create a hull
 * @returns {Array} a list of points that form the hull
 */
const hullPoints2 = (uniquepoints) => {
  let indices = compute(uniquepoints);

  let hullpoints = [];
  if (Array.isArray(indices)) {
    hullpoints = indices.map((index) => uniquepoints[index]);
  }
  return hullpoints
};

var hullPoints2_1 = hullPoints2;

const { vec2: vec2$c } = math;

const { path2: path2$a } = geometry;



/*
 * Create a convex hull of the given geometries (path2).
 * @param {...geometries} geometries - list of path2 geometries
 * @returns {path2} new geometry
 */
const hullPath2 = (...geometries) => {
  geometries = flatten_1(geometries);

  // extract the unique points from the geometries
  let uniquepoints = [];
  geometries.forEach((geometry) => {
    let points = path2$a.toPoints(geometry);
    points.forEach((point) => {
      let index = uniquepoints.findIndex((unique) => vec2$c.equals(unique, point));
      if (index < 0) uniquepoints.push(point);
    });
  });

  let hullpoints = hullPoints2_1(uniquepoints);

  // assemble a new geometry from the list of points
  return path2$a.fromPoints({closed: true}, hullpoints)
};

var hullPath2_1 = hullPath2;

const { geom2: geom2$k } = geometry;



/*
 * Create a convex hull of the given geom2 geometries.
 * @param {...geometries} geometries - list of geom2 geometries
 * @returns {geom2} new geometry
 */
const hullGeom2 = (...geometries) => {
  geometries = flatten_1(geometries);

  // extract the unique points from the geometries
  let uniquepoints = [];
  let found = new Map();
  for (let g = 0; g < geometries.length; g++) {
    let sides = geom2$k.toSides(geometries[g]);
     for (let s = 0; s < sides.length; s++) {
       let side = sides[s];
       let point = side[0];
       let id = `${point[0]},${point[1]}`;
       if (found.has(id)) continue
       uniquepoints.push(point);
       found.set(id, true);
     }
  }
  found.clear();

  let hullpoints = hullPoints2_1(uniquepoints);

  // NOTE: more then three points are required to create a new geometry
  if (hullpoints.length < 3) return geom2$k.create()

  // assemble a new geometry from the list of points
  return geom2$k.fromPoints(hullpoints)
};

var hullGeom2_1 = hullGeom2;

/*
 * Create a convex hull of the given geometries (geom3).
 * @param {...geometries} geometries - list of geom3 geometries
 * @returns {geom3} new geometry
 */
const hullGeom3 = (...geometries) => {
  throw new Error('sorry. hull of 3D geometries is not supported yet')
};

var hullGeom3_1 = hullGeom3;

const { geom2: geom2$l, geom3: geom3$o, path2: path2$b } = geometry;





/** Create a convex hull of the given geometries.
 * @param {...geometries} geometries - list of geometries from which to create a hull
 * @returns {geometry} new geometry
 *
 * @example:
 * let myshape = hull(rectangle({center: [-5,-5]}), ellipse({center: [5,5]}))
 *
 * @example
 * +-------+           +-------+
 * |       |           |        \
 * |   A   |           |         \
 * |       |           |          \
 * +-------+           +           \
 *                  =   \           \
 *       +-------+       \           +
 *       |       |        \          |
 *       |   B   |         \         |
 *       |       |          \        |
 *       +-------+           +-------+
 */
const hull = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType_1(geometries)) ;

  let geometry = geometries[0];
  if (path2$b.isA(geometry)) return hullPath2_1(geometries)
  if (geom2$l.isA(geometry)) return hullGeom2_1(geometries)
  if (geom3$o.isA(geometry)) return hullGeom3_1(geometries)

  // FIXME should this throw an error for unknown geometries?
  return geometry
};

var hull_1 = hull;

/**
 * Create a chain of hulled geometries from the given gemetries.
 * Essentially hull A+B, B+C, C+D, etc., then union the results.
 * @param {...geometries} geometries - list of geometries from which to create hulls
 * @returns {geometry} new geometry
 *
 * @example:
 * let newshape = hullChain(rectangle({center: [-5,-5]}), circle({center: [0,0]}), rectangle({center: [5,5]}))
 */
const hullChain = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length < 2) throw new Error('wrong number of arguments')

  let hulls = [];
  for (let i = 1; i < geometries.length; i++) {
    hulls.push(hull_1(geometries[i - 1], geometries[i]));
  }
  return union_1(hulls)
};

var hullChain_1 = hullChain;

export const hulls = {
  hull: hull_1,
  hullChain: hullChain_1
};

const { geom2: geom2$m, geom3: geom3$p, path2: path2$c, poly3: poly3$f } = geometry;

/*
 * Measure the area of the given geometry.
 * NOTE: paths are infinitely narrow and do not have an area
 *
 * @param {path2} geometry - geometry to measure
 * @returns {Number} area of the geometry
 */
const measureAreaOfPath2 = () => 0;

/*
 * Measure the area of the given geometry.
 * For a counter clockwise rotating geometry (about Z) the area is positive, otherwise negative.
 *
 * @see http://paulbourke.net/geometry/polygonmesh/
 * @param {geom2} geometry - 2D geometry to measure
 * @returns {Number} area of the geometry
 */
const measureAreaOfGeom2 = (geometry) => {
  const sides = geom2$m.toSides(geometry);
  let area = sides.reduce((area, side) => area + (side[0][0] * side[1][1] - side[0][1] * side[1][0]), 0);
  area *= 0.5;
  return area
};

/*
 * Measure the area of the given geometry.
 *
 * @param {geom3} geometry - 3D geometry to measure
 * @returns {Number} area of the geometry
 */
const measureAreaOfGeom3 = (geometry) => {
  const polygons = geom3$p.toPolygons(geometry);
  return polygons.reduce((area, polygon) => area + poly3$f.measureArea(polygon), 0)
};

/**
 * Measure the area of the given geometry(s).
 * @param {...geometries} geometries - the geometry(s) to measure
 * @return {Number|Number[]} the area for each geometry
 *
 * @example
 * let area = measureArea(sphere())
 */
const measureArea$2 = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2$c.isA(geometry)) return measureAreaOfPath2()
    if (geom2$m.isA(geometry)) return measureAreaOfGeom2(geometry)
    if (geom3$p.isA(geometry)) return measureAreaOfGeom3(geometry)
    return 0
  });
  return results.length === 1 ? results[0] : results
};

var measureArea_1$2 = measureArea$2;

const { geom2: geom2$n, geom3: geom3$q, path2: path2$d, poly3: poly3$g } = geometry;

/*
 * Measure the volume of the given geometry.
 * NOTE: paths are infinitely narrow and do not have an volume
 *
 * @param {Path2} geometry - geometry to measure
 * @returns {Number} volume of the geometry
 */
const measureVolumeOfPath2 = () => 0;

/*
 * Measure the volume of the given geometry.
 * NOTE: 2D geometry are infinitely thin and do not have an volume
 *
 * @param {Geom2} geometry - 2D geometry to measure
 * @returns {Number} volume of the geometry
 */
const measureVolumeOfGeom2 = () => 0;

/*
 * Measure the volume of the given geometry.
 *
 * @param {Geom3} geometry - 3D geometry to measure
 * @returns {Number} volume of the geometry
 */
const measureVolumeOfGeom3 = (geometry) => {
  const polygons = geom3$q.toPolygons(geometry);
  return polygons.reduce((volume, polygon) => volume + poly3$g.measureSignedVolume(polygon), 0)
};

/**
 * Measure the volume of the given geometry(s).
 * @param {...geometries} geometries - the geometry(s) to measure
 * @return {Number|Number[]} the volume for each geometry
 *
 * @example
 * let volume = measureVolume(sphere())
 */
const measureVolume = (...geometries) => {
  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2$d.isA(geometry)) return measureVolumeOfPath2()
    if (geom2$n.isA(geometry)) return measureVolumeOfGeom2()
    if (geom3$q.isA(geometry)) return measureVolumeOfGeom3(geometry)
    return 0
  });
  return results.length === 1 ? results[0] : results
};

var measureVolume_1 = measureVolume;

export const measurements = {
  measureArea: measureArea_1$2,
  measureBounds: measureBounds_1,
  measureVolume: measureVolume_1
};

const { geom2: geom2$o, geom3: geom3$r, path2: path2$e } = geometry;

/**
 * Translate the given object(s) using the given options (if any)
 * @param {Array} offsets - offsets of which to translate the object
 * @param {Object|Array} objects - the objects(s) to translate
 * @return {Object|Array} the translated object(s)
 *
 * @example
 * const newsphere = translate({offsets: [5, 0, 10]}, sphere())
 */
const translate$1 = (offsets, ...objects) => {
  if (!Array.isArray(offsets)) throw new Error('offsets must be an array')
  if (offsets.length !== 3) throw new Error('offsets must contain X, Y and Z values')

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const matrix = mat4.fromTranslation(offsets);

  const results = objects.map(function (object) {
    if (path2$e.isA(object)) return path2$e.transform(matrix, object)
    if (geom2$o.isA(object)) return geom2$o.transform(matrix, object)
    if (geom3$r.isA(object)) return geom3$r.transform(matrix, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

const translateX = (offset, ...objects) => translate$1([offset, 0, 0], objects);

const translateY = (offset, ...objects) => translate$1([0, offset, 0], objects);

const translateZ = (offset, ...objects) => translate$1([0, 0, offset], objects);

var translate_1$1 = {
  translate: translate$1,
  translateX,
  translateY,
  translateZ
};

const { geom2: geom2$p, geom3: geom3$s, path2: path2$f } = geometry;

const { measureBounds: measureBounds$1 } = measurements;

const { translate: translate$2 } = translate_1$1;

const centerGeometry = (options, object) => {
  const defaults = {
    axes: [true, true, true],
    center: [0, 0, 0]
  };
  const { axes, center } = Object.assign({}, defaults, options);

  let bounds = measureBounds$1(object);
  let offset = [0, 0, 0];
  if (axes[0]) offset[0] = center[0] - (bounds[0][0] + ((bounds[1][0] - bounds[0][0]) / 2));
  if (axes[1]) offset[1] = center[1] - (bounds[0][1] + ((bounds[1][1] - bounds[0][1]) / 2));
  if (axes[2]) offset[2] = center[2] - (bounds[0][2] + ((bounds[1][2] - bounds[0][2]) / 2));
  return translate$2(offset, object)
};

/**
 * Center the given object(s) using the given options (if any)
 * @param {Object} options - options for centering
 * @param {Array} [options.axes=[true,true,true]] - axis of which to center, true or false
 * @param {Array} [options.center=[0,0,0]] - point of which to center the object upon
 * @param {Object|Array} geometries - the geometries to center
 * @return {Object|Array} the centered geometries
 *
 * @example
 * let myshape = center({axes: [true,false,false]}, sphere()) // center about the X axis
 */
const center = function (options, ...geometries) {
  const defaults = {
    axes: [true, true, true],
    center: [0, 0, 0]
  // TODO : Add addition 'methods' of centering; midpoint, centeriod
  };
  const { axes, center } = Object.assign({}, defaults, options);

  geometries = flatten_1(geometries);
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  options = {
    axes: axes,
    center: center
  };

  const results = geometries.map((object) => {
    if (path2$f.isA(object)) return centerGeometry(options, object)
    if (geom2$p.isA(object)) return centerGeometry(options, object)
    if (geom3$s.isA(object)) return centerGeometry(options, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

const centerX = (...objects) => center({ axes: [true, false, false] }, objects);

const centerY = (...objects) => center({ axes: [false, true, false] }, objects);

const centerZ = (...objects) => center({ axes: [false, false, true] }, objects);

var center_1 = {
  center,
  centerX,
  centerY,
  centerZ
};

const { mat4: mat4$7, plane: plane$5 } = math;

const { geom2: geom2$q, geom3: geom3$t, path2: path2$g } = geometry;

/**
 * Mirror the given object(s) using the given options (if any)
 * Note: The normal should be given as 90 degrees from the plane origin.
 * @param {Object} options - options for mirror
 * @param {Array} [options.origin=[0,0,0]] - the origin of the plane
 * @param {Array} [options.normal=[0,0,1]] - the normal vector of the plane
 * @param {Object|Array} objects - the objects(s) to mirror
 * @return {Object|Array} the mirrored object(s)
 *
 * @example
 * const newsphere = mirror({normal: [0,0,10]}, cube({center: [0,0,15], radius: [20, 25, 5]}))
 */
const mirror$1 = (options, ...objects) => {
  const defaults = {
    origin: [0, 0, 0],
    normal: [0, 0, 1] // Z axis
  };
  let { origin, normal } = Object.assign({}, defaults, options);

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const planeOfMirror = plane$5.fromNormalAndPoint(normal, origin);
  const matrix = mat4$7.mirrorByPlane(planeOfMirror);

  // special check to verify the plane, i.e. check that the given normal was valid
  const validPlane = !Number.isNaN(planeOfMirror[0]);

  const results = objects.map((object) => {
    if (validPlane) {
      if (path2$g.isA(object)) return path2$g.transform(matrix, object)
      if (geom2$q.isA(object)) return geom2$q.transform(matrix, object)
      if (geom3$t.isA(object)) return geom3$t.transform(matrix, object)
    }
    return object
  });
  return results.length === 1 ? results[0] : results
};

const mirrorX = (...objects) => mirror$1({ normal: [1, 0, 0] }, objects);

const mirrorY = (...objects) => mirror$1({ normal: [0, 1, 0] }, objects);

const mirrorZ = (...objects) => mirror$1({ normal: [0, 0, 1] }, objects);

var mirror_1$1 = {
  mirror: mirror$1,
  mirrorX,
  mirrorY,
  mirrorZ
};

const { geom2: geom2$r, geom3: geom3$u, path2: path2$h } = geometry;

/**
 * Rotate the given object(s) using the given options (if any)
 * @param {Number[]} angles - angle (RADIANS) of rotations about X, Y, and X axis
 * @param {Object|Array} objects - the objects(s) to rotate
 * @return {Object|Array} the rotated object(s)
 *
 * @example
 * const newsphere = rotate([45,0,0], sphere())
 */
const rotate$2 = (angles, ...objects) => {
  if (!Array.isArray(angles)) throw new Error('angles must be an array')
  if (angles.length !== 3) throw new Error('angles must contain X, Y and Z values')

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  let yaw = angles[2];
  let pitch = angles[1];
  let roll = angles[0];

  const matrix = mat4.fromTaitBryanRotation(yaw, pitch, roll);

  const results = objects.map((object) => {
    if (path2$h.isA(object)) return path2$h.transform(matrix, object)
    if (geom2$r.isA(object)) return geom2$r.transform(matrix, object)
    if (geom3$u.isA(object)) return geom3$u.transform(matrix, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

const rotateX$2 = (angle, ...objects) => rotate$2([angle, 0, 0], objects);

const rotateY$2 = (angle, ...objects) => rotate$2([0, angle, 0], objects);

const rotateZ$2 = (angle, ...objects) => rotate$2([0, 0, angle], objects);

var rotate_1$2 = {
  rotate: rotate$2,
  rotateX: rotateX$2,
  rotateY: rotateY$2,
  rotateZ: rotateZ$2
};

const { geom2: geom2$s, geom3: geom3$v, path2: path2$i } = geometry;

/**
 * Scale the given object(s) using the given options (if any)
 * @param {Array} factors - X, Y, Z factors by which to scale the object
 * @param {Object|Array} objects - the objects(s) to scale
 * @return {Object|Array} the scaled object(s)
 *
 * @example
 * const newsphere = scale([5, 0, 10], sphere())
 */
const scale$3 = (factors, ...objects) => {
  if (!Array.isArray(factors)) throw new Error('factors must be an array')
  if (factors.length !== 3) throw new Error('factors must contain X, Y and Z values')
  if (factors[0] <= 0 || factors[1] <= 0 || factors[2] <= 0) throw new Error('factors must be positive')

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const matrix = mat4.fromScaling(factors);

  const results = objects.map(function (object) {
    if (path2$i.isA(object)) return path2$i.transform(matrix, object)
    if (geom2$s.isA(object)) return geom2$s.transform(matrix, object)
    if (geom3$v.isA(object)) return geom3$v.transform(matrix, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

const scaleX = (offset, ...objects) => scale$3([offset, 1, 1], objects);

const scaleY = (offset, ...objects) => scale$3([1, offset, 1], objects);

const scaleZ = (offset, ...objects) => scale$3([1, 1, offset], objects);

var scale_1$3 = {
  scale: scale$3,
  scaleX,
  scaleY,
  scaleZ
};

const { geom2: geom2$t, geom3: geom3$w, path2: path2$j } = geometry;

/**
 * Transform the given object(s) using the given matrix
 * @param {mat4} matrix - a transformation matrix
 * @param {Object|Array} objects - the objects(s) to transform
 * @return {Object|Array} the transform object(s)
 *
 * @example
 * const newsphere = transform(mat4.rotateX(Math.PI/4), sphere())
 */
const transform$c = function (matrix, ...objects) {
  // TODO how to check that the matrix is REAL?

  objects = flatten_1(objects);
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map(function (object) {
    if (path2$j.isA(object)) return path2$j.transform(matrix, object)
    if (geom2$t.isA(object)) return geom2$t.transform(matrix, object)
    if (geom3$w.isA(object)) return geom3$w.transform(matrix, object)
    return object
  });
  return results.length === 1 ? results[0] : results
};

var transform_1$c = transform$c;

export const transforms = {
  center: center_1.center,
  centerX: center_1.centerX,
  centerY: center_1.centerY,
  centerZ: center_1.centerZ,

  mirror: mirror_1$1.mirror,
  mirrorX: mirror_1$1.mirrorX,
  mirrorY: mirror_1$1.mirrorY,
  mirrorZ: mirror_1$1.mirrorZ,

  rotate: rotate_1$2.rotate,
  rotateX: rotate_1$2.rotateX,
  rotateY: rotate_1$2.rotateY,
  rotateZ: rotate_1$2.rotateZ,

  scale: scale_1$3.scale,
  scaleX: scale_1$3.scaleX,
  scaleY: scale_1$3.scaleY,
  scaleZ: scale_1$3.scaleZ,

  transform: transform_1$c,

  translate: translate_1$1.translate,
  translateX: translate_1$1.translateX,
  translateY: translate_1$1.translateY,
  translateZ: translate_1$1.translateZ
};

export const extra = {
  color: color$1,
  utils: utils$1
}

export const split = {
  lineSegmentByPlane: splitLineSegmentByPlane_1,
  polygonByPlane: splitPolygonByPlane_1,
}

export const bsp = {
  Tree: Tree$3,
  PolygonTreeNode: PolygonTreeNode_1,
  Node: Node_1
}