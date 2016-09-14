var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 4, s = 50;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})


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
var rectSel = svg.append('rect')
  .datum([100, 200])
  .at({x: -s/2, y: -s/2, width: s, height: s})
  .call(drag)


function render(){
  strokeColor.domain([0, points.length])

  rectSel.translate(ƒ())
  circleSel.translate(ƒ())
  polygonSel.at('d', pathStr)

}
render()