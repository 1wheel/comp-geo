var w = 960; h = 500
var points = []
var drag = d3.behavior.drag().on('drag', function(d){
  d.x = clamp(0, d3.event.x, w)
  d.y = clamp(0, d3.event.y, h)
  render()
})

var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})

var path = svg.append('path.line').style({stroke: '#000', fill: '#ccc'})

svg.append('rect').attr({width: w, height: h, opacity: 0})
    .on('click', function(){
      points.push(P(d3.mouse(this)))
      render()
    })






points =  [[454,239],[630,126],[164,187],[266,459],[611,341],[488,318],[388,336],[287,324]].map(P)
points = [[80,284],[265,237],[737,329],[468,67],[324,188],[202,93],[66,156]].map(P)
var points = [[320,316],[323,154],[315,56],[86,113],[69,247],[148,401],[890,353],[597,192]].map(P)

render()


function pointsToPoly(points){
  points.forEach(function(d, i){
    d.prev = points[mod(i - 1, points.length)]
    d.next = points[mod(i + 1, points.length)]
  })
}

function addLabels(points){
  points.forEach(function(d){
    var abovePrev = d.y < d.prev.y || (d.y == d.prev.y && d.x < d.prev.x)
    var aboveNext = d.y < d.next.y || (d.y == d.next.y && d.x < d.next.x)

    var isLeftPoint = isLeft(d.prev, d, d.next)
    if (abovePrev && aboveNext){
      d.type = !isLeftPoint ? 'start' : 'split'
    } else if (!abovePrev && !aboveNext){
      d.type = !isLeftPoint ? 'end' : 'merge'
    } else {
      d.type = 'regular'
    }
  })
}


function render(){
  pointsToPoly(points)
  addLabels(points)


  var circles = svg.selectAll('g.point').data(points)

  var circleEnter = circles.enter().append('g.point')
      .call(drag)
      .on('contextmenu', function(d){
        d3.event.preventDefault()
        points = points.filter(function(e){ return d != e })
        render()
      })
  circleEnter.append('circle').attr('r', 10)
  circleEnter.append('text').attr({'text-anchor': 'middle', dy: '.33em'})

  circles.translate(ƒ()).select('text').text(ƒ('type'))
  circles.exit().remove()

  path.attr('d', 'M' + points.join('L') + 'Z')

  lines = []
  points.forEach(function(d, i){
    lines.push([d, points[(i + 1) % points.length]])
  })
}