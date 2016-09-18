var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 8;

var drag = d3.drag().on('drag', function(d){
  d.pos[0] = Math.round(clamp(r, d3.event.x, width - r))
  d.pos[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})


var svg = d3.select('#graph').html('').append('svg')
    .at({width, height})

svg.append('rect').at({width, height, fill: 'none'})

svg.on('click', function(){
  // points.push([d3.event.x, d3.event.y])
  render()
})

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
  toMonotone(dcel)
  addVertexType(dcel)

  strokeColor.domain([0, points.length])

  circleSel.html('').appendMany(dcel.vertices, 'circle.point')
      .at({r})
      .call(drag)
      .call(d3.attachTooltip)
      .translate(ƒ('pos'))
      .st('fill', function(d){ return d.type == 'merge' || d.type == 'split' ? '#c00' : '#000'})
      .st('fill', function(d){ return d.isLeftPoint ? '#00f' : '#0ff' })
    //   .at({stroke: ƒ('i', strokeColor), strokeWidth: 1})
    // .transition().duration(1000).delay(d => 1000*d.i)
    //   .attr('stroke-width', 10)
    // .transition()
    //   .attr('stroke-width', 0)

  textSel.html('').appendMany(dcel.vertices, 'text.point')
      .translate(ƒ('pos'))
      .text(ƒ('type'))
      .at({textAnchor: 'middle', dy: -10})


  polygonSel.at('d', pathStr)

}
render()



function toMonotone(dcel){
  var queue = _.sortBy(dcel.vertices, function(d){ return d.pos[1] + ε*d.pos[0] })

  queue.forEach((d, i) => d.i = i)

  
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
    d.isLeftPoint = isLeftPoint
    if (p.i == 2){
      console.log(isLeftPoint, lP.i, p.i, rP.i)
    }

    if (isAboveL && isAboveR){
      d.type =  !isLeftPoint ? 'start' : 'split'
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

  var v0 = [ax - bx, ay - by]
  var v1 = [cx - bx, cy - by]

  var dot = v0[0]*v1[0] + v0[1]*v1[1]
  var mag = dist(v0, [0,0])*dist(v1, [0,0])


  var rv0 = (bx - ax)*(cy - ay) - (by - ay)*(cx - ax) > 0
  var rv1 = Math.acos(dot/mag) < Math.PI/4
  return rv1

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




