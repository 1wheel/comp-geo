//creates new point 
function P(x, y, color){
  var rv
  if (x.map){
    rv = {x: x[0], y: x[1], color: 'black'}
  } else{
    rv = {x: x, y: y, color: color || 'black'}
  }
  rv.toString = function(){ return rv.x + ',' + rv.y }
  rv.type = 'point'
  return rv
}

function clone(d){
  if (d.type == 'point'){
    return P(d.x, d.y, d.color)
  }
}


//dist
function distP(a, b){
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + 
    Math.pow(a.y - b.y, 2))
}

//http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
//todo clean up
function distLine(a, b, p){
  function sqr(x) { return x * x }
  function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
  function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x),
                      y: v.y + t * (w.y - v.y) });
  }
  function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
  return distToSegment(p, a, b)
}

function calcAngle(a, b, c){
  var v1 = [b.x - a.x, b.y - a.y]
  var v2 = [c.x - b.x, c.y - b.y]
  
  var dot = v1[0]*v2[0] + v1[1]*v2[1]

  var ab = distP(a, b)
  var bc = distP(b, c)
  var ca = distP(c, a)

  return Math.acos((bc*bc + ab*ab - ca*ca)/(2*bc*ab))//*180/Math.PI
  // return Math.acos((bc*bc + ab*ab - ca*ca)/(2*bc*ab))*180/Math.PI
}


//intersection between lines connect points [a, b] and [c, d]
function intersection(a, b, c, d){
  var det = (a.x - b.x)*(c.y - d.y) 
          - (a.y - b.y)*(c.x - d.x),

  l = a.x*b.y - a.y*b.x,
  m = c.x*d.y - c.y*d.x,

  ix = (l*(c.x - d.x) - m*(a.x - b.x))/det,
  iy = (l*(c.y - d.y) - m*(a.y - b.y))/det,
  i = P(ix, iy)

  i.isOverlap = (ix == a.x && iy == a.y) || (ix == b.x && iy == b.y)

  i.isIntersection = !(a.x < ix ^ ix < b.x) 
                  && !(c.x < ix ^ ix < d.x)
                  && !i.isOverlap

  return i
}

function isLeft(a, b, c){
  return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x) > 0
}

//http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
function triangleContains(a, b, c, p){
  var b1 = isLeft(p, a, b)
  var b2 = isLeft(p, b, c)
  var b3 = isLeft(p, c, a)

  return (b1 == b2) && (b2 == b3)
}

function lineXatY(l, y){
  var a = l[0], b = l[1],
      m = (a.y - b.y)/(a.x - b.x)

  return (y - a.y + m*a.x)/m 
}


function toPathStr(d){ return 'M' + d.join('L') }

function negFn(d){ return !d }

function clamp(a,b,c){ return Math.max(a, Math.min(b, c)) }

function pairs(array){
  var rv = []
  array.forEach(function(d, i){
    for (var j = i + 1; j < array.length; j++) rv.push([d, array[j]])
  })

  return rv
}


function mod(n, m){ return ((n % m) + m) % m }




function tree(array){
  var key = function(d){ return d }
  var bisect = d3.bisector(function(d){ return key(d) }).left

  array.insert = function(d){
    var i = array.findIndex(d)
    var val = key(d)
    if (array[i] && val == key(array[i])) return // don't add dupes
    array.splice(i, 0, d)
  }

  array.remove = function(d){
    var index = array.indexOf(d.line)
    array.splice(array.findIndex(d), 1)
  }

  array.swap = function(i, j){

  }

  array.findIndex = function(d){ return bisect(array, key(d)) }

  array.key = function(_){
    key = _ 
    return array
  }

  array.order = function(){
    array.sort(d3.ascendingKey(key))
    return array
  }

  return array
}