/*global define*/
define('app/toolbox-time-active', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics'],
function(moment, _, T, DevToolsMetrics) {

  var metric = 'DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS';
  var options = { sanitized: true };

  var ID = 'devtools-toolbox-time-active-chart';
  var chart = {
    title: 'DevTools Toolbox Active Time Spent',
    description: metric,
    width: 335,
    height: 320,
    left: 60
  };

  function evolutionMap(channel, evolutions) {
    // map the data into the values we need
    // histogram, index, date
    return evolutions.map((h, i, date) => {
      return {
        channel: channel,
        value: (moment.duration(h.mean(), 'seconds').minutes()),
        submissions: h.submissions,
        date: date
      };
    });
  }

  DevToolsMetrics.point(ID, chart);

  T.getTargets().then((targets) => {

    Promise.all(targets.map((target) =>
      T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(target.channel, evolutions)).
              then(_.flatten)
    )).then(_.flatten). // flatten again because we want one big cluster of data
        then((data) => {
          chart.data = data;
          DevToolsMetrics.point(ID, chart);
        });
  });

}); // end define