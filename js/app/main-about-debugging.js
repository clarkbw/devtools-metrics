/*global define, requirejs*/
define('app/main-about-debugging', ['moment', 'TelemetryPromises', 'FIREFOX_RELEASES'],
function(moment, TelemetryPromises, FIREFOX_RELEASES) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    var markers = FIREFOX_RELEASES.aurora;
    markers.push({
      date: new Date('2016-03-10'),
      label: 'Hacks Post [1]'
    });
    markers.push({
      date: new Date('2016-04-30'),
      label: 'Hacks Post [2]'
    });

    requirejs(['lib/telemetry/count', 'lib/telemetry/opened-per-user-flag'],
    function (tc, opu) {
      tc.graph(
        'DEVTOOLS_ABOUTDEBUGGING_OPENED_COUNT',
        'devtools-about-debugging-opened-chart', {
          title: 'about:debugging opened count',
          markers: markers
        });
      opu.graph(
        'DEVTOOLS_ABOUTDEBUGGING_OPENED_PER_USER_FLAG',
        'devtools-about-debugging-opened-per-user-chart', {
          title: 'about:debugging opened per user',
          markers: markers
        });
        // TODO: engagement ratio?
    });
    requirejs(['lib/telemetry/time-active-seconds'],function (tac) {
      tac.graph(
        'DEVTOOLS_ABOUTDEBUGGING_TIME_ACTIVE_SECONDS',
        'devtools-about-debugging-time-active-chart',
        {markers: markers},
        {least_squares: false}); // don't show the trend line for now
    });
  });

}); // end define
