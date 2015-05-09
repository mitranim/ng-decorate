System.register(['./utils'], function (_export) {
  var getModule, getName;

  _export('Service', Service);

  /**
   * Defines a generic angular service.
   */

  function Service(config) {
    if (!config) {
      throw new Error('expected module definition config, got: ' + config);
    }

    return function (constructor) {
      // Retrieve the angular module used to define the service.
      var module = getModule(constructor, config);

      // Decorate the constructor with the `$inject` annotation, if provided.
      if (config.$inject) constructor.$inject = config.$inject;

      // Deduce the name to use for the service.
      var serviceName = getName(constructor, config);

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

  return {
    setters: [function (_utils) {
      getModule = _utils.getModule;
      getName = _utils.getName;
    }],
    execute: function () {
      'use strict';
    }
  };
});