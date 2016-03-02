/*global define*/
define('app/toolbox-opened', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(moment, _, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_TOOLBOX_OPENED_BOOLEAN';
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
    Promise.all(versions.map((target) => {
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
