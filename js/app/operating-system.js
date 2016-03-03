/*global define*/
define('app/operating-system', ['moment', 'lodash', 'd3', 'TelemetryPromises', 'DevToolsMetrics', 'LatestVersions'],
function(moment, _, d3, T, DevToolsMetrics, LatestVersions) {

  var metric = 'DEVTOOLS_OS_ENUMERATED_PER_USER';
  var options = { sanitized: true };

  var ID = 'devtools-operating-system-chart';
  var chart = {
    title: 'Evolution of the DevTools Operating Systems (pre-release channels)',
    description: 'Telemetry numbers report the type of operating system according to our pre-defined buckets.',
    width: 335,
    height: 320,
    left: 60,
    legend_target: '#' + ID + '-legend'
  };
  var OSES = {
    0:'Windows XP',
    1:'Windows Vista',
    2:'Windows 7',
    3:'Windows 8',
    4:'Windows 8.1',
    5:'OSX',
    6:'Linux',
    7:'Windows 10',
    8:'reserved',
    9:'reserved',
    10:'reserved',
    11:'reserved',
    12:'other',
    13:'unknown'
  }
  function evolutionMap(evolutions) {
    console.log('evolutionMap', evolutions);
    // map the data into the values we need
    // histogram, index, date
    return _.flatten(evolutions.map((h, i, date) => {
      // values of less than 10 are not useful at all
      return _.filter(h.values, (v) => (v > 10)).map((v, i) => {
        return {
          os: OSES[i],
          value: v,
          date: date
        };
      })
    }));
  }

  DevToolsMetrics.line(ID, chart);

  LatestVersions.getLatestVersion().then((versions) => {
    _.remove(versions, { channel: 'release' });
    Promise.all(versions.map((target) => {
      return T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => {
                console.log('evolutions', evolutions);
                return T.reduceEvolutions(evolutions);
              });
    })).then((evolutions) => {
      console.log('evolutions2', evolutions);
      return T.reduceEvolutions(evolutions);
    }).then((evolutions) => {
      var map = evolutionMap(evolutions);
      console.log('map', map);
      return map;
    }).then((data) => {
      var grouped = _.groupBy(data, 'os');
      chart.legend = _.keys(grouped);
      return _.values(grouped);
    })
    .then((data) => {
      chart.data = data;
      console.log('data', data);
      DevToolsMetrics.line(ID, chart);
    });
  });

}); // end define
