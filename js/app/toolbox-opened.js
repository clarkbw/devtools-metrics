/*global define*/
define('app/toolbox-opened', ['jquery', 'MG', 'moment', 'd3', 'TelemetryPromises', 'FIREFOX_RELEASES'],
function($, MG, moment, d3, T, FIREFOX_RELEASES) {

  var probe = 'DEVTOOLS_TOOLBOX_OPENED_PER_USER_FLAG';
  var ID = 'devtools-toolbox-opened-chart';
  var targets = T.getTargets();

  Promise.all(targets.map((target) => {
    return T.getSanitizedEvolutions(probe, target.channel, target.versions).
            then((evolutions) => {
              console.log('EEE', target.channel, evolutions);
              return T.reduceEvolutions(evolutions)
            }).
            then((evolutions) => {
              // map the data into the values we need
              // histogram, index, date
              if (evolutions === null) { return []; }
              return evolutions.map((h, i, date) => {
                return {
                  channel: target.channel,
                  value: h.sum,
                  date: date
                };
              });
            }).
            then(T.flattenEvolutionsArray).
            then((data) => data);
  })).then((data) => {
        $(function() {
          console.log('data', data);
          MG.data_graphic({
            title: 'DevTools Toolbox Opened',
            description: probe,
            data: data,
            missing_is_hidden: true,
            // missing_is_zero: true,
            interpolate: 'basic',
            width: 700,
            height: 320,
            left: 60,
            // animate_on_load: true,
            target: '#' + ID,
            y_extended_ticks: true,
            markers: FIREFOX_RELEASES,
            // y_scale_type: 'log',
            // color_accessor: 'channel',
            // color_type:'category',
            // color_domain: ['beta', 'aurora', 'nightly'],
            // color_range: ['steelblue', 'purple', 'grey'],
            // size_accessor:'submissions',
            x_accessor: 'date',
            y_accessor: 'value',
            // mouseover: function(d) {
            //   var format = d3.format(',');
            //   d3.select('#' + ID + ' svg .mg-active-datapoint')
            //       .text(d.point.channel + ' : ' +
            //       format(d.point.submissions) + ' active for ' +
            //       moment.duration(d.point.value, 'minutes').humanize());
            // }
            // y_label: 'time',
            legend: ['nightly', 'aurora', 'beta', 'release'],
            legend_target: '#' + ID + '-legend'
          });
        }); // end of $()

      });
}); // end define
