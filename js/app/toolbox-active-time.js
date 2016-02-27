/*global define*/
define('app/toolbox-active-time', ['jquery', 'MG', 'moment', 'd3', 'lodash', 'TelemetryPromises', 'FIREFOX_RELEASES'],
function($, MG, moment, d3, _, T, FIREFOX_RELEASES) {

  var title = 'DevTools Toolbox Active Time Spent';
  var metric = 'DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS';
  var ID = 'devtools-toolbox-usage-chart';
  var options = { sanitized: true };

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

  T.getTargets().then((targets) => {

    Promise.all(targets.map((target) =>
      T.getEvolutions(target.channel, target.versions, metric, options).
              then((evolutions) => T.reduceEvolutions(evolutions)).
              then((evolutions) => evolutionMap(target.channel, evolutions)).
              then(_.flatten)
    )).then(_.flatten). // flatten again because we want one big cluster of data
        then((data) => {
          $(function() {

            MG.data_graphic({
              title: title,
              description: metric,
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
              markers: FIREFOX_RELEASES.beta,
              y_extended_ticks: true,
              // y_scale_type: 'log',
              color_accessor: 'channel',
              color_type:'category',
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
            });
          }); // end of $()
        });
  });

}); // end define
