/*global define*/
define('app/toolbox-engagement-ratio', ['lodash', 'TelemetryPromises', 'DevToolsMetrics', 'FIREFOX_RELEASES'],
function(_, T, DevToolsMetrics, FIREFOX_RELEASES) {

  var ID = 'devtools-toolbox-engagement-ratio-chart';
  var chart = {
    title: 'Engagement Ratio',
    description: '',
    width: 335,
    height: 320,
    left: 60,
    legend: T.ALL_CHANNELS,
    colors: _.values(FIREFOX_RELEASES.colors),
    legend_target: '#' + ID + '-legend'
  };

  DevToolsMetrics.line(ID, chart);

  return function(dau, mau) {
    var data = _.map(dau, (d, i) => {
      // console.log('mau', mau[i]);
      return _.map(d, (day) => {
        // console.log('chan', day, j);
        // find the mau that matches the date given
        var month = _.find(mau[i], {'date': day.date});
        // remove the object so we don't iterate over it again
        _.remove(mau[i], {'date': day.date});
        // double check we have the same channel
        if (day.channel === month.channel) {
          day.value = (day.value / month.value);
        }
        return day;
      });
    });
    chart.data = data;
    DevToolsMetrics.line(ID, chart);
  }

}); // end define
