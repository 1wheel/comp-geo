//creates new point 
function P(x, y, color){
	var rv
	if (x.map){
		rv = {x: x[0], y: x[1], color: 'black'}
	} else{
		rv = {x: x, y: y, color: color || 'black'}
	}
	rv.toString = function(){ return rv.x + ',' + rv.y }
	rv.type = 'point'
	return rv
}

function clone(d){
	if (d.type == 'point'){
		return P(d.x, d.y, d.color)
	}
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

	i.isOverlap = (ix == a.x && iy == a.y) || (ix == b.x && iy == b.y)

	i.isIntersection = !(a.x < ix ^ ix < b.x) 
	              	&& !(c.x < ix ^ ix < d.x)
	              	&& !i.isOverlap

	return i
}

function isLeft(a, b, c){
	return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x) > 0
}

//http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
function triangleContains(a, b, c, p){
	var b1 = isLeft(p, a, b)
	var b2 = isLeft(p, b, c)
	var b3 = isLeft(p, c, a)

	return (b1 == b2) && (b2 == b3)
}

function lineXatY(l, y){
	var a = l[0], b = l[1],
			m = (a.y - b.y)/(a.x - b.x)

	return (y - a.y + m*a.x)/m 
}


function toPathStr(d){ return 'M' + d.join('L') }

function negFn(d){ return !d }

function clamp(a,b,c){ return Math.max(a, Math.min(b, c)) }

function pairs(array){
	var rv = []
	array.forEach(function(d, i){
		for (var j = i + 1; j < array.length; j++) rv.push([d, array[j]])
	})

	return rv
}


function mod(n, m){ return ((n % m) + m) % m }