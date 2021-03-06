/*global define*/
define('app/reload-addon-installed-per-user', ['lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(_, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_RELOAD_ADDON_INSTALLED_PER_USER_FLAG';
  var options = { sanitized: false };
  var ID = 'devtools-reload-addon-installed-per-user-chart';
  var chart = {
    title: 'Reload Addon Installed per User / Release (MAU)',
    description: 'Per user, per release metric indicating the DevTools are have been installed via the Reload Addon method at least once',
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
      target.versions = [_.max(target.versions)];
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
