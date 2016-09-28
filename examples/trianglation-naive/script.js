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
var points = [[320,316],[533,120],[309,236],[86,113],[194,241],[164,349],[465,348],[597,192]]
var points = [[604,17],[516,59],[287,52],[147,72],[132,241],[131,464],[463,477],[675,422],[759,303],[854,193],[841,114],[774,72],[691,35],[660,56],[717,125],[738,225],[685,323],[633,331],[592,407],[519,427],[426,431],[337,435],[257,421],[208,372],[303,337],[412,370],[521,361],[572,333],[637,287],[671,254],[606,248],[399,274],[504,300],[361,325],[299,298],[166,287],[194,192],[296,212],[506,212],[631,193],[644,138],[545,138],[343,165],[289,117],[482,110],[576,97]]

points.forEach(function(d, i){ d.i = i })
var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var overlaySel = svg.append('g')
var lineSel = svg.append('g')

var circleSel = svg.append('g')

var color = d3.scaleOrdinal(d3.schemeCategory10);

function render(){
  circleSel.html('').appendMany(points, 'circle.point')
      .at({r})
      .call(drag)
      .call(d3.attachTooltip)
      .translate(ƒ())

  polygonSel.at('d', pathStr)

  lines = triangulateNaiveDraw(points.slice(), 1)
  lines.forEach(function(d, i){ d.i = i, d.poly0.i = i, d.poly1.i = i })

  var delay = 300

  lineSel.html('')
  lineSel.appendMany(lines, 'path.fill')
      .at({stroke: '#f0f', fill: '#f0f', strokeWidth: 2, fillOpacity: .4, opacity: 0})
      .at('d', ƒ('pts', pathStr))
    .transition().delay(function(d, i){ return i*delay + 100 }).duration(100)
      .attr('opacity', 1)
    .transition().duration(1000).delay(delay/2)
      .attr('stroke-width', 0)
      .attr('opacity', 0)
  lineSel.appendMany(lines, 'path.connection')
      .at({stroke: '#fff', strokeWidth: 3})
      .at('d', function(d){ return 'M' + d.line[0] + 'L' + d.line[0] })
    .transition().delay(function(d, i){ return i*delay + 100 })
      .attr('d', ƒ('line', pathStr, d => d + 'Z'))

  overlaySel.html('')
  overlaySel.appendMany(lines.map(ƒ('poly0')).filter(d => d.length == 3), 'path')
      .attr('d', pathStr)
      .attr('opacity', 0)
    .transition().delay(function(d, i){ return (d.i)*delay + 400 }).duration(200)
      .attr('opacity', 1)
  overlaySel.appendMany(lines.map(ƒ('poly1')).filter(d => d.length == 3), 'path')
      .attr('d', pathStr)
      .attr('opacity', 0)
    .transition().delay(function(d, i){ return (d.i)*delay + 400 }).duration(200)
      .attr('opacity', 1)


}
render()


function triangulateNaiveDraw(pts, k){

  var mI = d3.scan(pts, function(a, b){ return a[0] - b[0] })
  var lI = mod(mI - 1, pts.length)
  var rI = mod(mI + 1, pts.length)
  // if (k > 10){ return [[]]; }

  var triangle = [pts[lI], pts[mI], pts[rI]]
  var insideTriangle = pts.filter(function(d, i){
    return d3.polygonContains(triangle, d) && i != lI && i != mI && i != rI
  })

  if (insideTriangle.length){
    var minTriangle = d3.scan(insideTriangle, function(a, b){
      return  distPointToLine(a, [pts[lI], pts[rI]]) 
            - distPointToLine(b, [pts[lI], pts[rI]])
    })  

    lI = mI
    rI = pts.indexOf(insideTriangle[minTriangle])
  } 

  var poly0 = [pts[lI]]
  var i = lI
  while (i != rI){
    i = mod(i + 1, pts.length)
    poly0.push(pts[i])
  }

  var poly1 = [pts[lI]]
  var i = lI
  while (i != rI){
    i = mod(i - 1, pts.length)
    poly1.push(pts[i])
  }

  var lines = [{line: [pts[lI], pts[rI]], pts, poly0, poly1}]
  lines = poly0.length > 3 ? lines.concat(triangulateNaiveDraw(poly0, k + 1)) : lines
  lines = poly1.length > 3 ? lines.concat(triangulateNaiveDraw(poly1, k + 1)) : lines


  return lines
}




function triangulateNaive(pts, k){

  var mI = d3.scan(pts, function(a, b){ return a[0] - b[0] })
  var lI = mod(mI - 1, pts.length)
  var rI = mod(mI + 1, pts.length)
  if (k > 10){ return [[]]; }

  var triangle = [pts[lI], pts[mI], pts[rI]]
  var insideTriangle = pts.filter(function(d, i){
    return d3.polygonContains(triangle, d) && i != lI && i != mI && i != rI
  })

  if (insideTriangle.length){
    var minTriangle = d3.scan(insideTriangle, function(a, b){
      return  distPointToLine(a, [pts[lI], pts[rI]]) 
            - distPointToLine(b, [pts[lI], pts[rI]])
    })  

    lI = mI
    rI = pts.indexOf(insideTriangle[minTriangle])
  } 

  var lines = [[pts[lI], pts[rI]]] 
  var poly0 = [pts[lI]]
  var i = lI
  while (i != rI){
    i = mod(i + 1, pts.length)
    poly0.push(pts[i])
  }

  var poly1 = [pts[lI]]
  var i = lI
  while (i != rI){
    i = mod(i - 1, pts.length)
    poly1.push(pts[i])
  }

  lines = poly0.length > 3 ? lines.concat(triangulateNaive(poly0, k + 1)) : lines
  lines = poly1.length > 3 ? lines.concat(triangulateNaive(poly1, k + 1)) : lines

  return lines
}



