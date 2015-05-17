import * as utils from './utils'

function service(config: ServiceConfig, ambient: boolean) {
  console.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`)
  if (!ambient) console.assert(!!config.serviceName, 'you must provide a service name')

  return function(constructor: Function) {
    var module = utils.getModule(config, config.serviceName)

    // Injector function that assigns the injected services to the class.
    injector.$inject = [].concat(config.inject || [], config.injectStatic || [])
    function injector(...injected) {
      var map = utils.zipObject(injector.$inject, injected)
      // Assign injected values to the prototype.
      if (config.inject) {
        config.inject.forEach(token => {
          constructor.prototype[token] = map[token]
        })
      }
      // Assign injected values to the class.
      if (config.injectStatic) {
        config.injectStatic.forEach(token => {
          constructor[token] = map[token]
        })
      }
    }

    // Instantiate the service and assign the injected values.
    module.run(injector)

    // If the context is not ambient, register the factory.
    if (!ambient) module.factory(config.serviceName, function() {return constructor})
  }
}

/**
 * Defines a generic angular service.
 */
export function Service(config: ServiceConfig) {
  return service(config, false)
}

/**
 * Ambient service. We inject it with DI values without exporting the class
 * into the angular DI environment.
 */
export function Ambient(config: BaseConfig) {
  return service(<ServiceConfig>config, true)
}
