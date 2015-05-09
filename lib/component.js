'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Defines an angular component (custom element).
 */
exports.Component = Component;

var _utils = require('./utils');

function Component(config) {
  if (!config) {
    throw new Error('expected module definition config, got: ' + config);
  }

  return function (constructor) {
    // Retrieve the angular module used to define the directive.
    var module = _utils.getModule(constructor, config);

    // Transfer static methods from the constructor class onto the configuration
    // object.
    if (constructor.template) config.template = constructor.template;
    if (constructor.compile) config.compile = constructor.compile;
    if (constructor.link) config.link = constructor.link;

    // Define the controller, decorating it with the $inject array, if provided.
    if (config.$inject) constructor.$inject = config.$inject;
    config.controller = constructor;

    // Base name used for directive definition.
    var directiveName = _utils.getName(constructor, config);

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
        templateUrl: '' + _utils.kebabCase(directiveName) + '/' + _utils.kebabCase(directiveName) + '.html',
        controllerAs: 'ctrl',
        bindToController: true
      }, config);
    }

    // Run the definition.
    module.directive(_utils.getName(constructor, config), definition);
  };
}