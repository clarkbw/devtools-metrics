/*global define*/
define('app/toolbox-opened', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics'],
function(moment, _, T, DevToolsMetrics) {

  var metric = 'DEVTOOLS_TOOLBOX_OPENED_PER_USER_FLAG';
  var options = { sanitized: true };

  var ID = 'devtools-toolbox-opened-chart';
  var chart = {
    title: 'DevTools Toolbox Opened',
    description: metric,
    width: 700,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS,
    legend_target: '#' + ID + '-legend'
  };

  function evolutionMap(channel, evolutions) {
    // map the data into the values we need
    // histogram, index, date
    if (evolutions === null) { return []; }
    return evolutions.map((h, i, date) => {
      return {
        channel: channel,
        value: h.sum,
        date: date
      };
    });
  }

  DevToolsMetrics.line(ID, chart);

  T.getTargets().then((targets) => {

    Promise.all(targets.map((target) => {
      return T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(target.channel, evolutions)).
              then(_.flatten);
    })).then((data) => {
      chart.data = data;
      DevToolsMetrics.line(ID, chart);
    });
  });

}); // end define
