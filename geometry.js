// Returns the 2D cross product of AB and AC vectors, i.e., the z-component of
// the 3D cross product in a quadrant I Cartesian coordinate system (+x is
// right, +y is up). Returns a positive value if ABC is counter-clockwise,
// negative if clockwise, and zero if the points are collinear.
function cross(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}


function dist(a, b){
  var dx = a[0] - b[0],
      dy = a[1] - b[1]

  return Math.sqrt(dx*dx + dy*dy)
}


function toPathStr(d){ return 'M' + d.join('L') }
