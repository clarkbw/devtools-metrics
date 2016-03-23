/*global define*/
define('app/panels-opened', ['jquery', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'DEVTOOLS_PANELS', 'LatestVersions', 'FIREFOX_RELEASES'],
function($, _, T, DevToolsMetrics, DEVTOOLS_PANELS, LatestVersions, FIREFOX_RELEASES) {

  var metrics = DEVTOOLS_PANELS.map((m) => {
    return { label: m.label, metric: m.metric.opened_per_user_flag, color: m.color };
  });
  var CHART_DEFAULTS = {
    title: 'DevTools Panels Opening Compared',
    description: 'All Panels Compared',
    legend: metrics.map((m) => m.label),
    colors: metrics.map((m) => m.color),
    aggregate_rollover: true,
    width: 515,
    height: 320,
    left: 60
  };

  var DEFAULT_OPTIONS = {
    sanitized: true
  };
  var ALL_DATA = {};
  var ID = 'devtools-toolbox-panels-opened-chart';
  var ev = {};

  function evolutionMap(label, evolutions) {
    // map the data into the values we need
    // histogram, index, date
    if (evolutions === null) { return []; }
    return evolutions.map((h, i, date) => {
      return {
        label: label,
        value: h.sum,
        date: date
      };
    });
  }

  return {
    on: (name, func) => $(ev).on(name, func),
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
        // show progress meter for expected range
        DevToolsMetrics.progress(ID, total, current);

        // return cached data if possible
        if (ALL_DATA[channel] !== undefined) {
          chart.data = ALL_DATA[channel];
          DevToolsMetrics.line(ID, chart);
          return ALL_DATA[channel];
        }

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
        })).then((data) => {
          // cache data for lata
          ALL_DATA[channel] = data;
          chart.data = data;
          DevToolsMetrics.line(ID, chart);
          return data;
        });
      });
    }
  };

}); // end define
