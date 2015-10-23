var w = h = 500

var n = 15

var points = d3.range(n).map(function(d){
	return P(Math.random()*w, Math.random()*h)
})


var lines = points.map(function(p){
	return {origin: p}
})

lines.forEach(function(l, i){
	l.next = lines[(i + 1) % n]
	l.prev = lines[(i - 1 + n) % n]
})



var m = 10
var svg = d3.select('#graph').append('svg')
		.attr({width: 500 + 2*m, height: 500 + 2*m})
	.append('g')
		.translate([m, m])


svg.dataAppend(lines, 'path.line').attr('d', function(d){
	return ['M', d.origin, 'L', d.next.origin].join(' ')
})




svg.dataAppend(points, 'circle')
		.translate(ƒ())
		.attr('r', 5)



