'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Defines a generic angular service.
 */
exports.Service = Service;

var _utils = require('./utils');

function Service(config) {
  if (!config) {
    throw new Error('expected module definition config, got: ' + config);
  }

  return function (constructor) {
    // Retrieve the angular module used to define the service.
    var module = _utils.getModule(constructor, config);

    // Decorate the constructor with the `$inject` annotation, if provided.
    if (config.$inject) constructor.$inject = config.$inject;

    // Deduce the name to use for the service.
    var serviceName = _utils.getName(constructor, config);

    // Create a definition function with DI annotations for static injection.
    definition.$inject = config.inject instanceof Array ? config.inject : [];
    function definition() {
      // Assign the injected services as static properties.
      angular.forEach(arguments, function (value, index) {
        constructor[definition.$inject[index]] = value;
      });
      // Return the result.
      return constructor;
    }

    // Run the definition.
    module.factory(serviceName, definition);

    // Force angular to instantiate the service.
    module.run([serviceName, function () {}]);
  };
}