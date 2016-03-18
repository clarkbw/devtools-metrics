/*global define, requirejs*/
define('app/main-about-debugging', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['lib/telemetry/count', 'lib/telemetry/opened-per-user-flag'],
    function (tc, opu) {
      tc.graph(
        'DEVTOOLS_ABOUTDEBUGGING_OPENED_COUNT',
        'devtools-about-debugging-opened-chart', {
          title: 'about:debugging opened count'
        });
      opu.graph(
        'DEVTOOLS_ABOUTDEBUGGING_OPENED_PER_USER_FLAG',
        'devtools-about-debugging-opened-per-user-chart', {
          title: 'about:debugging opened per user'
        });
    });
  });

}); // end define
