'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Defines a generic angular service.
 */
exports.Service = Service;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function Service(config) {
  console.assert(config != null && typeof config === 'object', 'expected a configuration object, got: ' + config);
  console.assert(!!config.serviceName, 'you must provide a service name');

  return function (constructor) {
    var module = utils.getModule(config, config.serviceName);

    // Factory function that assigns the injected services to the constructor.
    definition.$inject = config.inject instanceof Array ? config.inject : [];
    function definition() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      definition.$inject.forEach(function (token, index) {
        constructor[token] = args[index];
      });
      return constructor;
    }

    // Register the factory.
    module.factory(config.serviceName, definition);

    // Force angular to instantiate the service.
    module.run([config.serviceName, function noop() {}]);
  };
}