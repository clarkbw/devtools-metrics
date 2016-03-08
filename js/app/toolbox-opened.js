/*global define*/
define('app/toolbox-opened', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(moment, _, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_TOOLBOX_OPENED_BOOLEAN';
  var newMetric = 'DEVTOOLS_TOOLBOX_OPENED_COUNT';
  // the old BOOLEAN metric is being phased out so this dictionary
  // (assuming it is updated per release) will help us show activity as the
  // new metric moves in and the old metric fades away.
  var metrics = {
    'nightly': newMetric,
    'aurora': newMetric,
    'beta': metric,
    'release': metric
  };

  var options = { sanitized: true };

  var ID = 'devtools-toolbox-opened-chart';
  var chart = {
    title: 'Toolbox Opened Per User / Day (DAU)',
    description: 'Telemetry numbers report how many times users have opened the DevTools toolbox in the day.',
    width: 335,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS,
    colors: _.values(FIREFOX_RELEASES.colors),
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

  LatestVersions.getLatestVersion().then((versions) => {
    var total = versions.reduce((prev, curr) => (prev + curr.versions.length), 0);
    var current = total;
    DevToolsMetrics.progress(ID, total, current);
    Promise.all(versions.map((target) => {
      return Promise.all(target.versions.map((version) => {
        if (!metrics[target.channel]) {
          console.log(target.channel, ' not in ', metrics);
        }
        return T.getEvolution(target.channel, version, metrics[target.channel], options).then(function (evo) {
          DevToolsMetrics.progress(ID, total, current -= 1);
          return evo;
        }).catch(function () {
          DevToolsMetrics.progress(ID, total, current -= 1);
          return null;
        });
      })).then((evolutions) => T.reduceEvolutions(evolutions)).
          then((evolutions) => evolutionMap(target.channel, evolutions)).
          then(_.flatten);
    })).then((data) => {
      chart.data = data;
      DevToolsMetrics.line(ID, chart);
    });
  });

}); // end define
