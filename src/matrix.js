function matrix1(json) {

  var matrix = [],
      nodes = json.nodes,
      n = nodes.length;

  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    node.count = 0;
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
  });


  // Convert links to matrix; count character occurrences.
  json.links.forEach(function(link) {
    matrix[link.source][link.target].z += link.value;
    matrix[link.target][link.source].z += link.value;
    nodes[link.source].count += link.value;
    nodes[link.target].count += link.value;
  });

  //console.log(matrix);

  var adjacency = matrix.map(function(row) {
      return row.map(function(c) { return c.z; });
  });

  var graph = reorder.graph()
	  .nodes(json.nodes)
	  .links(json.links)
	  .init();

    //Bipolarization
    function computeBipolar() {
      var order = bipolar(adjacency);
      //var order = bipolar_old(adjacency);
      //var order = bipolar_partition(graph);
      
      order.forEach(function(lo, i) {
        nodes[i].bp = lo;
      });
      return nodes.map(function(n) { return n.bp; });
    }

    //Spectral
    function computeSpectral() {
        var order = sp(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].sp = lo;
        });
        return nodes.map(function(n) { return n.sp; });
    }

    //Rank-two Ellipse
    function computeRank2Ellipse() {
        var order = rank2e_svd(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].rk = lo;
        });
        return nodes.map(function(n) { return n.rk; });
    }

    //MDS
    function computeMDS() {
        var order = mds(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].md = lo;
        });
        return nodes.map(function(n) { return n.md; });
    }

    //Mean Row Moments
    function computeMRM() {
        var order = mrm(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].mr = lo;
        });
        return nodes.map(function(n) { return n.mr; });
    }

    //Test
    function computeTest() {
      //var order = rank2e(adjacency);
      // var order = sp(adjacency);
      //
      //
      // order.forEach(function(lo, i) {
      //   nodes[i].test = lo;
      // });
      // return nodes.map(function(n) { return n.test; });
    }

    //Barycenter
    function computeBarycenter() {
	var barycenter = reorder.barycenter_order(graph),
	    improved = reorder.adjacent_exchange(graph,
						 barycenter[0],
						 barycenter[1]);

	improved[0].forEach(function(lo, i) {
	    nodes[i].barycenter = lo;
	});

	return nodes.map(function(n) { return n.barycenter; });
    }

    //Cuthill-McKee
    function computeRCM() {
	var rcm = reorder.reverse_cuthill_mckee_order(graph);
	rcm.forEach(function(lo, i) {
	    nodes[i].rcm = lo;
	});

	return nodes.map(function(n) { return n.rcm; });
    }

  // Precompute the orders.
    var orders = {
	sequence: d3.range(n).sort(function(a, b) { return d3.ascending(parseFloat(nodes[a].name), parseFloat(nodes[b].name)); }),
    bipolar: computeBipolar,
    spectral: computeSpectral,
    rank2ellipse: computeRank2Ellipse,
    mds: computeMDS,
    mrm: computeMRM,
    test: computeTest,
    barycenter: computeBarycenter,
    rcm: computeRCM
    };

  // The default sort order.
  x.domain(orders.sequence);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("id", function(d, i) { return "row"+i; })
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".01em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].name; });

  var column = svg.selectAll(".column")
      .data(matrix)
      .enter().append("g")
      .attr("id", function(d, i) { return "col"+i; })
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".01em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].name; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
	  .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand())
        .attr("height", x.rangeBand())
        //.style("fill-opacity", function(d) { return z(d.z); })
        .style("fill", function() { return c(0);});
        // .on("mouseover", mouseover)
        // .on("mouseout", mouseout);
  }


    // function mouseover(p) {
    //     d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    //     d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    // }
    //
    // function mouseout() {
    //     d3.selectAll("text").classed("active", false);
    //     d3.selectAll("rect").attr("width",x.rangeBand());
    //     d3.selectAll("rect").attr("height",x.rangeBand());
    // }

    var currentOrder = 'sequence';

    function order(value) {
	var o = orders[value];
	currentOrder = value;
	
	if (typeof o === "function") {
	    orders[value] = o.call();
	}

	x.domain(orders[value]);

	var t = svg.transition().duration(1500);

	t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
	    .selectAll(".cell")
            .delay(function(d) { return x(d.x) * 4; })
            .attr("x", function(d) { return x(d.x); });

	t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }

    matrix.order = order;
    //matrix.distance = distance;

    var timeout = setTimeout(function() {}, 1000);
    matrix.timeout = timeout;
    
    return matrix;
}

