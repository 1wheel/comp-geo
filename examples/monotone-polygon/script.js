var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 4;

var drag = d3.drag().on('drag', function(d){
  d.pos[0] = Math.round(clamp(r, d3.event.x, width - r))
  d.pos[1] = Math.round(clamp(r, d3.event.y, height - r))
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

var strokeColor = d3.scaleLinear().range(['#00f', '#0f0'])

function render(){
  dcel = pointsToDCEL(points)
  addVertexType(dcel)
  yOrder(dcel)

  strokeColor.domain([0, points.length])

  circleSel.html('').appendMany(dcel.vertices, 'circle.point')
      .at({r})
      .call(drag)
      .call(d3.attachTooltip)
      .translate(ƒ('pos'))
      .st('fill', function(d){ return d.type == 'merge' || d.type == 'split' ? '#c00' : '#000'})
      .at({stroke: ƒ('i', strokeColor), strokeWidth: 3})

  textSel.html('').appendMany(dcel.vertices, 'text.point')
      .translate(ƒ('pos'))
      .text(ƒ('type'))
      .at({textAnchor: 'middle', dy: -10})


  polygonSel.at('d', pathStr)

}
render()



function yOrder(dcel){
  _.sortBy(dcel.vertices, function(d){ return d.pos[1] + ε*d.pos[0] })
    .forEach((d, i) => d.i = i)
}


function addVertexType(dcel){
  var pts = dcel.vertices
  pts.forEach(function(d, i){
    var lP = pts[mod(i - 1, pts.length)].pos
    var rP = pts[mod(i + 1, pts.length)].pos
    var p = d.pos

    var isAboveL = p[1] < lP[1] || (p[1] == lP[1] && p[0] < lP[0])
    var isAboveR = p[1] < rP[1] || (p[1] == rP[1] && p[0] < rP[0])
    var isLeftPoint = isLeft(lP, p, rP)

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


function pointsToDCEL(pts){
  var vertices = pts.map(function(d){ return {pos: d} })
  var faces = [
    {outer: null, inner: null},
    {outer: null, inner: null}
  ]

  var innerHE = vertices.map(function(d, i){
    return {
      origin: d,
      incidentFace: faces[0],
    }
  })
  faces[0].inner = innerHE[0]
  innerHE.forEach(function(d, i){
    d.origin.incidentEdge = d
    d.next = innerHE[mod(i + 1, pts.length)]
    d.prev = innerHE[mod(i - 1, pts.length)]
  })

  var outerHE = vertices.map(function(d, i){
    return {
      origin: d,
      incidentFace: faces[1],
    }
  })
  faces[1].outer = outerHE[0]
  outerHE.forEach(function(d, i){
    d.origin.incidentEdge = d
    d.next = outerHE[mod(i - 1, pts.length)]
    d.prev = outerHE[mod(i + 1, pts.length)]

    d.twin = innerHE[mod(i - 1, pts.length)]
    innerHE[mod(i - 1, pts.length)].twin = d
  })

  var halfEdges = innerHE.concat(outerHE)

  return {vertices, halfEdges, faces}
}




