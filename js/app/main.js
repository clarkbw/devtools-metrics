/*global define, requirejs*/
define('app/main', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['app/empty-graphs']);
    requirejs(['app/toolbox-opened']);
    requirejs(['app/toolbox-opened-per-user']);
    requirejs(['app/toolbox-time-active']);
    requirejs(['app/panels-opened']);
    requirejs(['app/panels-time-active']);
  });

  define('LatestVersions', ['TelemetryPromises'], function(TelemetryPromises) {
    var FROM_CHANNEL = 'nightly',
        TO_CHANNEL = 'release';
    return {
      getLatestVersion:  function() {
        return TelemetryPromises.getLatestVersion(TO_CHANNEL).then((version) => {
              var f = { channel: FROM_CHANNEL, version: (version - 6)},
                  t = { channel: TO_CHANNEL, version: (version - 1)};
                  return TelemetryPromises.getVersions(f, t);
        });
      }
    };

  });

}); // end define
