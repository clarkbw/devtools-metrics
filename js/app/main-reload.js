/*global define, requirejs*/
define('app/main-reload', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['app/reload-addon-installed']);
    requirejs(['app/reload-addon-installed-per-user']);
    requirejs(['app/reload-addon-reloaded']);
    requirejs(['app/reload-addon-reloaded-per-user']);

  });

}); // end define
