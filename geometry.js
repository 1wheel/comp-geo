function dist(a, b){
  var dx = a[0] - b[0],
      dy = a[1] - b[1]

  return Math.sqrt(dx*dx + dy*dy)
}


//distance from a point to a line 
//https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
function distPointToLine(p, l){
  var x0 = p[0],    y0 = p[1], 
      x1 = l[0][0], y1 = l[0][1], 
      x2 = l[1][0], y2 = l[1][1]

  return Math.abs(
        (y2 - y1)*x0 
      - (x2 - x1)*y0 
      +  x2*y1 - y2*x1
    )/dist(l[0], l[1])
}


function pathStr(d){ return 'M' + d.join('L') }

function clamp(a,b,c){ return Math.max(a, Math.min(b, c)) }

function mod(n, m){
  return ((n % m) + m) % m 
}

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
  var ax = l[0][0], ay = l[0][1],
      bx = l[1][0], by = l[1][1],

      m = (ay - by)/(ax - bx)

  return ax == bx ? ax : (y - ay + m*ax)/m 
}

function allIntersections(lines){
  var eventQueue = tree(function(d){ return d.p[1] + ε*d.p[0] })
  lines.forEach(function(d){
    var isSorted = d[0][1] - d[1][1] || d[0][0] - d[1][0]
    var p0 = isSorted < 0 ? d[0] : d[1]
    var p1 = isSorted < 0 ? d[1] : d[0]

    eventQueue.insert({
      p: p0,
      type: 'insert',
      line: d
    })

    eventQueue.insert({
      p: p1,
      type: 'remove',
      line: d
    })
  })

  var curEvent;
  var curY;
  var intersections = []
  var segmentOrder = tree(function(d){ return lineXatY(d, curY) })

  var i = 0
  for (; curEvent = eventQueue.popSmallest(); curEvent && i++ < 10){
    curY = curEvent.p[1] - .5*ε

    if (curEvent.type == 'insert'){
      segmentOrder.insert(curEvent.line)

      segmentOrder.neighbors(curEvent.line).forEach(function(d){
        checkForIntersection(curEvent.line, d)
      }) 
    }

    if (curEvent.type == 'remove'){
      checkForIntersection.apply(null, segmentOrder.neighbors(curEvent.line))

      segmentOrder.remove(curEvent.line)
    }

    if (curEvent.type == 'intersect'){
      segmentOrder.swap(curEvent.p.lines[0], curEvent.p.lines[1])

      curY += ε
      segmentOrder.neighbors(curEvent.p.lines[0]).forEach(function(d){
        if (d == curEvent.p.lines[1]) return
        checkForIntersection(curEvent.p.lines[0], d)
      }) 
      segmentOrder.neighbors(curEvent.p.lines[1]).forEach(function(d){
        if (d == curEvent.p.lines[0]) return
        checkForIntersection(curEvent.p.lines[1], d)
      }) 
    }


  }

  function checkForIntersection(a, b){
    if (!a || !b) return

    var i = intersection(a, b)
    if (!i.isIntersection || i[1] < curY) return
    i.lines = [a, b]

    eventQueue.insert({
      p: i,
      line: a,
      type: 'intersect',
    })

    intersections.push(i)
  }

  return intersections
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




