/*global define*/
define('app/panels-time-active', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics'],
function(moment, _, T, DevToolsMetrics) {

  var metrics = [
    {
      label: 'Inspector',
      metric: 'DEVTOOLS_INSPECTOR_TIME_ACTIVE_SECONDS'
    },
    {
      label: 'Console',
      metric: 'DEVTOOLS_WEBCONSOLE_TIME_ACTIVE_SECONDS'
    },
    {
      label: 'Debugger',
      metric: 'DEVTOOLS_JSDEBUGGER_TIME_ACTIVE_SECONDS'
    },
    {
      label: 'Network',
      metric: 'DEVTOOLS_NETMONITOR_TIME_ACTIVE_SECONDS'
    },
    {
      label: 'Performance',
      metric: 'DEVTOOLS_JSPROFILER_TIME_ACTIVE_SECONDS'
    },
    {
      label: 'Style Editor',
      metric: 'DEVTOOLS_STYLEEDITOR_TIME_ACTIVE_SECONDS'
    }
  ];
  var options = { sanitized: true };

  var ID = 'devtools-toolbox-panels-time-active-chart';
  var CHANNEL = 'beta';
  var chart = {
    title: 'All DevTools Panels Time Actively Spent',
    description: 'Time per panel grouped and plotted together with all other panels (log scale)',
    color_accessor: 'panel',
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
