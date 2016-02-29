/*global define*/
define('app/panels-time-active', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'DEVTOOLS_PANELS'],
function(moment, _, T, DevToolsMetrics, DEVTOOLS_PANELS) {

  var metrics = DEVTOOLS_PANELS.map((m) => {
    return { label: m.label, metric: m.metric.time_active, color: m.color };
  });
  var options = { sanitized: true };

  var ID = 'devtools-toolbox-panels-time-active-chart';
  var CHANNEL = 'beta';
  var chart = {
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

  DevToolsMetrics.point(ID, chart);

  T.getLatestVersion(CHANNEL).then((version) => {
    T.getVersions({ channel: CHANNEL, version: (version - 5)},
                  { channel: CHANNEL, version: (version - 1)}).then((versions) => {
                    Promise.all(metrics.map((m) => {
                      return T.getEvolutions(CHANNEL, versions.map((v) => v.version), m.metric, options).
                              then((evolutions) => T.reduceEvolutions(evolutions)).
                              then((evolutions) => evolutionMap(m.label, evolutions)).
                              then(_.flatten);
                    })).then(_.flatten). // flatten again because we want one big cluster of data
                       then((data) => {
                      chart.data = data;
                      DevToolsMetrics.point(ID, chart);
                    });
                  });
  });
}); // end define
