/*global define, requirejs*/
define('app/main-tilt', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['lib/telemetry/count', 'lib/telemetry/opened-per-user-flag'],
    function (tc, opu) {
      tc.graph(
        'DEVTOOLS_TILT_OPENED_BOOLEAN',
        'devtools-tilt-opened-chart', {
          title: 'Tilt Opened Per User / Day (DAU)',
          description: 'Telemetry numbers report how many times users have opened the DevTools tilt feature in the day.'
        }, { sanitized: false });
      opu.graph(
        'DEVTOOLS_TILT_OPENED_PER_USER_FLAG',
        'devtools-tilt-opened-per-user-chart', {
          title: 'Tilt Opened per User / Release (MAU)',
          description: 'Telemetry numbers report a user who has opened the DevTools tilt since the last release. (RAU)'
        });
        // TODO: engagement ratio?
    });
    requirejs(['lib/telemetry/time-active-seconds'],function (tac) {
      tac.graph(
        'DEVTOOLS_TILT_TIME_ACTIVE_SECONDS',
        'devtools-tilt-time-active-chart', {
          title: 'DevTools Tilt Active Time Spent',
          least_squares: false
        });
    });
  });

}); // end define
