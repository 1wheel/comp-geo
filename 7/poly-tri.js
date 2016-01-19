var w = 960; h = 500

var points = []

var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})

var path = svg.append('path.line').style({stroke: '#000', fill: '#ccc'})

svg.append('rect').attr({width: w, height: h, opacity: 0})







points =  [[454,239],[630,126],[164,187],[266,459],[611,341],[488,318],[388,336],[287,324]].map(P)
initDraw()




function pointsToPoly(points){
  var rv = points.map(clone)
  rv.forEach(function(d, i){
    d.prev = rv[mod(i - 1, rv.length)]
    d.next = rv[mod(i + 1, rv.length)]
  })
  return rv
}

function trianglulate(points){
  if (points.length == 3) return

  var poly = pointsToPoly(points)

  var leftMost = _.min(poly, ƒ('x'))

  
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