/*global define*/
define('app/reload-addon-reloaded', ['lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(_, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_RELOAD_ADDON_RELOAD_COUNT';
  var options = { sanitized: false };

  var ID = 'devtools-reload-addon-reloaded-chart';
  var chart = {
    title: 'Reload Addon Reloaded Count (DAU)',
    description: 'Number of times the addon has been reloaded by all users in total per day.',
    width: 335,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS.filter((c) => c === 'nightly'),
    markers: FIREFOX_RELEASES.nightly,
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
    versions = _.filter(versions, { channel: "nightly"});
    Promise.all(versions.map((target) => {
      return T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(target.channel, evolutions)).
              then(_.flatten);
    })).then((data) => _.dropWhile(data, (a) => (a.length === 0))).
    then((data) => {
      chart.data = data;
      DevToolsMetrics.line(ID, chart);
    });
  });

}); // end define
