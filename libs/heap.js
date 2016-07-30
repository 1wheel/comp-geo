// adapted from topojson

function heap(compare) {
  var heap = {},
      array = [];

  heap.push = function() {
    for (var i = 0, n = arguments.length; i < n; ++i) {
      var object = arguments[i];
      up(object._i = array.push(object) - 1);
    }
    return array.length;
  };

  heap.some = function(test) {
    return array.some(test);
  };

  heap.pop = function() {
    var removed = array[0],
        object = array.pop();
    if (array.length) {
      array[object._i = 0] = object;
      down(0);
    }
    if (removed) delete removed._i;
    return removed;
  };

  function up(i) {
    var object = array[i];
    while (i > 0) {
      var up = ((i + 1) >> 1) - 1,
          parent = array[up];
      if (compare(object, parent) >= 0) break;
      array[parent._i = i] = parent;
      array[object._i = i = up] = object;
    }
  }

  function down(i) {
    var object = array[i];
    while (true) {
      var right = (i + 1) << 1,
          left = right - 1,
          down = i,
          child = array[down];
      if (left < array.length && compare(array[left], child) < 0) child = array[down = left];
      if (right < array.length && compare(array[right], child) < 0) child = array[down = right];
      if (down === i) break;
      array[child._i = i] = child;
      array[object._i = i = down] = object;
    }
  }

  return heap;
};


// https://github.com/square/crossfilter/blob/master/src/heap.js