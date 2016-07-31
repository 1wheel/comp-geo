var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 10;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})


var svg = d3.select('#graph').append('svg')
    .at({width, height})

//copy(JSON.stringify(lines, null, 0))
// var lines = [[[163,378],[398,198]],[[354,439],[551,72]]]
var lines = [[[163,378],[650,134]],[[354,439],[551,72]]]
var lines = [[[704,183],[108,110]],[[163,303],[553,381]],[[354,439],[542,69]],[[224,206],[446,38]]]
var lines = [[[163,378],[576,244]],[[354,439],[551,72]],[[386,132],[522,26]]]
var lines = [[[318,399],[585,221]],[[394,454],[527,106]],[[620,479],[365,106]]]
;['steelblue', 'yellow', 'pink'].forEach(function(d, i){
  if (lines[i]) lines[i].color = d
})

var lineSel = svg.appendMany(lines, 'path.line')
    .st({stroke: ƒ('color')})
    
var circleSel = svg.appendMany(_.flatten(lines, true), 'circle.point')
    .at({r})
    .call(drag)

function render(){
  lineSel.at('d', pathStr)
  circleSel.translate(ƒ())

  var intersections = allIntersections(lines)
  d3.selectAll('.intersection').remove()
  svg.appendMany(intersections, 'circle.intersection')
      .at({fill: 'none', r: r/2, 'stroke-width': 2, stroke: '#0f0'})
      .translate(ƒ())
}
render()

function allIntersections(lines){
  console.log('STARTING CALC')

  function ySlant(d){ return d.p[1] + ε*d.p[0] }
  var eventQueue = tree(ySlant)
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
    console.log(curEvent.type, segmentOrder.map(ƒ('color')))

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

    console.log(curEvent.line.color, segmentOrder.map(ƒ('color')))
    console.log('\n')

  }

  function checkForIntersection(a, b){
    if (!a || !b) return
    // console.log(a.color, b.color)
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

