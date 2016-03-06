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

var queueLine = d3.svg.line()
    .x(function(d){ return -d.x*20 + 200})
    .y(ƒ('y'))

//copy(JSON.stringify(points.map(function(d){ return [d.x, d.y] })))
points =  [[611,341],[488,318],[388,336],[413,484],[655,216],[783,360],[798,245],[755,95],[579,232],[477,53],[314,177],[356,394]].map(P)
render()



function render(){
  lines = []
  points.forEach(function(d, i){
        if (i % 2) lines.push(_.sortBy([d, points[i - 1]], 'y')) })

  openColors = colors.slice() 
  lines.forEach(function(d, i){

    //don't change colors on remove
    d.color = d[0].line && d[0].line.color ? d[0].line.color : openColors[0]
    d[0].line = d
    d[1].line = d

    openColors = openColors.filter(function(color){ return color != d.color })
  })


  calcQueue()


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


  var queueSel = svg.selectAll('path.queue').data(linesByY)
  queueSel.enter().append('path.queue')
  queueSel
      .style({stroke: ƒ('color'), fill: 'none', 'stroke-width': 3})
      .attr('d', function(d, i){ return ['M', i*20 + 20, d[0].y, 'V', d[1].y].join(' ') })
      .attr('d', ƒ('queuePositions', queueLine))
  queueSel.exit().remove()


}



function calcQueue(){
  queue = _.sortBy(points, 'y')

  linesByY = _.sortBy(lines, ƒ(0, 'y'))
  linesByY.forEach(function(d){
    d.queuePositions = []
  })

  statusT = []

  queue.forEach(function(d, i){
    var y = d.y
    if (d.line && d.line[0] == d){
      // insert
      var i = 0; 
      while (statusT[i] && d.x < lineXatY(statusT[i], d.y)) i++
      statusT.splice(i, 0, d.line)

    } else if (d.line){
      // removal 
      var index = statusT.indexOf(d.line)
      statusT.splice(index, 1)
      d.line.queuePositions.push({x: index, y: Math.max(y - 10, queue[i - 1].y)})

    } else{
      // intersection

    }

    statusT.forEach(function(d, i){
      d.queuePositions.push({x: i, y: y})
    })

  })

}

