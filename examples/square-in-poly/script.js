var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 4, s = 25;

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
var n = 5 
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
  strokeColor.domain([0, points.length])

  var isInside = d3.polygonContains(points, rectPos)

  rectSel.translate(ƒ())
    .selectAll('rect').at({fill: function(d){
      return d3.polygonContains(points, add(d, rectPos)) ? '#0ff' : '#f0f' } })

  circleSel.translate(ƒ())
  polygonSel.at('d', pathStr)

}
render()


function add(a, b){ 
  return [a[0] + b[0], a[1] + b[1]]
}