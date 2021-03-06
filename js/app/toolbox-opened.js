/*global define*/
define('app/toolbox-opened', ['lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(_, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_TOOLBOX_OPENED_COUNT';
  var options = { sanitized: true };
  var markers = FIREFOX_RELEASES.beta;
  markers.push({
    date: new Date('2016-02-25'),
    label: 'New Count Metric'
  });

  var ID = 'devtools-toolbox-opened-chart';
  var chart = {
    title: 'Toolbox Opened Per User / Day (DAU)',
    description: 'Telemetry numbers report how many times users have opened the DevTools toolbox in the day.',
    width: 335,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS,
    colors: _.values(FIREFOX_RELEASES.colors),
    legend_target: '#' + ID + '-legend',
    markers: markers
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

  return LatestVersions.getLatestVersion().then((versions) => {
            var total = versions.reduce((prev, curr) => (prev + curr.versions.length), 0);
            var current = total;
            DevToolsMetrics.progress(ID, total, current);
            return Promise.all(versions.map((target) => {
              return Promise.all(target.versions.map((version) => {
                return T.getEvolution(target.channel, version, metric, options).then(function (evo) {
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
              return data;
            });
          });

}); // end define
