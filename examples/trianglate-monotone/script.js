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

var color = d3.scaleOrdinal(d3.schemeCategory10);


function render(){
  var dcel = pointsToDCEL(points)
  var diag = trianglulateMonotone(dcel)

  circleSel.html('').appendMany(dcel.vertices, 'circle.point')
    .at({r})
    .call(drag)
    .call(d3.attachTooltip)
    .translate(ƒ('pos'))
    .st({fill: ƒ('pos', 'color')})
    .st({fill: function(d){ return d.isL ? 'red' : 'blue' }})

  polygonSel.at('d', pathStr)

  lineSel.html('')

  lineSel.selectAll('path').data(diag).enter().append('path')
    .at({d: d => pathStr(d.map(ƒ('pos'))), stroke: '#000', strokeWidth: 3})
}
render()


function trianglulateMonotone(dcel){
  var diag =[]

  var Q = _.sortBy(dcel.vertices, function(d){ return d.pos[1] - ε*d.pos[0] })
  var S = [Q[0], Q[1]]
  Q.forEach(function(v, i){
    v.isL = i ? isLeftV(v) : false
    if (i < 2) return

    if (v.isL !== _.last(Q).isL){
      var newS = [S[0], v]
      S.forEach((d, i) => i ? diag.push([v, d]) : 0)
      S = newS
    } else{

    }

  })

  return diag

  function getNextEdge(v){
    var ie = v.incidentEdge
    ie = ie.incidentFace.inner ? ie : ie.twin
    return ie.origin == v ? ie : ie.next
  }

  function isLeftV(v){
    var ne = getNextEdge(v)
    return ne.next.origin.pos[1] > v.pos[1]
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



