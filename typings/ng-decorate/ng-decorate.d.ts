/// <reference path="../angularjs/angular.d.ts" />

/**
 * TODO publish to tsd.
 */

// god bless microsoft for forcing us to code in indian style
declare module 'ng-decorate' {
  export var Attribute: typeof ngDecorate.Attribute;
  export var Ambient: typeof ngDecorate.Ambient;
  export var Component: typeof ngDecorate.Component;
  export var Service: typeof ngDecorate.Service;
  // export var bind: typeof ngDecorate.bind;
  export var bindTwoWay: typeof ngDecorate.bindTwoWay;
  export var bindOneWay: typeof ngDecorate.bindOneWay;
  export var bindString: typeof ngDecorate.bindString;
  export var bindExpression: typeof ngDecorate.bindExpression;
  export var defaults: typeof ngDecorate.defaults;
}

declare module ngDecorate {
  // Class decorators.
  export function Attribute(config: DirectiveConfig);
  export function Ambient(config: BaseConfig);
  export function Component(config: DirectiveConfig);
  export function Service(config: ServiceConfig);

  // Property decorators.
  // export function bind(descriptor?: string);
  export function bindTwoWay(options?: BindOptionsTwoWay);
  export function bindOneWay(key?: string);
  export function bindString(key?: string);
  export function bindExpression(key?: string);

  // Mutable configuration.
  export const defaults: {
    module?: ng.IModule;
    moduleName?: string;
    controllerAs: string;
    makeTemplateUrl: (selector: string) => string;
  };

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
    scope: any;
  }

  interface BindOptionsTwoWay {
    // Adds `?` to the property descriptor, marking it optional.
    optional?: boolean;
    // Adds `*` to the property descriptor, marking it for `$watchCollection`.
    collection?: boolean;
    // Adds an external property name to the binding.
    key?: string;
  }
}
