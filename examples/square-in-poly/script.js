var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 4, s = 35;

var drag = d3.drag()
  .on('drag', function(d){
    d[0] = Math.round(clamp(r, d3.event.x, width - r))
    d[1] = Math.round(clamp(r, d3.event.y, height - r))
    render()
  })
  .subject(function(d){ return {x: d[0], y: d[1]} })


var svg = d3.select('#graph').html('').append('svg')
    .at({width, height})

// svg.append('rect').at({width, height, fill: 'none'})
// svg.on('click', function(){
//   points.push([d3.event.x, d3.event.y])
//   render()
// })

//copy(JSON.stringify(points))
var points = [[320,316],[533,120],[309,236],[86,113],[194,241],[148,401],[465,340],[597,192]]

points.forEach(function(d, i){ d.i = i })
var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var lineSel = svg.append('g')
      
var circleSel = svg.append('g').appendMany(points, 'circle.point')
  .call(drag)
  .at({r})

var rectPos = [100, 200]
var n = 15 
var rectPoints = []
d3.range(n + 1).forEach(function(i){
  d3.range(n + 1).forEach(function(j){
    rectPoints.push([i/n*s - s/2, j/n*s - s/2])
  })
})
var rectSel = svg.append('g')
  .datum(rectPos)
  .call(drag)

var ns = s/n
rectSel.appendMany(rectPoints, 'rect')
  .at({x: -ns/2, y: -ns/2, width: ns, height: ns})
  .translate(ƒ())

function render(){
  rectPoints.forEach(function(d){
    d.pos = add(d, rectPos)
    d.isInside = d3.polygonContains(points, d.pos)
  })

  var isInside = rectPoints.every(ƒ('isInside'))
  var iDelta = [0, 0]
  if (!isInside){
    var insideRect = rectPoints.filter(ƒ('isInside'))
    if (insideRect.length){
      iDelta = [d3.sum(insideRect, ƒ(0)), d3.sum(insideRect, ƒ(1))]
    } else{
      var closestI = d3.scan(points, function(a, b){
        return dist(a, rectPos) - dist(b, rectPos)})
      iDelta = diff(points[closestI], rectPos)
    }

    iDelta = norm(iDelta)
  }

  rectSel.translate(ƒ())
    .selectAll('rect').at({fill: function(d){
      return d3.polygonContains(points, add(d, rectPos)) ? '#0ff' : '#f0f' } })

  circleSel.translate(ƒ())
  polygonSel.at('d', pathStr)

  rectPos[0] += iDelta[0]
  rectPos[1] += iDelta[1]
}
render()
if (window.renderTimer) window.renderTimer.stop()
window.renderTimer = d3.timer(render)

function add(a, b){ 
  return [a[0] + b[0], a[1] + b[1]]
}

function diff(a, b){
  return [a[0] - b[0], a[1] - b[1]]
}

function norm(a){
  var l = dist(a, [0, 0])
  return [a[0]/l, a[1]/l]
}

function dist(a, b){
  var dx = a[0] - b[0],
      dy = a[1] - b[1]

  return Math.sqrt(dx*dx + dy*dy)
}
