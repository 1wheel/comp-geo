var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 2;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})


var svg = d3.select('#graph').append('svg')
    .at({width, height})

var lines = d3.range(100).map(function(d){
  return [
    [Math.random()*width, Math.random()*height],
    [Math.random()*width, Math.random()*height]]
})

var points = _.flatten(lines, true)
points.forEach(function(d){
  d.dx = Math.random()*3
  d.dy = Math.random()*3
})

var lineSel = svg.appendMany(lines, 'path.line')
    .st({stroke: ƒ('color')})
    
var circleSel = svg.appendMany(points, 'circle.point')
    .at({r})
    .call(drag)

var intersectionSel = svg.appendMany([], 'circle.intersection')

function render(){
  lineSel.at('d', pathStr)
  circleSel.translate(ƒ())

  var intersections = allIntersections(lines)
  
  // d3.selectAll('.intersection').remove()
  // svg.appendMany(intersections, 'circle.intersection')
  //     .at({fill: 'none', r: r/2, 'stroke-width': 2, stroke: '#0f0'})
  //     .translate(ƒ())

  intersectionSel = svg.selectAll('.intersection').data(intersections)
  intersectionSel.enter().append('circle.intersection')
      .at({fill: 'none', r: r/2, 'stroke-width': 2, stroke: '#0f0'})
    .merge(intersectionSel)
      .translate(ƒ())
      .at({stroke: 'yellow'})
  intersectionSel.exit().remove()
}
render()

d3.timer(function(){
  // return
  points.forEach(function(d){
    d[0] += d.dx
    d[1] += d.dy
    if (d[0] < 0 && d.dx < 0 || d[0] > width  && d.dx > 0) d.dx = -d.dx
    if (d[1] < 0 && d.dy < 0 || d[1] > height && d.dy > 0) d.dy = -d.dy
  })

  render()
})

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

      // segmentOrder.swap(curEvent.p.lines[0], curEvent.p.lines[1])
      // segmentOrder.remove(curEvent.p.lines[0])
      // segmentOrder.remove(curEvent.p.lines[1])
      // curY += ε
      // segmentOrder.insert(curEvent.p.lines[0])
      // segmentOrder.insert(curEvent.p.lines[1])

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
    // if (a == b) debugger

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




var t = tree()

t.insert(10)
t.insert(12)

