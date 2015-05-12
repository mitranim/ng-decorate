/******************************** Third Party ********************************/

declare var angular: ng.IAngularStatic;

/********************************** Public ***********************************/

// TODO consider ways of publishing alongside the rest of the package.
declare module 'ng-decorate' {
  export function Attribute(config: DirectiveConfig);
  export function Component(config: DirectiveConfig);
  export function Service(config: ServiceConfig);
}

/********************************** Private ***********************************/

// Abstract interface shared by configuration objects.
interface BaseConfig {
  // Angular module object. If provided, other module options are ignored, and
  // no new module is declared.
  module?: ng.IModule;

  // Optional name for the new module created for this service or directive.
  // If omitted, the service or directive name is used.
  moduleName?: string;

  // Names of other angular modules this module depends on.
  dependencies?: string[];

  // Angular services that will be assigned to the class prototype.
  inject?: string[];

  // Angular services that will be assigned to the class as static properties.
  injectStatic?: string[];
}

interface DirectiveConfig extends BaseConfig, ng.IDirective {
  // The name of the custom element or attribute. Used to derive module name,
  // directive name, and template url.
  selector: string;
}

interface ServiceConfig extends BaseConfig {
  // The name of the service in the angular module system. Mandatory
  // due to minification woes.
  serviceName: string;
}

interface Controller extends Function {
  template?: string|Function;
  templateUrl?: string|Function;
  link?: Function;
  compile?: any;
}
