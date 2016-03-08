/*global define*/
define('app/operating-system', ['lodash', 'd3', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions'],
function(_, d3, T, DevToolsMetrics, LatestVersions) {

  var metric = 'DEVTOOLS_OS_ENUMERATED_PER_USER';
  var options = { sanitized: true };

  var ID = 'devtools-operating-system-chart';
  var chart = {
    title: 'Evolution of the DevTools Operating Systems (pre-release channels)',
    description: 'Telemetry numbers report the type of operating system according to our pre-defined buckets.',
    width: 335,
    height: 450,
    left: 60,
    legend_target: '#' + ID + '-legend'
  };
  var OSES = {
    0:'Windows XP',
    1:'Windows Vista',
    2:'Windows 7',
    3:'Windows 8',
    4:'Windows 8.1',
    5:'OSX',
    6:'Linux',
    7:'Windows 10',
    8:'reserved',
    9:'reserved',
    10:'reserved',
    11:'reserved',
    12:'other',
    13:'unknown'
  }
  function evolutionMap(evolutions) {
    // map the data into the values we need
    // histogram, index, date
    return _.flatten(evolutions.map((h, i, date) => {
      // values of less than 10 are not useful at all
      return _.filter(h.values, (v) => (v > 10)).map((v, i) => {
        return {
          os: OSES[i],
          value: v,
          date: date
        };
      })
    }));
  }

  // var ctx = document.getElementById("devtools-operating-system-donught").getContext("2d");

  DevToolsMetrics.line(ID, chart);

  LatestVersions.getLatestVersion().then((versions) => {
    _.remove(versions, { channel: 'release' });
    Promise.all(versions.map((target) => {
      return T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions));
    })).then((evolutions) => T.reduceEvolutions(evolutions)
    ).then((evolutions) => evolutionMap(evolutions)
    ).then((data) => {
      var grouped = _.groupBy(data, 'os');

      // reduce the historgram values into one sum
      var dough = _.map(grouped, function(value, index) {
        return {
          label: index,
          value: value.reduce((p, c) => (p + c.value), 0)
        };
      });
      // remove windows from the array to add back in later
      var windows = _.remove(dough, function(value) {
        return value.label.startsWith('Windows');
      });
      // add windows summing up the Win* values
      dough.push({
        label: 'Windows',
        value: windows.reduce((p,c) => p + c.value, 0)
      });
      pie(dough);
      chart.legend = _.keys(grouped);
      return _.values(grouped);
    })
    .then((data) => {
      chart.data = data;
      DevToolsMetrics.line(ID, chart);
    });
  });

  function pie(data) {
    var width = 530,
    height = 400,
    radius = Math.min(width, height) / 2;

    var color = d3.scale.category20();
    var labels = data.map((d) => d.label);

    var arc = d3.svg.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
      .innerRadius(radius * 0.9)
      .outerRadius((d) => {
        // hack to make the OSX label not sit directly on the Linux one
        return radius * (0.9 - labels.indexOf(d.data.label) / 10);
      });

    var pie = d3.layout.pie().sort(null).value((d) => d.value);

    var svg = d3.select("#devtools-operating-system-doughnut")
        .append("svg")
        .append("g");

    svg.append("g")
       .attr("class", "slices");
    svg.append("g")
       .attr("class", "labels");
    svg.append("g")
       .attr("class", "lines");

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var key = (d) => d.data.label;

    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
                    .data(pie(data), key);

    slice.enter()
      .insert("path")
      .style("fill", (d) => color(d.data.label))
      .attr("class", "slice");

    slice
      .transition().duration(1000)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      })

    slice.exit()
      .remove();

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
      .data(pie(data), key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text((d) => d.data.label);

    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.transition().duration(1000)
      .attrTween("transform", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
        };
      })
      .styleTween("text-anchor", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      });

    text.exit()
      .remove();


    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);

    polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

    polyline.exit()
      .remove();
  }
}); // end define
