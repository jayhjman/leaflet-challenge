//
// Normalize value to a value between 0 and 1
//
function normalize(value, min, max) {
  var delta = max - min;
  return (value - min) / delta;
}

//
// Calculate Color based on percent
//
function perc2color(perc, min, max) {
  var base = max - min;

  if (base == 0) {
    perc = 100;
  } else {
    perc = ((perc - min) / base) * 100;
  }
  var r,
    g,
    b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
}
