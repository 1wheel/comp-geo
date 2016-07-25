  var svg = d3.select('body')
    .append('svg')
      .attr({width: 2*r + 2*r, height: 2*r + 2*r})
    .append('g')
      .translate([m + r, m + r])


  var angleScale = d3.scale.linear()
      .domain([0, candidates.length])
      .range([0, Math.PI*2])


  var circles = svg.dataAppend(candidates, 'circle')
      .each(function(d){ d.pos = angleToPos(angleScale(d.i)) })
      .translate(ƒ('pos'))
      .attr('r', 50)
      .style('opacity', .2)

  d3.select('body').on('mousemove', function(){
    var pos = d3.mouse(this)

    circles
        .attr('r', pos[0]/3)
        .style('opacity', pos[1]/500)
  })
