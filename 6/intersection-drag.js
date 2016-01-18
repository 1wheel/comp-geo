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
    .on('click', function(){
      points.push(P(d3.mouse(this)))
      render()
    })


function render(){
  var circles = svg.selectAll('circle.point').data(points)

  circles.enter().append('circle')
      .classed('point', true)
      .attr('r', 10)
      .call(drag)
      .on('contextmenu', function(d){
        d3.event.preventDefault()
        points = points.filter(function(e){ return d != e })
        render()
      })

  circles.translate(ƒ())

  circles.exit().remove()

  path.attr('d', 'M' + points.join('L') + 'Z')

  lines = []
  points.forEach(function(d, i){
    lines.push([d, points[(i + 1) % points.length]])
  })

  linePairs = pairs(lines)

  intersections = linePairs.map(function(d){
    return intersection(d[0][0], d[0][1], d[1][0], d[1][1]) })


  d3.selectAll('.pairpath').remove()
  svg.dataAppend(linePairs, 'path.pairpath')
      .attr('d', function(d, i){
        return ['M', d[0], 'L', intersections[i], 'L', d[1]].join(' ') 
      })

  d3.selectAll('.intersection').remove()
  svg.dataAppend(intersections, 'circle.intersection')
      .translate(ƒ())
      .style('fill', function(d){ return d.isIntersection ? 'red' : 'grey' })
      .attr('r', 3)


}







//copy(JSON.stringify(points))
points = [[385,269],[518,338],[562,158],[475,97],[164,187],[199,406],[416,445]].map(P)
render()