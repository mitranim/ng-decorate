import * as utils from './utils'

/**
 * Defines a generic angular service.
 */
export function Service(config: ServiceConfig) {
  console.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`)
  console.assert(!!config.serviceName, 'you must provide a service name')

  return function(constructor: Function) {
    var module = utils.getModule(config, config.serviceName)

    // Factory function that assigns the injected services to the constructor.
    definition.$inject = config.inject instanceof Array ? config.inject : []
    function definition(...args) {
      definition.$inject.forEach((token, index) => {
        constructor[token] = args[index]
      })
      return constructor
    }

    // Register the factory.
    module.factory(config.serviceName, definition)

    // Force angular to instantiate the service.
    module.run([config.serviceName, function noop() {}])
  }
}
