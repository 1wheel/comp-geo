var w = 960; h = 500

var points = []

var drag = d3.behavior.drag().on('drag', function(d){
  d[0] = clamp(0, d3.event.x, w)
  d[1] = clamp(0, d3.event.y, h)
  render()
})


var svg = d3.select('#graph').append('svg')
    .attr({width: w, height: h})


var path = svg.append('path').style({stroke: '#000', fill: '#ccc'})

svg.append('rect').attr({width: w, height: h, opacity: 0})
    .on('click', function(){
      points.push(d3.mouse(this))
      render()
    })

function render(){
  var circles = svg.selectAll('circle').data(points)

  circles.enter().append('circle')
      .attr('r', 10)
      .call(drag)
      .on('contextmenu', function(d){
        d3.event.preventDefault()
        points = points.filter(function(e){ return d != e })
        render()
      })

  circles.translate(ƒ())

  circles.exit().remove()


  path.attr('d', 'M' + points.join('L') + 'Z')
}