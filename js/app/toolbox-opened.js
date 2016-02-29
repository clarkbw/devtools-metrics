/*global define*/
define('app/toolbox-opened', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics'],
function(moment, _, T, DevToolsMetrics) {

  var metric = 'DEVTOOLS_TOOLBOX_OPENED_BOOLEAN';
  var options = { sanitized: true };

  var ID = 'devtools-toolbox-opened-chart';
  var chart = {
    title: 'DevTools User Sessions per Firefox Release Channel',
    description: 'Telemetry numbers report a user who has the DevTools toolbox open for more than 5 minutes.',
    width: 700,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS,
    legend_target: '#' + ID + '-legend'
  };

  function evolutionMap(channel, evolutions) {
    // map the data into the values we need
    // histogram, index, date
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
