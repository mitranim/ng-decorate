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
    definition.$inject = [].concat(config.inject || [], config.injectStatic || [])
    function definition(...injected) {
      var map = utils.zipObject(definition.$inject, injected)
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
      return constructor
    }

    // Register the factory.
    module.factory(config.serviceName, definition)

    // Force angular to instantiate the service.
    module.run([config.serviceName, function noop() {}])
  }
}
