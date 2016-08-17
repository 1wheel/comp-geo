var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 6;

var drag = d3.drag().on('drag', function(d){
  d[0] = Math.round(clamp(r, d3.event.x, width - r))
  d[1] = Math.round(clamp(r, d3.event.y, height - r))
  render()
})

var svg = d3.select('#graph').html('').append('svg').at({width, height})
svg.append('rect').at({width, height, fill: 'none'})
svg.on('click', function(){
  // points.push([d3.event.x, d3.event.y])
  render()
})

//copy(JSON.stringify(points))
var points = [[810,244],[707,30],[467,248],[183,49],[59,270],[148,436],[392,356],[702,409]]

points.forEach(function(d, i){ d.i = i })
var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var lineSel = svg.append('g')

var heSel = svg.append('g')
var mSel = svg.append('g')

var circleSel = svg.append('g')

var color = d3.scaleOrdinal(d3.schemeCategory10);

function render(){
  circleSel.html('').appendMany(points, 'circle.point')
      .at({r, fillOpacity: 1, stroke: '#555'})
      .call(drag)
      .call(d3.attachTooltip)
      .translate(ƒ())


  polygonSel.at('d', pathStr)

  dcel = pointsToDCEL(points)

  heSel.html('').appendMany(dcel.halfEdges, 'path')
      .at({d: linkArc, fill: 'none', stroke: '#000'})
      .on('mouseover', function(d){
        heSel.selectAll('path').classed('active', function(e){ return e == d })
        heSel.selectAll('path').classed('next', function(e){ return e == d.next })
        heSel.selectAll('path').classed('prev', function(e){ return e == d.prev })
        heSel.selectAll('path').classed('twin', function(e){ return e == d.twin })
        circleSel.selectAll('circle').classed('origin', function(e){ return e == d.origin.pos })
      })
  mSel.html('').appendMany(dcel.halfEdges, 'path')
      .at({d: linkArc, markerMid: 'url(#arrow)', fill: 'none', pointerEvents: 'none'})
      .st({strokeWidth: 1.5})



}
render()


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




function linkArc(d) {
  var dx = d.next.origin.pos[0] - d.origin.pos[0],
      dy = d.next.origin.pos[1] - d.origin.pos[1],
      dr = Math.sqrt(dx * dx + dy * dy);
  return 'M' + d.origin.pos[0] + ',' + d.origin.pos[1] + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.next.origin.pos[0] + ',' + d.next.origin.pos[1];
}

svg.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '-10 -10 20 20')
    .attr('markerWidth', 20)
    .attr('markerHeight', 20)
    .attr('orient', 'auto')
  .append('path')
    .attr('d', 'M-6.75,-6.75 L 0,0 L -6.75,6.75')
