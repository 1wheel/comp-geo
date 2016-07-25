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


var colors = ['#F44336', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#795548']
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).brighter(2) }))
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).darker(3) }))

//copy(JSON.stringify(points.map(function(d){ return [d.x, d.y] })))
points =  [[611,341],[488,318],[388,336],[413,484],[655,216],[783,360],[798,245],[755,95],[579,232],[477,53],[314,177],[356,394]]
render()



function render(){

  lines = []
  points.forEach(function(d, i){
        if (i % 2) lines.push([d, points[i - 1]]) })

  openColors = colors.slice() 
  lines.forEach(function(d, i){
    //don't change colors on remove
    d.color = d[0].line && d[0].line.color ? d[0].line.color : openColors[0]
    d[0].line = d
    d[1].line = d

    openColors = openColors.filter(function(color){ return color != d.color })
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
    .filter(ƒ('line'))
      .style('fill', ƒ('line', 'color'))

  circleSel.exit().remove()

}