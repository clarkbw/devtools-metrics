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

define('DEVTOOLS_PANELS', [], function() {
  return [
    {
      label: 'Inspector',
      color: '#ff9696',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_INSPECTOR_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_INSPECTOR_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Console',
      color: '#ffc265',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_WEBCONSOLE_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_WEBCONSOLE_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Debugger',
      color:  'rgb(104, 108, 74)',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_JSDEBUGGER_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_JSDEBUGGER_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Network',
      color: '#65ffbd',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_NETMONITOR_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_NETMONITOR_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Performance',
      color: '#7ff6ff',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_JSPROFILER_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_JSPROFILER_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Style Editor',
      color: '#b898ca',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_STYLEEDITOR_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_STYLEEDITOR_TIME_ACTIVE_SECONDS'
      }
    }
  ];
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
