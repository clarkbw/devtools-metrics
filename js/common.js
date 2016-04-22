/*global requirejs, define*/
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
      'DevToolsMetrics': 'lib/devtools-metrics',
      'text': 'lib/require/text',
      'json': 'lib/require/json'
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
      color: '#4C9ED9',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_INSPECTOR_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_INSPECTOR_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Console',
      color: '#F13C00',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_WEBCONSOLE_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_WEBCONSOLE_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Debugger',
      color:  '#D97E00',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_JSDEBUGGER_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_JSDEBUGGER_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Network',
      color: '#2CBB51',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_NETMONITOR_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_NETMONITOR_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Performance',
      color: '#B4DEFD',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_JSPROFILER_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_JSPROFILER_TIME_ACTIVE_SECONDS'
      }
    },
    {
      label: 'Style Editor',
      color: '#B2B2B2',
      metric: {
        opened_per_user_flag: 'DEVTOOLS_STYLEEDITOR_OPENED_PER_USER_FLAG',
        time_active: 'DEVTOOLS_STYLEEDITOR_TIME_ACTIVE_SECONDS'
      }
    }
  ];
});

define('FIREFOX_RELEASES',
['json!https://crash-stats.mozilla.com/api/ProductVersions/?product=Firefox&build_type=release&start_date=%3E2013-12-31'],
function({hits:data}) {
  var TOO_OLD = new Date('2013-12-31');
  var FULL_RELEASE = /\.0$/g;
  var FIREFOX_RELEASES = data
  .filter((d) => (d.build_type == 'release' && d.version.match(FULL_RELEASE) !== null))
  .map(function(d) {
    d.date = new Date(d['start_date']);
    d.version = parseInt(d.version.split('.')[0], 10);
    d.label = 'release ' + d.version;
    return d;
  })
  .filter(function(d) {
      return d['date'] > TOO_OLD;
  });

  return {
    colors: {
      nightly: '#002147',
      aurora: '#0095DD',
      beta: '#FFCB00',
      release: '#E66000'
    },
    release: FIREFOX_RELEASES,
    beta: FIREFOX_RELEASES.map((release) => {
      var version = release.version + 1;
      return {
        version: version,
        date: release.date,
        label: 'beta ' + version
      };
    }),
    aurora: FIREFOX_RELEASES.map((release) => {
      var version = release.version + 2;
      return {
        version: version,
        date: release.date,
        label: 'DevEdition ' + version
      };
    }),
    nightly: FIREFOX_RELEASES.map((release) => {
      var version = release.version + 3;
      return {
        version: version,
        date: release.date,
        label: 'nightly ' + version
      };
    })
  };
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
