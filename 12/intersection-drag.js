var w = 960, h = 500, dragW = 960 - 200
var points = []
var drag = d3.behavior.drag().on('drag', function(d){
  d.x = clamp(0, d3.event.x, dragW)
  d.y = clamp(0, d3.event.y, h)
  render()
})

var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})

svg.append('path').attr('d', 'M' + dragW + ',0v' + h).style('stroke', '#ccc')


svg.append('rect').attr({width: w, height: h, opacity: 0})
    .on('click', function(){
      points.push(P(d3.mouse(this)))
      render()
    })

var colors = ['#F44336', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#795548']
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).brighter(2) }))
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).darker(3) }))

var queueLine = d3.svg.line()
    .x(function(d){ return d.x*20 + dragW + 20})
    .y(ƒ('y'))

//copy(JSON.stringify(points.map(function(d){ return [d.x, d.y].map(Math.round) })))
// points =  [[611,341],[488,318],[388,336],[413,484],[655,216],[783,360],[798,245],[716,6],[546,126],[782,65],[314,177],[356,394]].map(P)
// points = [[916,299],[779,477],[640,367],[716,6],[793,131],[787,87]].map(P)
points = [[646,89],[783,360],[486,462],[782,65],[846,140],[365,422]].map(P)

// points = [[646,89],[745,369],[486,462],[782,65],[885,55],[585,453]].map(P)
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

  svg.selectAll('circle.intersection').remove()
  svg.dataAppend(intersections, 'circle.intersection')
      .attr({cx: ƒ('x'), cy: ƒ('y'), r: 5, fill: 'none', stroke: '#000'})

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


  linesByY.forEach(function(d){
    d.positions = []
    d.queuePositions.forEach(function(p, i){
      d.positions.push(p)
      var nextY = d.queuePositions[i + 1] && d.queuePositions[i + 1].y
      if (nextY > p.y + 10){
        d.positions.push({x: p.x, y: nextY - 10})
      }
    })
  })

  var queueSel = svg.selectAll('path.queue').data(linesByY)
  queueSel.enter().append('path.queue')
  queueSel
      .style({stroke: ƒ('color'), fill: 'none', 'stroke-width': 3})
      .attr('d', function(d){ return queueLine(_.sortBy(d.positions, 'y')) })
  queueSel.exit().remove()
}



function calcQueue(){
  queue = tree(points.slice())
    .key(function(d){ return d.y + .00001*d.x })
    .order()

  intersections = []


  linesByY = _.sortBy(lines, ƒ(0, 'y'))
  linesByY.forEach(function(d){
    d.queuePositions = []
  })

  statusT = tree([])


  for (var i = 0; i < queue.length; i++){
    var d = queue[i]
    var y = d.y
    if (d.line && d.line[0] == d){
      // insert
      var index = statusT
          .key(function(e){ return lineXatY(e, d.y) })
          .insert(d.line)
      checkIntersection(d.line, statusT[index + 1])
      checkIntersection(d.line, statusT[index - 1])
    } else if (d.line){
      // removal 
      var index = statusT.indexOf(d.line)
      statusT.splice(index, 1)
      d.line.queuePositions.push({x: index, y: Math.max(y - 10, queue[i - 1].y)})
      checkIntersection(statusT[i - 1], statusT[i])
    } else if (d.lineA && d.lineB){
      // intersection
      statusT.key(function(e){ return lineXatY(e, d.y - 1e-6) })

      var indexA = statusT.findIndex(d.lineA)
      var indexB = statusT.findIndex(d.lineB)
      if (indexA == indexB) indexA = indexA + 1
      statusT[indexA] = d.lineB
      statusT[indexB] = d.lineA

      var minIndex = indexA < indexB ? indexA : indexB
      checkIntersection(statusT[minIndex - 1], statusT[minIndex])
      checkIntersection(statusT[minIndex + 1], statusT[minIndex + 2])
    }

    statusT.forEach(function(d, i){
      d.queuePositions.push({x: i, y: y})
    })

    function checkIntersection(a, b){
      if (!a || !b) return 
      var i = intersection(a[0], a[1], b[0], b[1])
      i.lineA = a
      i.lineB = b
      if (i.isIntersection) intersections.push(i) && queue.insert(i)
    }
  }



}

