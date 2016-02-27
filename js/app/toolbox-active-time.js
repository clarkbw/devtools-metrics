/*global define, FIREFOX_RELEASES*/
define('app/toolbox-active-time', ['jquery', 'MG', 'moment', 'd3', 'TelemetryPromises', 'FIREFOX_RELEASES'],
function($, MG, moment, d3, T, FIREFOX_RELEASES) {

  var probe = 'DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS';
  var ID = 'devtools-toolbox-usage-chart';
  var targets = T.getTargets();
  Promise.all(targets.map((target) =>
    T.getSanitizedEvolutions(probe, target.channel, target.versions).
            then((evolutions) => T.reduceEvolutions(evolutions)).
            then((evolutions) => {
              // map the data into the values we need
              // histogram, index, date
              return evolutions.map((h, i, date) => {
                return {
                  channel: target.channel,
                  value: (moment.duration(h.mean(), 'seconds').minutes()),
                  submissions: h.submissions,
                  date: date
                };
              });
            }).
            then(T.flattenEvolutionsArray).
            then((data) => data)
  )).then(T.flattenEvolutionsArray).
      then((data) => {
        $(function() {

          MG.data_graphic({
            title: 'DevTools Toolbox Active Time Spent',
            description: probe,
            data: data,
            least_squares: true,
            chart_type: 'point',
            // missing_is_hidden: true,
            // missing_is_zero: true,
            interpolate: 'basic',
            width: 335,
            height: 320,
            left: 60,
            // animate_on_load: true,
            target: '#' + ID,
            yax_format: function(d) {
              return moment.duration(d, 'minutes').humanize();
            },
            markers: FIREFOX_RELEASES,
            y_extended_ticks: true,
            // y_scale_type: 'log',
            color_accessor: 'channel',
            color_type:'category',
            // color_domain: ['beta', 'aurora', 'nightly'],
            // color_range: ['steelblue', 'purple', 'grey'],
            size_accessor:'submissions',
            x_accessor: 'date',
            y_accessor: 'value',
            mouseover: function(d) {
              var format = d3.format(',');
              d3.select('#' + ID + ' svg .mg-active-datapoint')
                  .text(d.point.channel + ' : ' +
                  format(d.point.submissions) + ' active for ' +
                  moment.duration(d.point.value, 'minutes').humanize());
            }
            // y_label: 'time',
            // legend: ['beta', 'aurora', 'nightly'],
            // legend_target: '#' + ID + '-legend'
          });
        }); // end of $()
      });


}); // end define
