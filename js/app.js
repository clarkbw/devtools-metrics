/*global requirejs, define, FIREFOX_RELEASES*/
requirejs.config({
    'paths': {
      // 'app': '../app',
      'jquery': '//code.jquery.com/jquery-1.12.0.min',
      'lodash': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.5.1/lodash.min',
      'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.0/d3',
      'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment',
      'MG': 'lib/metricsgraphics',
      'Telemetry': '//telemetry.mozilla.org/v2/telemetry',
      'TelemetryPromises': 'lib/telemetry-promises',
      'DevToolsMetrics': 'lib/devtools-metrics'
    },
    shim: {
      'Telemetry': {
          exports: 'Telemetry'
      }
    }
});

define('FIREFOX_RELEASES', [], function() {
  var TOO_OLD = new Date('2013-12-31');
  FIREFOX_RELEASES = FIREFOX_RELEASES.map(function(d) {
    d['date'] = new Date(d['date']);
    d['label'] = 'release ' + d['version'];
    return d;
  })
  .filter(function(d) {
      return d['date'] > TOO_OLD;
  });
  return {
    release: FIREFOX_RELEASES,
    beta: FIREFOX_RELEASES.map((release) => {
      var version = parseInt(release.version, 10) + 1;
      return {
        version: version,
        date: release.date,
        label: 'beta ' + version
      };
    }),
    aurora: FIREFOX_RELEASES.map((release) => {
      var version = parseInt(release.version, 10) + 2;
      return {
        version: version,
        date: release.date,
        label: 'DevEdition ' + version
      };
    }),
    nightly: FIREFOX_RELEASES.map((release) => {
      var version = parseInt(release.version, 10) + 3;
      return {
        version: version,
        date: release.date,
        label: 'nightly ' + version
      };
    })
  };
});

// Load the main app module to start the app
requirejs(['app/main']);
