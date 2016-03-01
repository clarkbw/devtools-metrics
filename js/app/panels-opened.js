/*global define*/
define('app/panels-opened', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'DEVTOOLS_PANELS', 'LatestVersions'],
function(moment, _, T, DevToolsMetrics, DEVTOOLS_PANELS, LatestVersions) {

  var metrics = DEVTOOLS_PANELS.map((m) => {
    return { label: m.label, metric: m.metric.opened_per_user_flag, color: m.color };
  });
  var options = { sanitized: true };

  var ID = 'devtools-toolbox-panels-opened-chart';
  var chart = {
    title: 'DevTools Panels Opening Compared',
    description: 'All Panels Compared',
    legend: metrics.map((m) => m.label),
    colors: metrics.map((m) => m.color),
    aggregate_rollover: true,
    width: 515,
    height: 320,
    left: 60
  };

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

  DevToolsMetrics.line(ID, chart);

  LatestVersions.getLatestVersion().then((versions) => {
    var channel = _.find(versions, { channel: 'beta' });
    Promise.all(metrics.map((m) => {
      return T.getEvolutions(channel.channel, channel.versions, m.metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(m.label, evolutions)).
              then(_.flatten);
    })).then((data) => {
      chart.data = data;
      DevToolsMetrics.line(ID, chart);
    });
  });

}); // end define
