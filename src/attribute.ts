import {getModule, getName} from './utils'

/**
 * Defines an angular attribute directive.
 */
export function Attribute(config: DirectiveConfig) {
  if (!config) {
    throw new Error(`expected module definition config, got: ${config}`)
  }

  return function(constructor: Function) {
    // Retrieve the angular module used to define the directive.
    var module = getModule(constructor, config)

    // Transfer static methods from the constructor class onto the configuration
    // object.
    if (constructor.template) config.template = constructor.template
    if (constructor.compile) config.compile = constructor.compile
    if (constructor.link) config.link = constructor.link

    // Define the controller, decorating it with the $inject array, if provided.
    if (config.$inject) constructor.$inject = config.$inject
    config.controller = constructor

    // Create a definition function with DI annotations for static injection.
    definition.$inject = config.inject instanceof Array ? config.inject : []
    function definition() {
      // Assign the injected services as static properties.
      angular.forEach(arguments, (value, index) => {
        constructor[definition.$inject[index]] = value
      })

      // Produce the enhanced directive definition.
      return angular.extend({
        restrict: 'A',
        scope: false,
        bindToController: true
      }, config)
    }

    // Run the definition.
    module.directive(getName(constructor, config), definition)
  }
}
