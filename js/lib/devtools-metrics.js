/*global define*/
define('DevToolsMetrics', ['jquery', 'MG', 'moment', 'd3', 'lodash', 'FIREFOX_RELEASES'],
function($, MG, moment, d3, _, FIREFOX_RELEASES) {
  var DEFAULTS = {
    title: '',
    description: '',
    chart_type: 'missing-data',
    full_width: true
  };
  return {
    progress: function(ID, total, current) {
      $(function() {
        var $progress = $('#' + ID + '-progress');
        var percent = Math.abs(Math.round(100 * ((current / total) - 1)));

        if (!$progress.hasClass('progress')) {
          // create
          $progress.addClass('progress').append(
            $('<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"/>')
          );
        }
        $progress.find('.progress-bar').attr('aria-valuenow', percent).css('width', percent + '%');
        if (percent === 100) {
          $progress.fadeOut();
        }
      });
    },
      point: function(ID, options) {
        options = _.defaults(options, {
          least_squares: true,
          missing_is_hidden: true,
          missing_is_zero: false,
          interpolate: 'basic',
          width: 335,
          height: 320,
          left: 60,
          animate_on_load: true,
          target: '#' + ID,
          yax_format: function(d) {
            return moment.duration(d, 'minutes').humanize();
          },
          markers: FIREFOX_RELEASES.beta,
          y_extended_ticks: true,
          color_accessor: 'channel',
          color_type:'category',
          size_accessor:'submissions',
          x_accessor: 'date',
          y_accessor: 'value',
          mouseover: function(d) {
            var format = d3.format(',');
            d3.select('#' + ID + ' svg .mg-active-datapoint')
                .text(d.point[options.color_accessor] + ' : ' +
                format(d.point.submissions) + ' active for ' +
                moment.duration(d.point.value, 'minutes').humanize());
            }
          },
          DEFAULTS);

        // when data is passed along we set the chart to the right type
        if (options.data && !_.isEmpty(options.data)) {
          options.chart_type = 'point';
        }
        $(function() {
          MG.data_graphic(options);
        });

      },
      line: function(ID, options) {
        options = _.defaults(options, {
          least_squares: true,
          missing_is_hidden: true,
          missing_is_zero: false,
          interpolate: 'basic',
          width: 335,
          height: 320,
          left: 60,
          animate_on_load: true,
          target: '#' + ID,
          markers: FIREFOX_RELEASES.beta,
          y_extended_ticks: true,
          aggregate_rollover: true,
          x_accessor: 'date',
          y_accessor: 'value',
          legend_target: '#' + ID + '-legend'
          },
          DEFAULTS);

        // when data is passed along we set the chart to the right type
        if (options.data && !_.isEmpty(options.data)) {
          delete options.chart_type;
        }

        $(function() {
          MG.data_graphic(options);
        });

      }
  };



}); // end define
