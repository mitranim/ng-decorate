import {getModule, getName} from './utils'

/**
 * Defines a generic angular service.
 */
export function Service(config: ServiceConfig) {
  if (!config) {
    throw new Error(`expected module definition config, got: ${config}`)
  }

  return function(constructor: Function) {
    // Retrieve the angular module used to define the service.
    var module = getModule(constructor, config)

    // Decorate the constructor with the `$inject` annotation, if provided.
    if (config.$inject) constructor.$inject = config.$inject

    // Deduce the name to use for the service.
    var serviceName = getName(constructor, config)

    // Create a definition function with DI annotations for static injection.
    definition.$inject = config.inject instanceof Array ? config.inject : []
    function definition() {
      // Assign the injected services as static properties.
      angular.forEach(arguments, (value, index) => {
        constructor[definition.$inject[index]] = value
      })
      // Return the result.
      return constructor
    }

    // Run the definition.
    module.factory(serviceName, definition)

    // Force angular to instantiate the service.
    module.run([serviceName, () => {}])
  }
}
