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
var points = [[320,316],[533,120],[309,236],[354,115],[132,241],[164,349],[465,348],[597,192]]

points.forEach(function(d, i){ d.i = i })
var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var lineSel = svg.append('g')

var circleSel = svg.appendMany(points, 'circle.point')
    .at({r})
    .call(drag)
    .call(d3.attachTooltip)


var color = d3.scaleOrdinal(d3.schemeCategory10);

function render(){
  circleSel.translate(ƒ())

  polygonSel.at('d', pathStr)

  lines = triangulateNaive(points.slice(), 1).filter(function(d){ return d.join })

  lineSel.html('').appendMany(lines, 'path')
      .at({d: pathStr, stroke: 'black', strokeWidth: 3, fillOpacity: .4})
}
render()


function triangulateNaive(pts, k){

  var mI = d3.scan(pts, function(a, b){ return a[0] - b[0] })
  var lI = mod(mI - 1, pts.length)
  var rI = mod(mI + 1, pts.length)
  if (k > 10){
    return [[]];
  }

  var triangle = [pts[lI], pts[mI], pts[rI]]
  var insideTriangle = pts.filter(function(d, i){
    return d3.polygonContains(triangle, d) && i != lI && i != mI && i != rI
  })

  if (insideTriangle.length){
    var minTriangle = d3.scan(insideTriangle, function(a, b){
      // console.log(distPointToLine(d, [pts[lI], pts[rI]]))
      return  distPointToLine(a, [pts[lI], pts[rI]]) 
            - distPointToLine(b, [pts[lI], pts[rI]])
    })  


    console.log(minTriangle)

    lI = mI
    rI = pts.indexOf(triangle[minTriangle])
    rI = pts.indexOf(triangle[0])
  } 

  var lines = [[pts[lI], pts[rI]]] 
  var poly0 = [pts[lI]]
  var i = lI
  var j = 0
  while (i != rI && j++ < 10){
    i = mod(i + 1, pts.length)
    poly0.push(pts[i])
  }

  var poly1 = [pts[lI]]
  var i = lI
  var j = 0
  while (i != rI && j++ < 10){
    i = mod(i - 1, pts.length)
    poly1.push(pts[i])
  }

  console.log(poly0.length, poly1.length)
  // console.log(lI, rI)
  lines = poly0.length > 3 ? lines.concat(triangulateNaive(poly0, k + 1)) : lines
  lines = poly1.length > 3 ? lines.concat(triangulateNaive(poly1, k + 1)) : lines

  return lines
}



