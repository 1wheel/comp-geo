var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 2;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})

var canvas = d3.select('#graph').html('')
  .append('canvas')
    .at({width, height}).node()

var ctx = canvas.getContext('2d')
ctx.fillStyle = '#0f0'

var lines = d3.range(50).map(function(d){
  return [
    [Math.random()*width, Math.random()*height],
    [Math.random()*width, Math.random()*height]]
})

var points = _.flatten(lines, true)
points.forEach(function(d){
  d.dx = Math.random()*1
  d.dy = Math.random()*1
})

var color = d3.scaleSequential(d3.interpolateRainbow)
  .domain([0, 80])






function render(){
  var intersections = allIntersections(lines)

  lines.forEach(function(d){ d.count = 0 })
  intersections.forEach(function(i){ i.lines[0].count++, i.lines[1].count++ })

  // color.domain([t])
  // ctx.fillStyle = 'rgba(0, 0, 0, .02)'
  // ctx.fillRect(0, 0, width, height)

  ctx.beginPath()
  lines.forEach(function(d){
    if (d.count < 10) return
    ctx.moveTo(d[0][0],    d[0][1])
    ctx.lineTo(d[1][0],    d[1][1])
  })
  ctx.strokeStyle = 'rgba(0,0,0,.2)'
  ctx.lineWidth = 1
  ctx.stroke()


  // ctx.clearRect(0, 0, width, height)
  intersections.forEach(function(i){  
    var s = (i.lines[0].count + i.lines[1].count)/40

    s = i.lines[0].count/30
    s = Math.max(i.lines[0].count, i.lines[1].count)/10

    ctx.beginPath()
    ctx.fillStyle = color(s*10)
    s = clamp(0, s, 1)
    if (s < 1) s = 1, ctx.fillStyle = '#000'
    ctx.moveTo(i[0] + s, i[1]);
    ctx.arc(i[0], i[1], s, 0, 2 * Math.PI);
    ctx.fill()
  })

}
render()

if (window.timer) timer.stop()
window.timer = d3.timer(function(t){
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

