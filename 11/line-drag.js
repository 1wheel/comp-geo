var w = 960; h = 500
var points = []
var drag = d3.behavior.drag().on('drag', function(d){
  d.x = clamp(300, d3.event.x, w)
  d.y = clamp(0, d3.event.y, h)
  render()
})

var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})

svg.append('path').attr('d', 'M300,0v' + h).style('stroke', '#ccc')


svg.append('rect').attr({width: w, height: h, opacity: 0})
    .on('click', function(){
      points.push(P(d3.mouse(this)))
      render()
    })

var color = d3.scale.category10()

points =  [[454,239],[630,126],[164,187],[266,459],[611,341],[488,318],[388,336],[287,324]].map(P)
render()



function render(){

  lines = []
  points
      // .filter(ƒ('line', negFn))
      .forEach(function(d, i){
        if (i % 2) lines.push([d, points[i - 1]])
      })

  lines.forEach(function(d, i){
    //don't change colors on remove
    d.color = d[0].color != 'black' ? d[0].color : color(i)
    d[0].line = d
    d[0].color = d.color
    d[1].line = d
    d[1].color = d.color
  })


  var lineSel = svg.selectAll('path.line').data(lines)
  lineSel.enter().append('path.line')
  lineSel.style({stroke: ƒ('color')}).attr('d', toPathStr)
  lineSel.exit().remove()

  var circleSel = svg.selectAll('g.point').data(points)
  var circleEnter = circleSel.enter().append('g.point')
      .call(drag)
      .on('contextmenu', function(d){
        d3.event.preventDefault()
        points = points.filter(function(e){ return d != e && !_.contains(d.line, e) })
        render()
      })
  circleEnter.append('circle').attr('r', 7)

  circleSel
      .translate(ƒ())
      .style('fill', ƒ('color'))

  circleSel.exit().remove()

}