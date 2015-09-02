var jsEditor;

// d3.json("esprima2.json", function(error, root) {
//    esp = root; foo = {ice: esp};
//
//    var data = formatData(root);
//    showGraph({ast: data});
// });



function updateIcicle() {
  var output, root;
  try {
      output = esprima.parse(jsEditor.doc.getValue());
      var data = formatData(output);
      showGraph({ast: data});
  } catch (e) {
      output = e.stack;
  }
}

// d3.json("readme.json", function(error, root) {
//   re = root
//   showGraph(root);
// });

var width = 960,
    height = 160;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([0, height]);

var color = d3.scale.category20c();

var partition = d3.layout.partition()
    .children(function(d) { return isNaN(d.value) ? d3.entries(d.value) : null; })
    .value(function(d) { return d.value; });

var svg = d3.select(".icicle").append("svg")
    .attr("width", width)
    .attr("height", height);

var rect = svg.selectAll("rect");

function formatData(data) {
  return _.transform(data, function(result, value, key) {
    var out;
    if (_.isObject(value)) {
      out = formatData(value);
    } else {
      out = 1;
    }

    return result[key] = out;
  });
}


function showGraph(root) {

  $('.icicle rect').remove();
  setTimeout(function() {
    rect = rect.data(partition(d3.entries(root)[0]))
      .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.dx); })
        .attr("height", function(d) { return y(d.dy); })
        .attr("fill", function(d) {
          var el = (d.children ? d : (d.parent ? d.parent : d));
          console.log(el.key, d.key);
          return color(el.key);
        })
        .on("click", clicked);
  },50);


}

function clicked(d) {
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

  rect.transition()
      .duration(750)
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
      .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
}


function setupEditor() {
  jsEditor = CodeMirror.fromTextArea($('#source').get(0), {
    mode: "javascript",
    gutter: true,
    lineNumbers: true
  })

  jsEditor.on("keyHandled", updateIcicle);
  jsEditor.setSize('100%', 100);
  jsEditor.gutter = true;
}

$(function() {
  setupEditor();
  updateIcicle();

  // root = esprima.parse("2+2");
  // var data = formatData(root);
  // showGraph({ast: data});

});
