var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 7;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})


var svg = d3.select('#graph').html('').append('svg')
    .at({width, height})

//copy(JSON.stringify(points))
var points = [[320,316],[533,120],[309,236],[86,113],[194,241],[164,349],[465,348],[597,192]]
var points = [[320,316],[533,120],[309,236],[354,115],[194,241],[164,349],[465,348],[597,192]]

var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var circleSel = svg.appendMany(points, 'circle.point')
    .at({r})
    .call(drag)

var triangleSel = svg.append('g')

var color = d3.scaleOrdinal(d3.schemeCategory10);

function render(){
  circleSel.translate(ƒ())

  polygonSel.at('d', pathStr)

  triangles = triangulateNaive(points.slice())

  triangleSel.html('').appendMany(triangles, 'path')
      .at({d: pathStr, stroke: 'black', fill: function(d, i){ return color(i) }, 'stroke-width': 3})
}
render()


function triangulateNaive(pts){
  var triangles = []

  while(pts.length > 6){
    var mI = d3.scan(pts, function(a, b){ return a[0] - b[0] })
    var lI = mod(mI - 1, pts.length)
    var rI = mod(mI + 1, pts.length)

    var triangle = [pts[lI], pts[mI], pts[rI]]
    var insideTriangle = pts.filter(function(d){
      return d3.polygonContains(triangle, d)
    })
    console.log(lI, mI, rI)

    // console.log(insideTriangle.length)
    if (insideTriangle.length) triangle[1] = insideTriangle[0]

    triangles.push(triangle)
    pts.splice(mI, 1)
  }

  return triangles
}