var w = 960; h = 500

var points = []

var drag = d3.behavior.drag().on('drag', function(d){
  d.x = clamp(0, d3.event.x, w)
  d.y = clamp(0, d3.event.y, h)
  render()
})


var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})

var path = svg.append('path.line').style({stroke: '#000', fill: '#ccc'})

svg.append('rect').attr({width: w, height: h, opacity: 0})







points = [[562,158],[475,97],[164,187],[300,35]].map(P)
render()




function pointsToPoly(points){
  var rv = points.map(clone)
  rv.forEach(function(d, i){
    d.prev = rv[mod(i - 1, rv.length)]
    d.next = rv[mod(i + 1, rv.length)]
  })
  return rv
}




function render(){
  var circles = svg.selectAll('circle.point').data(points)

  circles.enter().append('circle')
      .classed('point', true)
      .attr('r', 10)
      .call(drag)

  circles.translate(ƒ())
  circles.exit().remove()

  path.attr('d', 'M' + points.slice(0, 3).join('L') + 'Z')
      .style('fill', triangleContains.apply(null, points) ? '#FF0' : '#0FF')
}