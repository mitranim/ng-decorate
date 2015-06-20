'use strict';

import * as utils from './utils';

/**
 * Shared directive definition logic.
 */
function directive(config: lib.DirectiveConfig) {
  return function(constructor: lib.ControllerClass) {
    var module = utils.getModule(config, config.selector);
    var directiveName = utils.camelCase(config.selector);

    /**
     * Transfer properties.
     */
    config.controller = constructor;
    if (constructor[utils.scopeKey]) config.scope = constructor[utils.scopeKey];
    // Link functions must be cloned because angular mutates them with `require`
    // annotations, then relies on those annotations for injection.
    if (typeof constructor.link === 'function') {
      config.link = utils.cloneFunction(constructor.link);
    }
    // Cloning other functions just in case.
    if (typeof constructor.compile === 'function') {
      config.compile = utils.cloneFunction(constructor.compile);
    }
    if (typeof constructor.template === 'function') {
      config.template = utils.cloneFunction(<Function>constructor.template);
    } else if (typeof constructor.template === 'string') {
      config.template = constructor.template;
    }
    if (typeof constructor.templateUrl === 'function') {
      config.templateUrl = utils.cloneFunction(<Function>constructor.templateUrl);
    } else if (typeof constructor.templateUrl === 'string') {
      config.templateUrl = constructor.templateUrl;
    }

    var inject = [].concat(config.inject || [], constructor.prototype[utils.autoinjectKey] || []);
    var injectStatic = [].concat(config.injectStatic || [], constructor[utils.autoinjectKey] || []);

    // Directive function that assigns the injected services to the constructor.
    definition.$inject = inject.concat(injectStatic);
    function definition(...injected) {
      var map = utils.zipObject(definition.$inject, injected);
      // Assign injected values to the prototype.
      inject.forEach(token => {
        constructor.prototype[token] = map[token];
      });
      // Assign injected values to the class.
      injectStatic.forEach(token => {
        constructor[token] = map[token];
      });
      return config;
    }

    // Register the directive.
    module.directive(directiveName, definition);
  }
}

/**
 * Defines an angular component (custom element).
 */
export function Component(config: lib.DirectiveConfig) {
  utils.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`);
  utils.assert(!!config.selector, 'you must provide a selector');

  var selector = utils.kebabCase(config.selector);

  var directiveConfig: lib.DirectiveConfig = {
    selector: config.selector,
    restrict: 'E',
    scope: {},
    controllerAs: utils.defaults.controllerAs,
    bindToController: true
  }
  if (config.template == null && config.templateUrl === undefined) {
    directiveConfig.templateUrl = utils.defaults.makeTemplateUrl(selector);
  }

  angular.extend(directiveConfig, config);

  return directive(directiveConfig);
}

/**
 * Defines an attribute directive.
 */
export function Attribute(config: lib.DirectiveConfig) {
  utils.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`);
  utils.assert(!!config.selector, 'you must provide a selector');

  var directiveConfig: lib.DirectiveConfig = {
    selector: config.selector,
    restrict: 'A',
    scope: false
  }

  angular.extend(directiveConfig, config);

  return directive(directiveConfig);
}
