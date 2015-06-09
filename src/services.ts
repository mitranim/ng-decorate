import * as utils from './utils';

function service(config: lib.ServiceConfig, ambient: boolean) {
  console.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`);
  if (!ambient) console.assert(!!config.serviceName, 'you must provide a service name');

  return function(constructor: Function) {
    var module = utils.getModule(config, config.serviceName);

    var inject = [].concat(config.inject || [], constructor.prototype[utils.autoinjectKey] || []);
    var injectStatic = [].concat(config.injectStatic || [], constructor[utils.autoinjectKey] || []);

    // Injector function that assigns the injected services to the class.
    injector.$inject = inject.concat(injectStatic);
    function injector(...injected) {
      var map = utils.zipObject(injector.$inject, injected);
      // Assign injected values to the prototype.
      inject.forEach(token => {
        constructor.prototype[token] = map[token];
      });
      // Assign injected values to the class.
      injectStatic.forEach(token => {
        constructor[token] = map[token];
      });
    }

    // Instantiate the service and assign the injected values.
    module.run(injector);

    // If the context is not ambient, register the factory.
    if (!ambient) module.factory(config.serviceName, function() {return constructor});
  }
}

/**
 * Defines a generic angular service.
 */
export function Service(config: lib.ServiceConfig) {
  return service(config, false);
}

/**
 * Polymorphic version of Ambient. Example:
 *   @Ambient
 *   class VM {
 *     @autoinject $http;
 *   }
 */
export function Ambient(configOrClass: any) {
  if (typeof configOrClass === 'function') {
    return AmbientBase({}).apply(null, arguments);
  }
  return AmbientBase.apply(null, arguments);
}

/**
 * Ambient service. We inject it with DI values without exporting the class
 * into the angular DI environment.
 */
function AmbientBase(config: lib.BaseConfig) {
  return service(<lib.ServiceConfig>config, true);
}
