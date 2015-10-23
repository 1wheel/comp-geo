var w = h = 500

var n = 50

var points = d3.range(n).map(function(d){
	return P(Math.random()*w, Math.random()*h)
})


var lines = points.map(function(p, i){
	return [p, points[(i + 1) % points.length]]
})


var m = 10
var svg = d3.select('#graph').append('svg')
		.attr({width: 500 + 2*m, height: 500 + 2*m})
	.append('g').translate([m, m])

render()


d3.select(window).on('click', function(){
	var badPoint = points.sort(d3.descendingKey(ƒ('intersections')))[0]
	if (!badPoint.intersections) return

	var newLine = []
	lines = lines.filter(function(d){
		if (d[0] == badPoint) return (newLine[1] = d[1]) && false
		if (d[1] == badPoint) return (newLine[0] = d[0]) && false
		return true
	})
	lines.push(newLine)

	points = points.filter(function(d){ return d != badPoint })

	render()
})



function render(){
	lines.forEach(function(l){ l.intersections = [] })

	points.forEach(function(d){ d.intersections = 0 })

	//todo : n ln n instead of n*n
	var intersections = []
	lines.forEach(function(l0, i){
		lines.slice(i + 2).forEach(function(l1){
			var intersect = intersection(l0[0], l0[1], l1[0], l1[1])

			if (!intersect.isIntersection) return 
			intersections.push(intersect)
			;[l0[0], l0[1], l1[0], l1[1]].forEach(function(p){ p.intersections++ })
		})
	})


	var lineSel = svg.selectAll('.line').data(lines, JSON.stringify)
	lineSel.exit().classed('removed', true)
	lineSel.enter().append('path.line').attr('d', function(d){
		return ['M', d[0], 'L', d[1]].join(' ')
	})

	
	var circleSel = svg.selectAll('.point').data(points, JSON.stringify)
	circleSel.exit().classed('removed', true)
	circleSel.enter().append('circle.point')
			.translate(ƒ())
			.attr('r', 5)

	var intSel = svg.selectAll('.intersect').data(intersections, JSON.stringify)
	intSel.exit().classed('removed', true)
	intSel.enter().append('circle.intersect')
			.style({fill: 'red'})
			.attr('r', 3)
			.translate(ƒ())	
}

