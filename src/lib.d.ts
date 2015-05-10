/******************************** Third Party ********************************/

declare var angular: ng.IAngularStatic

interface Function {
  name: string
  template?: Function
  templateUrl?: Function
  compile?: Function
  link?: Function
}

/********************************** Public ***********************************/
 
// TODO consider publishing the definitions.
declare module 'ng-decorate' {
  export function Attribute(config: DirectiveConfig)
  export function Component(config: DirectiveConfig)
  export function Service(config: ServiceConfig)
}

/********************************** Private ***********************************/

interface BaseConfig {
  // Generic name for directive / service / module.
  name?: string

  // Selector string for directive definitions.
  selector?: string

  // Angular module object. If this is provided, no new module will be declared.
  module?: ng.IModule

  // Module name prefix. Used to namespace modules. Can be used in conjunction
  // with module name inference, omitting other module options.
  modulePrefix?: string

  // Module dependencies. Used to create an angular module.
  moduleDeps?: string[]

  // Services that will be injected into directive definition and assigned to
  // the class as static properties.
  inject?: string[]

  // Services that will be injected into the constructor. Replaces the static
  // $inject property if specified.
  $inject?: string[]
}

interface DirectiveConfig extends BaseConfig {
  // The name of the custom element or attribute. Used to derive module name,
  // directive name, and template url.
  selector: string

  // Directive definition properties. Assigned automatically during annotation.
  // Can be overridden by the user.
  transclude?: boolean
  scope?: {}
  require?: string|string[]
  controller?: Function

  // Obtained from the constructor's static methods.
  template?: Function|string
  templateUrl?: Function|string
  compile?: Function
  link?: Function
}

interface ServiceConfig extends BaseConfig {}
