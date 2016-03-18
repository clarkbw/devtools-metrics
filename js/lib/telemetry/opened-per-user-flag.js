/*global define*/
define('lib/telemetry/opened-per-user-flag', ['lodash', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions', 'FIREFOX_RELEASES'],
function(_, T, DevToolsMetrics, LatestVersions, FIREFOX_RELEASES) {

  var CHART_DEFAULTS = {
    title: '',
    description: 'Telemetry numbers report a user action once per release. (RAU)',
    width: 335,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS,
    colors: _.values(FIREFOX_RELEASES.colors)
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

return {
  graph: function(metric, ID, chart = {}, options = { sanitized: true }) {
    chart = _.defaults(chart, CHART_DEFAULTS);

    // draw initial empty chart
    DevToolsMetrics.line(ID, chart);

    return LatestVersions.getLatestVersion().then((versions) => {
      var total = versions.reduce((prev, curr) => (prev + curr.versions.length), 0);
      var current = total;
      // show progress
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
  }
};

}); // end define
