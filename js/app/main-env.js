/*global define, requirejs*/
define('app/main-env', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['app/operating-system']);
    // requirejs(['app/tilt-opened-per-user']);
    // requirejs(['app/tilt-time-active']);
  });

}); // end define
