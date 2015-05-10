import * as utils from './utils'

/**
 * Shared directive definition logic.
 */
function Directive(config: DirectiveConfig) {
  return function(constructor: Controller) {
    var module = utils.getModule(config, config.selector)
    var directiveName = utils.camelCase(config.selector)

    // Transfer properties.
    config.controller = constructor
    if (constructor.template) config.template = constructor.template
    if (constructor.templateUrl) config.templateUrl = constructor.templateUrl
    if (constructor.link) config.link = constructor.link
    if (constructor.compile) config.compile = constructor.compile
    
    // Directive function that assigns the injected services to the constructor.
    definition.$inject = config.inject instanceof Array ? config.inject : []
    function definition(...args) {
      definition.$inject.forEach((token, index) => {
        constructor[token] = args[index]
      })
      return config
    }

    // Register the directive.
    module.directive(directiveName, definition)
  }
}

/**
 * Defines an angular component (custom element).
 */
export function Component(config: DirectiveConfig) {
  console.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`)
  console.assert(!!config.selector, 'you must provide a selector')
  
  var selector = utils.kebabCase(config.selector)
  
  var directiveConfig: DirectiveConfig = {
    selector: config.selector,
    restrict: 'E',
    scope: {},
    controllerAs: 'self',
    bindToController: true,
    templateUrl: `${selector}/${selector}.html`
  }
  
  angular.extend(directiveConfig, config)
  
  return Directive(directiveConfig)
}

/**
 * Defines an attribute directive.
 */
export function Attribute(config: DirectiveConfig) {
  console.assert(config != null && typeof config === 'object', `expected a configuration object, got: ${config}`)
  console.assert(!!config.selector, 'you must provide a selector')
  
  var directiveConfig: DirectiveConfig = {
    selector: config.selector,
    restrict: 'A',
    scope: false
  }
  
  angular.extend(directiveConfig, config)
  
  return Directive(directiveConfig)
}
