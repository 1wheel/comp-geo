var width = 960, height = 500, ε = 1e-9, ƒ = d3.f, r = 6;

var colors = ['#F44336', '#2196F3', '#4CAF50', '#9C27B0', '#777','#FF9800', '#795548', '#eded1c']

var drag = d3.drag().on('drag', function(d){
  d3.timerFlush() 
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

points.forEach(function(d, i){
  d.i = i 
  d.color = colors[i]
})
var polygonSel = svg.append('path')
    .datum(points)
    .at('fill-opacity', .1)

var lineSel = svg.append('g.ls')
var ieSel = svg.append('g.ie')

var circleSel = svg.append('g')
var textSel = svg.append('g')

var sweepPath = svg.append('path').at({d: 'M0,0h' + width, stroke: 'black', strokeDasharray: '2 3', pointerEvents: 'none'})

var color = d3.scaleOrdinal(d3.schemeCategory10);


function render(){
  var dcel = pointsToDCEL(points)
  var diag = toMonotone(dcel)

  circleSel.html('').appendMany(dcel.vertices, 'circle.point')
    .at({r})
    .call(drag)
    .call(d3.attachTooltip)
    .translate(ƒ('pos'))
    .st({fill: ƒ('pos', 'color')})

  textSel.html('').appendMany(dcel.vertices, 'text.point')
    .translate(ƒ('pos'))
    .text(ƒ('type'))
    .st('fill', function(d){ return d.type == 'merge' || d.type == 'split' ? '#c00' : '#000'})
    .at({textAnchor: 'middle', dy: -10})

  polygonSel.at('d', pathStr)

  lineSel.html('')

  sweepPath.attr('transform', 'translate(0,' + Q[0].pos[1] + ')')

  var i = 0
  if (window.animationInterval) window.animationInterval.stop()
  window.animationInterval = d3.interval(step, 3000)
  step()
  function step(){
    var d = Q[i]

    sweepPath.transition()
        .attr('transform', 'translate(0,' + d.pos[1] + ')')

    var updateSel = ieSel.selectAll('path')
      .data(d.st.T, ƒ('o'))

    ieSel.selectAll('path').transition()
      .attr('stroke', d => d.h.color)

    updateSel.enter().append('path')
      .at({d: d => pathStr([d.o, d.o]), stroke: d => d.h.color, strokeWidth: 3})
      .transition().delay(500).duration(500)
      .attr('d', d => pathStr([d.o, d.p]))

    updateSel.exit()
      .transition()
      .attr('stroke-width', 0)
      .remove()

    circleSel.selectAll('circle')
      .transition()
      .attr('r', function(e, j){ return e == d ? r*2 : r })

    lineSel.selectAll('path').data(d.st.diag).enter().append('path')
      .at({d: d => pathStr(d.map(ƒ('pos'))), stroke: '#fff', strokeWidth: 3})
    if (++i == Q.length) window.animationInterval.stop()
  }

}
render()



function toMonotone(dcel){
  addVertexType(dcel)
  var diag = []
  var curY, curI

  T = tree(function(d){ 
    return !d.origin ? d : lineXatY([d.origin.pos, d.next.origin.pos], curY) })
  Q = _.sortBy(dcel.vertices, function(d){ return d.pos[1] - ε*d.pos[0] })
  Q.forEach(function(v, i){
    curY = v.pos[1]
    curI = i

    //next, prev and left edge
    var ne = getNextEdge(v),
        pe = ne.prev,
        le = T.neighbors(v.pos[0])[0]

    if        (v.type == 'start'){
      ne.helper = v
      T.insert(ne)

    } else if (v.type == 'end'){
      if (pe.helper && pe.helper.type == 'merge') addDiag(v, pe.helper)
      T.remove(pe)

    } else if (v.type == 'split'){
      addDiag(v, le.helper)
      le.helper = v
      ne.helper = v
      T.insert(ne)

    } else if (v.type == 'merge'){
      if (pe.helper && pe.helper.type == 'merge') addDiag(v, pe.helper)
      T.remove(pe)
      le = T.neighbors(v.pos[0])[0]
      if (le.helper && le.helper.type == 'merge') addDiag(v, le.helper)
      le.helper = v
    
    } else if (v.type == 'regular'){
      if (ne.next.origin.pos[1] > v.pos[1]){
        if (pe.helper && pe.helper.type == 'merge') addDiag(v, pe.helper)
        T.remove(pe)
        T.insert(ne)
        ne.helper = v
      } else{
        if (le.helper && le.helper.type == 'merge') addDiag(v, le.helper)
        le.helper = v
      }
    }

    v.st = {T: T.map(function(d){ return {o: d.origin.pos, p: d.next.origin.pos, h: d.helper.pos}}), diag: diag.slice()}
  })

  return diag

  //find ei from vi
  function getNextEdge(v){
    var ie = v.incidentEdge
    ie = ie.incidentFace.inner ? ie : ie.twin
    return ie.origin == v ? ie : ie.next
  }

  function addDiag(a, b){
    diag.push([a, b])
  }

  function logIE(ie){
    var prefix = 'font-weight: bold; color: '
    console.log('%cF %cT', prefix + ie.origin.pos.color, prefix + ie.next.origin.pos.color)
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
}


function isLeft(a, b, c){
  var ax = a[0], ay = a[1],
      bx = b[0], by = b[1],
      cx = c[0], cy = c[1]

  return (b[0] - a[0])*(c[1] - a[1]) - (b[1] - a[1])*(c[0] - a[0]) > 0
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




// need to allow dupes now : /
function tree(key){
  key = key || function(d){ return d }
  var bisect = d3.bisector(function(d){ return key(d) }).left

  var array = []

  array.insert = function(d){
    var i = array.findIndex(d)
    var val = key(d)
    // if (array[i] && val == key(array[i])) return // don't add dupes
    array.splice(i, 0, d)
  }

  array.remove = function(d){
    var i = array.findIndex(d)
    array.splice(i, 1)
  }

  array.swap = function(a, b){
    var i = array.findIndex(a)
    var j = array.findIndex(b)
    array[i] = b
    array[j] = a
  }

  array.popSmallest = function(){
    return array.shift()
  }

  array.neighbors= function(d){
    var i = array.findIndex(d)
    return [array[i - 1], array[i + 1]]
  } 

  array.findIndex = function(d){ return bisect(array, key(d)) }

  array.key = key

  return array
}



