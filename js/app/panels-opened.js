/*global define*/
define('app/panels-opened', ['jquery', 'MG', 'moment', 'd3', 'lodash', 'TelemetryPromises', 'FIREFOX_RELEASES', 'DEVTOOLS_PANELS'],
function($, MG, moment, d3, _, T, FIREFOX_RELEASES, DEVTOOLS_PANELS) {

  var metrics = DEVTOOLS_PANELS.map((m) => {
    return { label: m.label, metric: m.metric.opened_per_user_flag, color: m.color };
  });
  var ID = 'devtools-toolbox-panels-opened-chart';
  var CHANNEL = 'beta';
  var options = { sanitized: true };
  var title = 'DevTools Panels Opening Compared';
  var description = 'All Panels Compared';

  function evolutionMap(label, evolutions) {
    // map the data into the values we need
    // histogram, index, date
    if (evolutions === null) { return []; }
    return evolutions.map((h, i, date) => {
      return {
        label: label,
        value: h.sum,
        date: date
      };
    });
  }

  T.getLatestVersion(CHANNEL).then((version) => {
    T.getVersions({ channel: CHANNEL, version: (version - 5)},
                  { channel: CHANNEL, version: (version - 1)}).then((versions) => {
                    Promise.all(metrics.map((m) => {
                      return T.getEvolutions(CHANNEL, versions.map((v) => v.version), m.metric, options).
                              then((evolutions) => T.reduceEvolutions(evolutions)).
                              then((evolutions) => evolutionMap(m.label, evolutions)).
                              then(_.flatten);
                    })).then((data) => {
                      $(function() {
                        MG.data_graphic({
                          title: title,
                          description: description,
                          data: data,
                          missing_is_hidden: true,
                          // missing_is_zero: true,
                          interpolate: 'basic',
                          width: 515,
                          height: 320,
                          left: 60,
                          animate_on_load: true,
                          target: '#' + ID,
                          y_extended_ticks: true,
                          markers: FIREFOX_RELEASES.beta,
                          x_accessor: 'date',
                          y_accessor: 'value',
                          legend: metrics.map((m) => m.label),
                          legend_target: '#' + ID + '-legend',
                          colors: metrics.map((m) => m.color),
                          aggregate_rollover: true
                        });
                      }); // end of $()

                    });
                  });
  });

}); // end define
