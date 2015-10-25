var w = h = 500

var n = 500

var m = 10
var svg = d3.select('#graph').append('svg')
		.attr({width: 500 + 2*m, height: 500 + 2*m})
	.append('g').translate([m, m])

var path = svg.append('path.line').style('fill', 'none')


var points, lines
function setup(){
	points = d3.range(n).map(function(d){
		return P(Math.random()*w, Math.random()*h)
	})


	lines = []
	var unusedPoints = points.slice(1)
	var curPoint = points[0]
	while (unusedPoints.length){
		var closestVal = unusedPoints.reduce(function(p, v){
			var dist = distP(curPoint, v)
			return 2 < dist && dist < p.dist ? {dist: dist, point: v} : p
		}, {dist: 9999999})

		var nextPoint = closestVal.point || unusedPoints[0]

		lines.push([curPoint, nextPoint])

		curPoint = nextPoint
		unusedPoints = unusedPoints.filter(function(p){ return p != curPoint })
	}
	lines.push([curPoint, points[0]])

	lines.forEach(function(d, i){ d.i = i })


	render()	
}
setup()


d3.select(window).on('click', setup)




function step(){
	var badPoint = points.sort(d3.descendingKey(ƒ('intersections', 'length')))[0]
	if (!badPoint.intersections) return

	var newLine = []
	var newIndex, remIndex
	lines.forEach(function(d, i){
		if (d[0] == badPoint) (newLine[1] = d[1]) && (newIndex = i)
		if (d[1] == badPoint) (newLine[0] = d[0]) && (remIndex = i)
	})
	lines[newIndex] = newLine
	lines.splice(remIndex, 1)

	points = points.filter(function(d){ return d != badPoint })
	badPoint.sel.remove()

	render()
}



function render(){
	lines.forEach(function(l){ l.intersections = [] })

	points.forEach(function(d){ d.intersections = [] })

	//todo : n ln n instead of n*n
	var intersections = []
	lines.forEach(function(l0, i){
		lines.slice(i + 1).forEach(function(l1){
			if (l0[0] == l1[1] || l0[1] == l1[0]) return 

			var intersect = intersection(l0[0], l0[1], l1[0], l1[1])

			if (!intersect.isIntersection) return 
			intersections.push(intersect)
			;[l0[0], l0[1], l1[0], l1[1]].forEach(function(p){ p.intersections.push(intersect) })
		})
	})


	path.attr('d', 'M' + lines.map(ƒ('0')).join('L'))
	
	var circleSel = svg.selectAll('.point').data(points, function(d){ return d.toString() })
	circleSel.exit().classed('removed', true).remove()
	circleSel.enter().append('circle.point')
			.translate(ƒ())
			.attr('r', 3)
			.each(function(d){ d.sel = d3.select(this) })

	var intSel = svg.selectAll('.intersect').data(intersections, JSON.stringify)
	intSel.exit().classed('removed', true).remove()
	intSel.enter().append('circle.intersect')
			.style({fill: 'red', 'fill-opacity': 1, stroke: 'red'})
			.attr('r', 3)
			.translate(ƒ())	


	if (intersections.length) setTimeout(step, 0)
	// else setTimeout(setup, 1000)
}

