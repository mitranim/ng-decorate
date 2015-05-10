'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Defines an angular component (custom element).
 */
exports.Component = Component;

/**
 * Defines an attribute directive.
 */
exports.Attribute = Attribute;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

/**
 * Shared directive definition logic.
 */
function Directive(config) {
  return function (constructor) {
    var module = utils.getModule(config, config.selector);
    var directiveName = utils.camelCase(config.selector);

    // Transfer properties.
    config.controller = constructor;
    if (constructor.template) config.template = constructor.template;
    if (constructor.templateUrl) config.templateUrl = constructor.templateUrl;
    if (constructor.link) config.link = constructor.link;
    if (constructor.compile) config.compile = constructor.compile;

    // Directive function that assigns the injected services to the constructor.
    definition.$inject = config.inject instanceof Array ? config.inject : [];
    function definition() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      definition.$inject.forEach(function (token, index) {
        constructor[token] = args[index];
      });
      return config;
    }

    // Register the directive.
    module.directive(directiveName, definition);
  };
}
function Component(config) {
  console.assert(config != null && typeof config === 'object', 'expected a configuration object, got: ' + config);
  console.assert(!!config.selector, 'you must provide a selector');

  var selector = utils.kebabCase(config.selector);

  var directiveConfig = {
    selector: config.selector,
    restrict: 'E',
    scope: {},
    controllerAs: 'self',
    bindToController: true,
    templateUrl: '' + selector + '/' + selector + '.html'
  };

  angular.extend(directiveConfig, config);

  return Directive(directiveConfig);
}

function Attribute(config) {
  console.assert(config != null && typeof config === 'object', 'expected a configuration object, got: ' + config);
  console.assert(!!config.selector, 'you must provide a selector');

  var directiveConfig = {
    selector: config.selector,
    restrict: 'A',
    scope: false
  };

  angular.extend(directiveConfig, config);

  return Directive(directiveConfig);
}