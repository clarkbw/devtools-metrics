/*global define*/
define('app/toolbox-opened', ['jquery', 'MG', 'moment', 'd3', 'lodash', 'TelemetryPromises', 'FIREFOX_RELEASES'],
function($, MG, moment, d3, _, T, FIREFOX_RELEASES) {

  var metric = 'DEVTOOLS_TOOLBOX_OPENED_PER_USER_FLAG';
  var ID = 'devtools-toolbox-opened-chart';
  var options = { sanitized: true };

  function evolutionMap(channel, evolutions) {
    // map the data into the values we need
    // histogram, index, date
    if (evolutions === null) { return []; }
    return evolutions.map((h, i, date) => {
      return {
        channel: channel,
        value: h.sum,
        date: date
      };
    });
  }

  T.getTargets().then((targets) => {

    Promise.all(targets.map((target) => {
      return T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(target.channel, evolutions)).
              then(_.flatten);
    })).then((data) => {
        $(function() {
          MG.data_graphic({
            title: 'DevTools Toolbox Opened',
            description: metric,
            data: data,
            missing_is_hidden: true,
            // missing_is_zero: true,
            interpolate: 'basic',
            width: 700,
            height: 320,
            left: 60,
            animate_on_load: true,
            target: '#' + ID,
            y_extended_ticks: true,
            markers: FIREFOX_RELEASES.beta,
            x_accessor: 'date',
            y_accessor: 'value',
            legend: ['nightly', 'aurora', 'beta', 'release'],
            legend_target: '#' + ID + '-legend'
          });
        }); // end of $()

      });
    });
}); // end define
