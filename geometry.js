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


function pathStr(d){ return 'M' + d.join('L') }

function clamp(a,b,c){ return Math.max(a, Math.min(b, c)) }


//intersection between lines connecting points [a, b] and [c, d]
function intersection(l0, l1){
  var ax = l0[0][0], ay = l0[0][1],
      bx = l0[1][0], by = l0[1][1],
      cx = l1[0][0], cy = l1[0][1],
      dx = l1[1][0], dy = l1[1][1],

      det = (ax - bx)*(cy - dy) 
          - (ay - by)*(cx - dx),

      l = ax*by - ay*bx,
      m = cx*dy - cy*dx,

      ix = (l*(cx - dx) - m*(ax - bx))/det,
      iy = (l*(cy - dy) - m*(ay - by))/det,
      i = [ix, iy]

  i.isOverlap = (ix == ax && iy == ay) || (ix == bx && iy == by)

  i.isIntersection = !(ax < ix ^ ix < bx) 
                  && !(cx < ix ^ ix < dx)
                  && !i.isOverlap
                  && det

  return i
}


function lineXatY(l, y){
  var a = l[0], b = l[1],
      m = (a.y - b.y)/(a.x - b.x)

  return (y - a.y + m*a.x)/m 
}




function tree(key){
  key = key || function(d){ return d }
  var bisect = d3.bisector(function(d){ return key(d) }).left

  var array = []

  array.insert = function(d){
    var i = array.findIndex(d)
    var val = key(d)
    if (array[i] && val == key(array[i])) return // don't add dupes
    array.splice(i, 0, d)
  }

  array.remove = function(d){
    var i = array.findIndex(d)
    array.splice(i, 1)
  }

  array.swap = function(a, b){
    var i = array.findIndex(a)
    var j = array.findIndex(b)
    array[i] = b
    array[j] = a
  }

  array.popSmallest = function(){
    return array.shift()
  }

  array.neighbors= function(d){
    var i = array.findIndex(d)
    return [array[i - 1], array[i + 1]]
  } 

  array.findIndex = function(d){ return bisect(array, key(d)) }

  return array
}
