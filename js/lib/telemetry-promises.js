/*global define */
"use strict";

define('TelemetryPromises', ['lodash', 'Telemetry'], function(_, Telemetry) {

  const ALL_CHANNELS = ['nightly', 'aurora', 'beta', 'release'];
  const EARLIEST_VERSION = 39;

  return {

    ALL_CHANNELS: ALL_CHANNELS,
    EARLIEST_VERSION: EARLIEST_VERSION,

    isInitialized: function() {
      return (Telemetry !== null &&
              Telemetry.CHANNEL_VERSION_DATES !== null &&
              Telemetry.CHANNEL_VERSION_BUILDIDS !== null);
    },

    init: function() {
      return new Promise(function(resolve) {
        Telemetry.init(() => {
          return resolve(Telemetry);
        });
      });
    },

    /**
     * Gets all the channels and versions inclusive of the query
     * @param {Object} from - The earlier version to query
     * @param {string} from.channel - The channel of Firefox (nightly, aurora, beta, or release)
     * @param {string} from.version - The version number (int) of Firefox
     * @param {Object} to - The later version to query
     * @param {string} to.channel - The channel of Firefox (nightly, aurora, beta, or release)
     * @param {string} to.version - The version number (int) of Firefox
     */
    getVersions: function(from, to) {
      // The function we call into is mindblowingly dumb
      // best bet is to rewrite it from the ground up
      // https://github.com/mozilla/telemetry-dashboard/blob/master/v2/telemetry.js
      return new Promise((resolve, reject) => {
        if (!this.isInitialized()) {
          return reject('Telemetry must be initialized with the init function');
        }
        if (from.version > to.version) {
          return reject('From version should be less than or equal the to version' +
                        'from.version = ' + from.version + ' and to.version = ' + to.version);
        }
        if (from.version < EARLIEST_VERSION || to.version < EARLIEST_VERSION) {
          return reject('Telemetry is no good before ' + EARLIEST_VERSION + '\n' +
                        'from.version = ' + from.version + ' and to.version = ' + to.version);
        }
        if (ALL_CHANNELS.indexOf(from.channel) < 0 || ALL_CHANNELS.indexOf(to.channel) < 0) {
          return reject('Telemetry only recognizes these channels ' + ALL_CHANNELS + '\n' +
                        'from.channel = ' + from.channel + ' and to.channel = ' + to.channel);
        }
        // aurora, beta would return only aurora and beta
        // while nightly, releaes would return those and all channels between
        var channels = ALL_CHANNELS.slice(ALL_CHANNELS.indexOf(from.channel),
                                          ALL_CHANNELS.indexOf(to.channel) + 1);

        // console.log('from', from.version, 'to', to.version);
        var vFrom = from.version - (4 - channels.length);
        var vTo = to.version + (channels.length - 4);
        var versions = channels.map((channel) => {
          return {
            channel: channel,
            versions: Object.keys(Telemetry.CHANNEL_VERSION_DATES[channel]).filter((version) => {
              var vInt = parseInt(version, 10);
              // console.log(vInt,' >= ', vFrom, ' && ', vInt,' <= ', vTo);
              // console.log('channels', vInt - ((channels.length) - channels.indexOf(channel)));
              return (Telemetry.CHANNEL_VERSION_BUILDIDS[channel] &&
                      Telemetry.CHANNEL_VERSION_BUILDIDS[channel][version] &&
                      (vInt >= vFrom + (channels.length - channels.indexOf(channel)) &&
                       vInt <= vTo + (channels.length - channels.indexOf(channel))));
            })
          };
        });
        return resolve(versions);
      });
    },

    getTargets: function() {
      return new Promise((resolve, reject) => {
        if (!this.isInitialized()) {
          return reject('Telemetry must be initialized with the init function');
        }
        this.getLatestVersion('nightly').then(function(lastestVersion) {
          // order matters in the ALL_CHANNELS list, needs to go from nightly up
          var targets = ALL_CHANNELS.map((channel) => {
            var version = lastestVersion;
            lastestVersion = lastestVersion - 1;
            return {
              channel: channel,
              versions: [(version - 2)+'', (version - 1)+'', version+'']
            };
          });
          return resolve(targets);
        });
      });
    },

    /**
     * Gets the latest released version number available for the channel
     * @param {string} channel - The channel of Firefox (nightly, aurora, beta, or release)
     */
    getLatestVersion: function(channel) {
      return new Promise((resolve, reject) => {
        if (!this.isInitialized()) {
          return reject('Telemetry must be initialized with the init function');
        }
        if (ALL_CHANNELS.indexOf(channel) < 0) {
          return reject('Telemetry only recognizes these channels ' + ALL_CHANNELS + '\n' +
                        'channel = ' + channel);
        }
        var releases = Object.keys(Telemetry.CHANNEL_VERSION_BUILDIDS[channel]);
        return resolve(releases[releases.length - 1]);
      });
    },

    /**
     * Returns a Telemetry Historgram
     * https://github.com/mozilla/telemetry-dashboard/blob/master/v2/doc.md#telemetrygethistograminfochannel-version-metric-usesubmissiondate-function-callbackkind-description-buckets-dates---
     * @param {string} channel - The channel of Firefox (nightly, aurora, beta, or release)
     * @param {string} version - The version (int) of Firefox 40, 44, 45
     * @param {string} metric - The Telemtry metric to query e.g. DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS
     * @param {object} options - Options that
     */
    getHistogramInfo: function(channel, version, metric, options) {
      options = _.defaults(options, {
        useSubmissionDate: true
      });
      return new Promise((resolve, reject) => {
        if (!this.isInitialized()) {
          return reject('Telemetry must be initialized with the init function');
        }
        if (ALL_CHANNELS.indexOf(channel) < 0) {
          return reject('Telemetry only recognizes these channels ' + ALL_CHANNELS + '\n' +
                        'channel = ' + channel);
        }
        if (metric === undefined) {
          return reject('Telemetry metrics like DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS are required');
        }
        Telemetry.getHistogramInfo(channel, version, metric, options.useSubmissionDate,
          (kind, description, buckets, dates) => {
            // if (_.isEmpty(evo)) { return reject(); }
            return resolve(kind, description, buckets, dates);
          });
      });
    },

    /**
     * Returns a Telemetry Evolution
     * https://github.com/mozilla/telemetry-dashboard/blob/master/v2/doc.md#telemetrygetevolutionchannel-version-metric-filters-usesubmissiondate-function-callbackevolutionmap---
     * @param {string} channel - The channel of Firefox (nightly, aurora, beta, or release)
     * @param {string} version - The version (int) of Firefox 40, 44, 45
     * @param {string} metric - The Telemtry metric to query e.g. DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS
     * @param {object} options - Options that
     */
    getEvolution: function(channel, version, metric, options) {
      options = _.defaults(options, {
        filters: {},
        useSubmissionDate: true,
        sanitized: false
      });
      return new Promise((resolve, reject) => {
        if (!this.isInitialized()) {
          return reject('Telemetry must be initialized with the init function');
        }
        if (ALL_CHANNELS.indexOf(channel) < 0) {
          return reject('Telemetry only recognizes these channels ' + ALL_CHANNELS + '\n' +
                        'channel = ' + channel);
        }
        if (metric === undefined) {
          return reject('Telemetry metrics like DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS are required');
        }
        Telemetry.getEvolution(channel, version, metric,
          options.filters, options.useSubmissionDate,
          (evo) => {
            if (_.isEmpty(evo)) { return reject(); }
            evo = evo[""];
            if (options.sanitized) {
              evo = evo.sanitized();
            }
            return resolve(evo);
          });
      });
    },

    /**
     * Sugar function that accepts an array of versions and uses Promise.all(getEvolution)
     * @param {string} channel - The channel of Firefox (nightly, aurora, beta, or release)
     * @param {Array|string} versions - The version (int) of Firefox 40, 44, 45
     * @param {string} metric - The Telemtry metric to query e.g. DEVTOOLS_TOOLBOX_TIME_ACTIVE_SECONDS
     * @param {object} options - Options that
     */
    getEvolutions: function(channel, versions, metric, options) {
      return Promise.all(versions.map((version) => {
        return this.getEvolution(channel, version, metric, options).then(function (evo) {
          return evo;
        }).catch(function () {
          return null;
        });
      }))
    },

    reduceEvolutions: function(evolutions) {
      evolutions = _.compact(evolutions);
      if (_.isEmpty(evolutions)) {
        return [];
      }
      return evolutions.reduce(function(prev, curr) {
        return prev.combine(curr);
      });
    }

  };

});
