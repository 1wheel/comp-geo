var w = 960; h = 500

var points = []

var drag = d3.behavior.drag().on('drag', function(d){
  d.x = clamp(0, d3.event.x, w)
  d.y = clamp(0, d3.event.y, h)
  render()
})


var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})


var path = svg.append('path').style({stroke: '#000', fill: '#ccc'})

svg.append('rect').attr({width: w, height: h, opacity: 0})
    .on('click', function(){
      points.push(P(d3.mouse(this)))
      render()
    })


function render(){
  var circles = svg.selectAll('circle').data(points)

  circles.enter().append('circle')
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

  intersections = linePairs.map(function(a, b){
    return intersection(a[0], a[1], b[0], b[1]) })


}







//copy(JSON.stringify(points))
points = [[385,269],[518,338],[562,158],[475,97],[164,187],[199,406],[416,445]].map(P)
render()