/*global define*/
define('app/panels-time-active', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'DEVTOOLS_PANELS', 'LatestVersions', 'FIREFOX_RELEASES'],
function(moment, _, T, DevToolsMetrics, DEVTOOLS_PANELS, LatestVersions, FIREFOX_RELEASES) {

  var metrics = DEVTOOLS_PANELS.map((m) => {
    return { label: m.label, metric: m.metric.time_active, color: m.color };
  });
  var CHART_DEFAULTS = {
    title: 'All DevTools Panels Time Actively Spent',
    description: 'Time per panel grouped and plotted together with all other panels (log scale)',
    color_accessor: 'panel',
    color_domain: metrics.map((m) => m.label),
    color_range: metrics.map((m) => m.color),
    y_scale_type: 'log',
    width: 515,
    height: 320,
    left: 60
  };

  var DEFAULT_OPTIONS = {
    sanitized: true
  };
  var ALL_DATA = {};

  var ID = 'devtools-toolbox-panels-time-active-chart';

  function evolutionMap(panel, evolutions) {
    // map the data into the values we need
    // histogram, index, date
    return evolutions.map((h, i, date) => {
      return {
        panel: panel,
        value: (moment.duration(h.mean(), 'seconds').minutes()),
        submissions: h.submissions,
        date: date
      };
    });
  }

  return {
    graph: function(channel = 'beta', chart = {}, options = {}) {
      chart = _.defaults(chart, CHART_DEFAULTS);
      chart.markers = FIREFOX_RELEASES[channel];
      options = _.defaults(options, DEFAULT_OPTIONS);

      // draw initial empty chart
      DevToolsMetrics.line(ID, chart);

      return LatestVersions.getLatestVersion().then((versions) => {
        var fxChannel = _.find(versions, { channel: channel });
        var total = fxChannel.versions.length;
        var current = total;
        return Promise.all(metrics.map((m) => {
          return T.getEvolutions(fxChannel.channel, fxChannel.versions, m.metric, options).then(function (evo) {
                  // update progress meter when we have data
                  DevToolsMetrics.progress(ID, total, current -= 1);
                  return evo;
                }).catch(function () {
                  // update progress meter when telemetry returned nothing
                  DevToolsMetrics.progress(ID, total, current -= 1);
                  return null;
                }).
                  then((evolutions) => T.reduceEvolutions(evolutions)).
                  then((evolutions) => evolutionMap(m.label, evolutions)).
                  then(_.flatten);
        })).then(_.flatten). // flatten again because we want one big cluster of data
           then((data) => {
             // cache data for lata
             ALL_DATA[channel] = data;
             chart.data = data;
             DevToolsMetrics.point(ID, chart);
             return data;
           });
      });
    }
  };

}); // end define
