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
      'TelemetryPromises': 'lib/telemetry-promises'
    },
    shim: {
      'Telemetry': {
          exports: 'Telemetry'
      }
    }
});

define('FIREFOX_RELEASES', [], function() {
  var TOO_OLD = new Date('2013-12-31');
  return FIREFOX_RELEASES.map(function(d) {
    d['date'] = new Date(d['date']);
    d['label'] = 'release ' + d['version'];
    return d;
  })
  .filter(function(d) {
      return d['date'] > TOO_OLD;
  });
});

// Load the main app module to start the app
requirejs(['app/main']);
