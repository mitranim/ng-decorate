System.register(['./utils'], function (_export) {
  var getModule, getName, kebabCase;

  _export('Component', Component);

  /**
   * Defines an angular component (custom element).
   */

  function Component(config) {
    if (!config) {
      throw new Error('expected module definition config, got: ' + config);
    }

    return function (constructor) {
      // Retrieve the angular module used to define the directive.
      var module = getModule(constructor, config);

      // Transfer static methods from the constructor class onto the configuration
      // object.
      if (constructor.template) config.template = constructor.template;
      if (constructor.compile) config.compile = constructor.compile;
      if (constructor.link) config.link = constructor.link;

      // Define the controller, decorating it with the $inject array, if provided.
      if (config.$inject) constructor.$inject = config.$inject;
      config.controller = constructor;

      // Base name used for directive definition.
      var directiveName = getName(constructor, config);

      // Create a definition function with DI annotations for static injection.
      definition.$inject = config.inject instanceof Array ? config.inject : [];
      function definition() {
        // Assign the injected services as static properties.
        angular.forEach(arguments, function (value, index) {
          constructor[definition.$inject[index]] = value;
        });

        // Produce the enhanced directive definition.
        return angular.extend({
          restrict: 'E',
          scope: {},
          templateUrl: '' + kebabCase(directiveName) + '/' + kebabCase(directiveName) + '.html',
          controllerAs: 'ctrl',
          bindToController: true
        }, config);
      }

      // Run the definition.
      module.directive(getName(constructor, config), definition);
    };
  }

  return {
    setters: [function (_utils) {
      getModule = _utils.getModule;
      getName = _utils.getName;
      kebabCase = _utils.kebabCase;
    }],
    execute: function () {
      'use strict';
    }
  };
});