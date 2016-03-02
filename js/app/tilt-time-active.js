/*global define*/
define('app/tilt-time-active', ['moment', 'lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(moment, _, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_TILT_TIME_ACTIVE_SECONDS';
  var options = { sanitized: true };

  var ID = 'devtools-tilt-time-active-chart';
  var chart = {
    title: 'DevTools Tilt Active Time Spent',
    description: metric,
    color_range: _.values(FIREFOX_RELEASES.colors),
    color_domain: T.ALL_CHANNELS,
    width: 1024,
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

  LatestVersions.getLatestVersion().then((versions) => {
    Promise.all(versions.map((target) => {
      return T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(target.channel, evolutions)).
              then(_.flatten);
    }
    )).then(_.flatten). // flatten again because we want one big cluster of data
        then((data) => {
          chart.data = data;
          DevToolsMetrics.point(ID, chart);
        });
  });

}); // end define
