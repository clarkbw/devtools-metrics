/*global define, requirejs*/
define('app/main-panels', ['jquery', 'moment', 'TelemetryPromises'], function($, moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['app/panels-opened', 'app/panels-time-active'], function (po, pta) {
      po.graph('beta');
      pta.graph('beta');
      $('.channel-controls > button').on('click', function() {
        $(this).addClass('active').siblings().removeClass('active');
        po.graph($(this).data('y_accessor'));
        pta.graph($(this).data('y_accessor'));
      });
    });
  });

}); // end define
