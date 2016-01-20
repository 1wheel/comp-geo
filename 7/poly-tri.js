var w = 960; h = 500

var points = []

var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})

var path = svg.append('path.line').style({stroke: '#000', fill: '#ccc'})

svg.append('rect').attr({width: w, height: h, opacity: 0})







points =  [[454,239],[630,126],[164,187],[266,459],[611,341],[488,318],[388,336],[287,324]].map(P)
initDraw()

trianglulate(points)


function pointsToPoly(points){
  var rv = points.map(clone)
  rv.forEach(function(d, i){
    d.prev = rv[mod(i - 1, rv.length)]
    d.next = rv[mod(i + 1, rv.length)]
  })
  return rv
}

function trianglulate(points){
  if (points.length < 4) return
  console.log(points.length)

  var poly = pointsToPoly(points)

  var leftMost = _.min(poly, ƒ('x'))

  //points to draw line between
  var u = leftMost.prev
  var v = leftMost.next

  var pointsInside = poly.filter(function(d){
    return triangleContains(leftMost, leftMost.prev, leftMost.next, d) })
  if (pointsInside.length){
    var u = leftMost
    var v = _.max(pointsInside, function(d){
      return distLine(leftMost.prev, leftMost.next, d) })
  }

  svg.append('path').attr('d', 'M' + v + 'L' + u).style({stroke: '#f0f', fill: 'none'})

  var points2 = [u]
  var nextPoint = u
  while (nextPoint != v){
    nextPoint = nextPoint.next
    points2.push(nextPoint)
  }
  var points3 = [v]
  while (nextPoint != u){
    nextPoint = nextPoint.next
    points3.push(nextPoint)
  }

  if (!pointsInside.length) debugger


  trianglulate(points2)
  trianglulate(points3)

}




function initDraw(){
  var circles = svg.selectAll('circle.point').data(points)

  circles.enter().append('circle')
      .classed('point', true)
      .attr('r', 10)
  circles.translate(ƒ())
  circles.exit().remove()

  path.attr('d', 'M' + points.join('L') + 'Z')

  lines = []
  points.forEach(function(d, i){
    lines.push([d, points[(i + 1) % points.length]])
  })
}