var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 4;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})


var svg = d3.select('#graph').html('').append('svg')
    .at({width, height})

svg.append('rect').at({width, height, fill: 'none'})

svg.on('click', function(){
  points.push([d3.event.x, d3.event.y])
  render()
})

//copy(JSON.stringify(points))
var points = [[320,316],[533,120],[309,236],[86,113],[194,241],[148,401],[465,340],[597,192]]

points.forEach(function(d, i){ d.i = i })
var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var lineSel = svg.append('g')

var circleSel = svg.append('g')
var textSel = svg.append('g')

var color = d3.scaleOrdinal(d3.schemeCategory10);

function render(){
  addVertexType(points)

  circleSel.html('').appendMany(points, 'circle.point')
      .at({r})
      .call(drag)
      .call(d3.attachTooltip)
      .translate(ƒ())
      .st('fill', function(d){ return d.type == 'merge' || d.type == 'split' ? '#c00' : '#000'})

  textSel.html('').appendMany(points, 'text.point')
      .translate(ƒ())
      .text(ƒ('type'))
      .at({textAnchor: 'middle', dy: -10})


  polygonSel.at('d', pathStr)

}
render()




function addVertexType(pts){
  pts.forEach(function(d, i){
    var lP = pts[mod(i - 1, pts.length)]
    var rP = pts[mod(i + 1, pts.length)]

    var isAboveL = d[1] < lP[1] || (d[1] == lP[1] && d[0] < lP[0])
    var isAboveR = d[1] < rP[1] || (d[1] == rP[1] && d[0] < rP[0])
    var isLeftPoint = isLeft(lP, d, rP)

    if (isAboveL && isAboveR){
      d.type = !isLeftPoint ? 'start' : 'split'
    } else if (!isAboveL && !isAboveR){
      d.type = !isLeftPoint ? 'end' : 'merge'
    } else {
      d.type = 'regular'
    }
  })

}

function isLeft(a, b, c){
  var ax = a[0], ay = a[1],
      bx = b[0], by = a[1],
      cx = c[0], cy = c[1]

  return (bx - ax)*(cy - ay) - (by - ay)*(cx - ax) > 0
}



