/*global define, requirejs*/
define('app/main-index', ['moment', 'TelemetryPromises'], function(moment, TelemetryPromises) {

  // show 'a min' for least amount of time
  moment.relativeTimeThreshold('s', -1);
  // prevent 50 min from showing up as 'an hour'
  moment.relativeTimeThreshold('m', 59);

  TelemetryPromises.init().then(() => {
    requirejs(['app/empty-graphs']);
    requirejs(['app/toolbox-opened', 'app/toolbox-opened-per-user', 'app/toolbox-engagement-ratio'],
    function(dau, mau, engaged) {
      Promise.all([dau, mau]).then((datas) => {
        //      dau,      mau
        engaged(datas[0], datas[1]);
      });
    });
    requirejs(['app/toolbox-time-active']);
  });

}); // end define
