/*global define, requirejs*/
define('app/main-panels', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['app/panels-opened']);
    requirejs(['app/panels-time-active']);
  });

}); // end define
