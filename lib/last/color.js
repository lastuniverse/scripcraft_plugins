/*
  set colors
*/
var colors = ['black', 'blue', 'darkgreen', 'darkaqua', 'darkred',
              'purple', 'gold', 'gray', 'darkgray', 'indigo',
              'brightgreen', 'aqua', 'red', 'pink',
              'yellow', 'white'];
var color_codes = {};
var COLOR_CHAR = '\u00a7';
for (var i =0;i < colors.length;i++) 
  color_codes[colors[i]] = i.toString(16);

exports.color = function( color,text ) {
  var result = COLOR_CHAR + color_codes[color] + text;
  return result;
};