function matrix2(json) {

    var matrix = [],
        nodes = json.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    // Convert links to matrix; count character occurrences.
    json.links.forEach(function(link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;

        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    //console.log(matrix);

    var adjacency = matrix.map(function(row) {
        return row.map(function(c) { return c.z; });
    });


    var graph = reorder.graph()
        .nodes(json.nodes)
        .links(json.links)
        .init();


    //Bipolarization
    function computeBipolar() {
        var order = bipolar(adjacency);
        //var order = bipolar_old(adjacency);
        //var order = bipolar_partition(graph);

        order.forEach(function(lo, i) {
            nodes[i].bp = lo;
        });
        return nodes.map(function(n) { return n.bp; });
    }

    //Spectral
    function computeSpectral() {
        var order = sp(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].sp = lo;
        });
        return nodes.map(function(n) { return n.sp; });
    }

    //Rank-two Ellipse
    function computeRank2Ellipse() {
        var order = rank2e_svd(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].rk = lo;
        });
        return nodes.map(function(n) { return n.rk; });
    }

    //MDS
    function computeMDS() {
        var order = mds(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].md = lo;
        });
        return nodes.map(function(n) { return n.md; });
    }

    //Mean Row Moments
    function computeMRM() {
        var order = mrm(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].mr = lo;
        });
        return nodes.map(function(n) { return n.mr; });
    }

    //Test
    function computeTest() {
        //var order = rank2e(adjacency);
        // var order = sp(adjacency);
        //
        //
        // order.forEach(function(lo, i) {
        //   nodes[i].test = lo;
        // });
        // return nodes.map(function(n) { return n.test; });
    }

    //Barycenter
    function computeBarycenter() {
        var barycenter = reorder.barycenter_order(graph),
            improved = reorder.adjacent_exchange(graph,
                barycenter[0],
                barycenter[1]);

        improved[0].forEach(function(lo, i) {
            nodes[i].barycenter = lo;
        });

        return nodes.map(function(n) { return n.barycenter; });
    }

    //Cuthill-McKee
    function computeRCM() {
        var rcm = reorder.reverse_cuthill_mckee_order(graph);
        rcm.forEach(function(lo, i) {
            nodes[i].rcm = lo;
        });

        return nodes.map(function(n) { return n.rcm; });
    }

    // Precompute the orders.
    var orders = {
        sequence: d3.range(n).sort(function(a, b) { return d3.ascending(parseFloat(nodes[a].name), parseFloat(nodes[b].name)); }),
        bipolar: computeBipolar,
        spectral: computeSpectral,
        rank2ellipse: computeRank2Ellipse,
        mds: computeMDS,
        mrm: computeMRM,
        test: computeTest,
        barycenter: computeBarycenter,
        rcm: computeRCM
    };

    // The default sort order.
    x2.domain(orders.sequence);

    svg2.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg2.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "row"+i; })
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x2(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x2.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg2.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "col"+i; })
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x2(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x2.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x2(d.x); })
            .attr("width", x2.rangeBand())
            .attr("height", x2.rangeBand())
            //.style("fill-opacity", function(d) { return z2(d.z); })
            .style("fill", function() { return c2(0);});
            // .on("mouseover", mouseover2)
            // .on("mouseout", mouseout2);
    }


    // function mouseover(p) {
    //     d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    //     d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    // }
    //
    // function mouseout() {
    //     d3.selectAll("text").classed("active", false);
    //     d3.selectAll("rect").attr("width",x2.rangeBand());
    //     d3.selectAll("rect").attr("height",x2.rangeBand());
    //}

    var currentOrder = 'sequence';

    function order(value) {
        var o = orders[value];
        currentOrder = value;

        if (typeof o === "function") {
            orders[value] = o.call();
        }

        x2.domain(orders[value]);

        var t = svg2.transition().duration(1500);

        t.selectAll(".row")
            .delay(function(d, i) { return x2(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x2(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x2(d.x) * 4; })
            .attr("x", function(d) { return x2(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x2(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x2(i) + ")rotate(-90)"; });
    }

    matrix.order = order;
    //matrix.distance = distance;

    var timeout = setTimeout(function() {}, 1000);
    matrix.timeout = timeout;

    return matrix;
}

function matrix3(json) {

    var matrix = [],
        nodes = json.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });


    // Convert links to matrix; count character occurrences.
    json.links.forEach(function(link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;

        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    //console.log(matrix);

    var adjacency = matrix.map(function(row) {
        return row.map(function(c) { return c.z; });
    });


    var graph = reorder.graph()
        .nodes(json.nodes)
        .links(json.links)
        .init();


    //Bipolarization
    function computeBipolar() {
        var order = bipolar(adjacency);
        //var order = bipolar_old(adjacency);
        //var order = bipolar_partition(graph);

        order.forEach(function(lo, i) {
            nodes[i].bp = lo;
        });
        return nodes.map(function(n) { return n.bp; });
    }

    //Spectral
    function computeSpectral() {
        var order = sp(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].sp = lo;
        });
        return nodes.map(function(n) { return n.sp; });
    }

    //Rank-two Ellipse
    function computeRank2Ellipse() {
        var order = rank2e_svd(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].rk = lo;
        });
        return nodes.map(function(n) { return n.rk; });
    }

    //MDS
    function computeMDS() {
        var order = mds(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].md = lo;
        });
        return nodes.map(function(n) { return n.md; });
    }

    //Mean Row Moments
    function computeMRM() {
        var order = mrm(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].mr = lo;
        });
        return nodes.map(function(n) { return n.mr; });
    }

    //Test
    function computeTest() {
        //var order = rank2e(adjacency);
        // var order = sp(adjacency);
        //
        //
        // order.forEach(function(lo, i) {
        //   nodes[i].test = lo;
        // });
        // return nodes.map(function(n) { return n.test; });
    }

    //Barycenter
    function computeBarycenter() {
        var barycenter = reorder.barycenter_order(graph),
            improved = reorder.adjacent_exchange(graph,
                barycenter[0],
                barycenter[1]);

        improved[0].forEach(function(lo, i) {
            nodes[i].barycenter = lo;
        });

        return nodes.map(function(n) { return n.barycenter; });
    }

    //Cuthill-McKee
    function computeRCM() {
        var rcm = reorder.reverse_cuthill_mckee_order(graph);
        rcm.forEach(function(lo, i) {
            nodes[i].rcm = lo;
        });

        return nodes.map(function(n) { return n.rcm; });
    }


    // Precompute the orders.
    var orders = {
        sequence: d3.range(n).sort(function(a, b) { return d3.ascending(parseFloat(nodes[a].name), parseFloat(nodes[b].name)); }),
        bipolar: computeBipolar,
        spectral: computeSpectral,
        rank2ellipse: computeRank2Ellipse,
        mds: computeMDS,
        mrm: computeMRM,
        test: computeTest,
        barycenter: computeBarycenter,
        rcm: computeRCM
    };

    // The default sort order.
    x3.domain(orders.sequence);

    svg3.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg3.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "row"+i; })
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x3(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x3.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg3.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "col"+i; })
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x3(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x3.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x3(d.x); })
            .attr("width", x3.rangeBand())
            .attr("height", x3.rangeBand())
            //.style("fill-opacity", function(d) { return z3(d.z); })
            .style("fill", function() { return c3(0);});
            // .on("mouseover", mouseover)
            // .on("mouseout", mouseout);
    }

    //
    // function mouseover(p) {
    //     d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    //     d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    // }
    //
    // function mouseout() {
    //     d3.selectAll("text").classed("active", false);
    //     d3.selectAll("rect").attr("width",x3.rangeBand());
    //     d3.selectAll("rect").attr("height",x3.rangeBand());
    // }

    var currentOrder = 'sequence';

    function order(value) {
        var o = orders[value];
        currentOrder = value;

        if (typeof o === "function") {
            orders[value] = o.call();
        }

        x3.domain(orders[value]);

        var t = svg3.transition().duration(1500);

        t.selectAll(".row")
            .delay(function(d, i) { return x3(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x3(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x3(d.x) * 4; })
            .attr("x", function(d) { return x3(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x3(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x3(i) + ")rotate(-90)"; });
    }

    matrix.order = order;
    //matrix.distance = distance;

    var timeout = setTimeout(function() {}, 1000);
    matrix.timeout = timeout;

    return matrix;
}

function matrix4(json) {

    var matrix = [],
        nodes = json.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });


    // Convert links to matrix; count character occurrences.
    json.links.forEach(function(link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
        // matrix[link.source][link.source].z += link.value;
        // matrix[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    //console.log(matrix);

    var adjacency = matrix.map(function(row) {
        return row.map(function(c) { return c.z; });
    });


    var graph = reorder.graph()
        .nodes(json.nodes)
        .links(json.links)
        .init();

    var dist_adjacency;

    //Bipolarization
    function computeBipolar() {
        var order = bipolar(adjacency);
        //var order = bipolar_old(adjacency);
        //var order = bipolar_partition(graph);

        order.forEach(function(lo, i) {
            nodes[i].bp = lo;
        });
        return nodes.map(function(n) { return n.bp; });
    }

    //Spectral
    function computeSpectral() {
        var order = sp(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].sp = lo;
        });
        return nodes.map(function(n) { return n.sp; });
    }

    //Rank-two Ellipse
    function computeRank2Ellipse() {
        var order = rank2e_svd(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].rk = lo;
        });
        return nodes.map(function(n) { return n.rk; });
    }

    //MDS
    function computeMDS() {
        var order = mds(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].md = lo;
        });
        return nodes.map(function(n) { return n.md; });
    }

    //Mean Row Moments
    function computeMRM() {
        var order = mrm(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].mr = lo;
        });
        return nodes.map(function(n) { return n.mr; });
    }

    //Test
    function computeTest() {
        //var order = rank2e(adjacency);
        // var order = sp(adjacency);
        //
        //
        // order.forEach(function(lo, i) {
        //   nodes[i].test = lo;
        // });
        // return nodes.map(function(n) { return n.test; });
    }

    //Barycenter
    function computeBarycenter() {
        var barycenter = reorder.barycenter_order(graph),
            improved = reorder.adjacent_exchange(graph,
                barycenter[0],
                barycenter[1]);

        improved[0].forEach(function(lo, i) {
            nodes[i].barycenter = lo;
        });

        return nodes.map(function(n) { return n.barycenter; });
    }

    //Cuthill-McKee
    function computeRCM() {
        var rcm = reorder.reverse_cuthill_mckee_order(graph);
        rcm.forEach(function(lo, i) {
            nodes[i].rcm = lo;
        });

        return nodes.map(function(n) { return n.rcm; });
    }


    // Precompute the orders.
    var orders = {
        sequence: d3.range(n).sort(function(a, b) { return d3.ascending(parseFloat(nodes[a].name), parseFloat(nodes[b].name)); }),
        bipolar: computeBipolar,
        spectral: computeSpectral,
        rank2ellipse: computeRank2Ellipse,
        mds: computeMDS,
        mrm: computeMRM,
        test: computeTest,
        barycenter: computeBarycenter,
        rcm: computeRCM
    };

    // The default sort order.
    x4.domain(orders.sequence);

    svg4.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg4.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "row"+i; })
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x4(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x4.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg4.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "col"+i; })
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x4(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x4.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x4(d.x); })
            .attr("width", x4.rangeBand())
            .attr("height", x4.rangeBand())
            //.style("fill-opacity", function(d) { return z4(d.z); })
            .style("fill", function() { return c4(0);});
            // .on("mouseover", mouseover)
            // .on("mouseout", mouseout);
    }


    // function mouseover(p) {
    //     d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    //     d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    // }
    //
    // function mouseout() {
    //     d3.selectAll("text").classed("active", false);
    //     d3.selectAll("rect").attr("width",x4.rangeBand());
    //     d3.selectAll("rect").attr("height",x4.rangeBand());
    // }

    var currentOrder = 'sequence';

    function order(value) {
        var o = orders[value];
        currentOrder = value;

        if (typeof o === "function") {
            orders[value] = o.call();
        }

        x4.domain(orders[value]);

        var t = svg4.transition().duration(1500);

        t.selectAll(".row")
            .delay(function(d, i) { return x4(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x4(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x4(d.x) * 4; })
            .attr("x", function(d) { return x4(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x4(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x4(i) + ")rotate(-90)"; });
    }

    matrix.order = order;

    var timeout = setTimeout(function() {}, 1000);
    matrix.timeout = timeout;

    return matrix;
}

function matrix5(json) {

    var matrix = [],
        nodes = json.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });


    // Convert links to matrix; count character occurrences.
    json.links.forEach(function(link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;

        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    //console.log(matrix);

    var adjacency = matrix.map(function(row) {
        return row.map(function(c) { return c.z; });
    });


    var graph = reorder.graph()
        .nodes(json.nodes)
        .links(json.links)
        .init();


    //Bipolarization
    function computeBipolar() {
        var order = bipolar(adjacency);
        //var order = bipolar_old(adjacency);
        //var order = bipolar_partition(graph);

        order.forEach(function(lo, i) {
            nodes[i].bp = lo;
        });
        return nodes.map(function(n) { return n.bp; });
    }

    //Spectral
    function computeSpectral() {
        var order = sp(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].sp = lo;
        });
        return nodes.map(function(n) { return n.sp; });
    }

    //Rank-two Ellipse
    function computeRank2Ellipse() {
        var order = rank2e_svd(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].rk = lo;
        });
        return nodes.map(function(n) { return n.rk; });
    }

    //MDS
    function computeMDS() {
        var order = mds(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].md = lo;
        });
        return nodes.map(function(n) { return n.md; });
    }

    //Mean Row Moments
    function computeMRM() {
        var order = mrm(adjacency);

        order.forEach(function(lo, i) {
            nodes[i].mr = lo;
        });
        return nodes.map(function(n) { return n.mr; });
    }

    //Test
    function computeTest() {
        //var order = rank2e(adjacency);
        // var order = sp(adjacency);
        //
        //
        // order.forEach(function(lo, i) {
        //   nodes[i].test = lo;
        // });
        // return nodes.map(function(n) { return n.test; });
    }

    //Barycenter
    function computeBarycenter() {
        var barycenter = reorder.barycenter_order(graph),
            improved = reorder.adjacent_exchange(graph,
                barycenter[0],
                barycenter[1]);

        improved[0].forEach(function(lo, i) {
            nodes[i].barycenter = lo;
        });

        return nodes.map(function(n) { return n.barycenter; });
    }

    //Cuthill-McKee
    function computeRCM() {
        var rcm = reorder.reverse_cuthill_mckee_order(graph);
        rcm.forEach(function(lo, i) {
            nodes[i].rcm = lo;
        });

        return nodes.map(function(n) { return n.rcm; });
    }


    // Precompute the orders.
    var orders = {
        sequence: d3.range(n).sort(function(a, b) { return d3.ascending(parseFloat(nodes[a].name), parseFloat(nodes[b].name)); }),
        bipolar: computeBipolar,
        spectral: computeSpectral,
        rank2ellipse: computeRank2Ellipse,
        mds: computeMDS,
        mrm: computeMRM,
        test: computeTest,
        barycenter: computeBarycenter,
        rcm: computeRCM
    };

    // The default sort order.
    x5.domain(orders.sequence);

    svg5.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg5.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "row"+i; })
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x5(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x5.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg5.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("id", function(d, i) { return "col"+i; })
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x5(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x5.rangeBand() / 2)
        .attr("dy", ".01em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x5(d.x); })
            .attr("width", x5.rangeBand())
            .attr("height", x5.rangeBand())
            //.style("fill-opacity", function(d) { return z5(d.z); })
            .style("fill", function() { return c5(0);});
            // .on("mouseover", mouseover)
            // .on("mouseout", mouseout);
    }

    //
    // function mouseover(p) {
    //     d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y5; });
    //     d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x5; });
    // }
    //
    // function mouseout() {
    //     d3.selectAll("text").classed("active", false);
    //     d3.selectAll("rect").attr("width",x5.rangeBand());
    //     d3.selectAll("rect").attr("height",x5.rangeBand());
    // }

    var currentOrder = 'sequence';

    function order(value) {
        var o = orders[value];
        currentOrder = value;

        if (typeof o === "function") {
            orders[value] = o.call();
        }

        x5.domain(orders[value]);

        var t = svg5.transition().duration(1500);

        t.selectAll(".row")
            .delay(function(d, i) { return x5(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x5(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x5(d.x) * 4; })
            .attr("x", function(d) { return x5(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x5(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x5(i) + ")rotate(-90)"; });
    }

    matrix.order = order;
    //matrix.distance = distance;

    var timeout = setTimeout(function() {}, 1000);
    matrix.timeout = timeout;

    return matrix;
}

/*-------------------------------*/
function loadJson1(json) {
    var mat = matrix1(json);

    d3.select("#order1").on("change", function() {
	    mat.order(this.value);
    });
}

function loadJson2(json) {
    var mat = matrix2(json);

    d3.select("#order2").on("change", function() {
        mat.order(this.value);
    });
}

function loadJson3(json) {
    var mat = matrix3(json);

    d3.select("#order3").on("change", function() {
        mat.order(this.value);
    });
}

function loadJson4(json) {
    var mat = matrix4(json);

    d3.select("#order4").on("change", function() {
        mat.order(this.value);
    });
}

function loadJson5(json) {
    var mat = matrix5(json);

    d3.select("#order5").on("change", function() {
        mat.order(this.value);
    });
}