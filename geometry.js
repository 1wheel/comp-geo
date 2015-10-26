//creates new point 
function P(x, y, color){
	var rv = {x: x, y: y, color: color || 'black'}
	rv.toString = function(){ return rv.x + ',' + rv.y }
	return rv
}


//dist
function distP(a, b){
	return Math.sqrt(
		Math.pow(a.x - b.x, 2) + 
		Math.pow(a.y - b.y, 2))
}


//angle


//intersection between lines connect points [a, b] and [c, d]
function intersection(a, b, c, d){
	var det = (a.x - b.x)*(c.y - d.y) 
	    		- (a.y - b.y)*(c.x - d.x),

	l = a.x*b.y - a.y*b.x,
	m = c.x*d.y - c.y*d.x,

	ix = (l*(c.x - d.x) - m*(a.x - b.x))/det,
	iy = (l*(c.y - d.y) - m*(a.y - b.y))/det,
	i = P(ix, iy)

	i.isIntersection = !(a.x < ix ^ ix < b.x) 
	              	&& !(c.x < ix ^ ix < d.x)

	return i
}

function isLeft(a, b, c){
	return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x) > 0
}

function lineXatY(l, y){
	var a = l[0], b = l[1],
			m = (a.y - b.y)/(a.x - b.x)

	return (y - a.y + m*a.x)/m 
}


function toPathStr(d){ return 'M' + d.join('L') }

function negFn(d){ return !d }