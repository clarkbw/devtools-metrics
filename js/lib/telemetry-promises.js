/*global define */
"use strict";

define('TelemetryPromises', ['jquery', 'moment', 'Telemetry'], function($, moment, Telemetry) {

  const ALL_CHANNELS = ['nightly', 'aurora', 'beta', 'release'];

  function FakeEvolution() { }
  FakeEvolution.prototype.combine = function(other) {
    return other;
  }
  FakeEvolution.prototype.sanitized = function() {}
  FakeEvolution.prototype.map = function() {
    return [];
  }

  return {

    getTargets: function() {
      var lastestVersion = this.getLatestVersion('nightly');

      // order matters in the ALL_CHANNELS list, needs to go from nightly up
      var targets = ALL_CHANNELS.map((channel) => {
        var version = lastestVersion;
        lastestVersion = lastestVersion - 1;
        return {
          channel: channel,
          versions: [(version - 2)+'', (version - 1)+'', version+'']
        };
      });
      return targets;
    },

    getLatestVersion: function(channel) {
      if (ALL_CHANNELS.indexOf(channel) < 0) {
        return -1;
      }
      if (!this.initialized()) {
        return -1;
      }
      var releases = Object.keys(Telemetry.CHANNEL_VERSION_BUILDIDS[channel]);
      return (releases[releases.length - 1]);
    },

    initialized: function() {
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

    getSanitizedEvolutions: function(probe, channel, versions) {
      console.log('getSanitizedEvolutions', probe, channel, versions);
      return Promise.all(versions.map(function(version) {
        return new Promise(function(resolve, reject) {
          Telemetry.getEvolution(channel, version + '', probe, {}, true, function(evo) {
            if ($.isEmptyObject(evo)) { return resolve(new FakeEvolution()); }
            if (evo === null) { return resolve(new FakeEvolution()); }
            return resolve(evo[""].sanitized());
          });
        });
      }))
    },

    reduceEvolutions: function(evolutions) {
      if (evolutions === null) { return []; }
      return evolutions.reduce(function(prev, curr) {
        return prev.combine(curr);
      });
    },

    flattenEvolutionsArray: function(data) {
      console.log('flattenEvolutionsArray', data);
      return data.reduce(function(prev, curr) {
        return prev.concat(curr);
      }, []);
    }

  };

});
