## Description

ES7 decorators for Angular 1.x. Allow you to combine angular1 service and
directive definitions with ES6-style imports. Perfect for an ES7 / TypeScript
application.

This readme assumes you're already using [`jspm`](http://jspm.io) and `System`,
and have an ES6 transpilation workflow with [`babel`](https://babeljs.io/) or
[`typescript`](https://github.com/Microsoft/TypeScript).

## Contents

* [Installation](#installation)
* [Component](#component)
* [Attribute](#attribute)
* [Service](#service)
* [Property Bindings](#bindings)
* [Defaults](#defaults)
* [Gotcha](#gotcha)
* [Analogs](#analogs)

## Installation

In a shell:

```sh
jspm install npm:ng-decorate
```

Example usage:

```typescript
import {Component, bindTwoWay} from 'ng-decorate';

@Component({
  selector: 'my-accordeon'
})
export class MyAccordeon {
  @bindTwoWay() length: number;
}
```

## Component

Defines a component: an element directive with a template and an isolated scope.

Example:

```typescript
@Component({
  module: angular.module('myApp'),
  selector: 'my-custom-element',
  // DI annotations for prototype properties.
  inject: ['$parse']
})
export class ViewModel {
  // Optional type declarations for injected properties.
  $parse: ng.IParseService;

  constructor() {
    var expression = this.$parse('1 + 2');
  }
}
```

This defines a directive named `myCustomElement` on the given angular module.
You can pass a module name and dependencies, or let `Component` derive it from
the directive name.

If you pass a `moduleName` of an existing module, that module will be reused. If
you're starting a new project, I would recommend using a single angular module
for the entire application to minimise dependency tree surprises (see the
[gotcha](#gotcha)).

Decorator options reference (using TypeScript syntax):
```typescript
interface DirectiveConfig extends ng.IDirective {
  // The name of the custom element or attribute. Used to derive module name,
  // directive name, and template url.
  selector: string;

  // Angular module object. If provided, other module options are ignored, and
  // no new module is declared.
  module?: ng.IModule;

  // Module name. Will reuse an existing module or create a new one.
  // If omitted, defaults to the directive's name.
  moduleName?: string;

  // Names of other angular modules this module depends on.
  dependencies?: string[];

  // Angular services that will be assigned to the class prototype.
  inject?: string[];

  // Angular services that will be assigned to the class as static properties.
  injectStatic?: string[];
}
```

Defaults:
```typescript
{
  restrict: 'E',
  scope: {},
  controllerAs: 'self',
  bindToController: true
  /* templateUrl derived from the selector */
}
```

All decorator options are passed into the angular directive definition, so you
can include other options like `transclude` or `scope` to override the defaults.

More examples:

```typescript
@Component({
  selector: 'my-carousel',
  // Explicit module name and dependencies.
  moduleName: 'components.myCarousel',
  dependencies: ['components.myRotatoMotor'],
  // Optional scope settings.
  scope: {
    interval: '='
  },
  // DI annotations for static class properties.
  injectStatic: ['$timeout']
})
export class ViewModel {
  static $timeout: ng.ITimeoutService;
  interval: number;

  constructor() {
    ViewModel.$timeout(() => {
      this.interval = this.interval | 0 || 5000;
    });
  }
}
```

```typescript
@Component({
  // Implicitly creates angular.module('myThumbnail', ['ng'])
  selector: 'my-thumbnail'
})
export class ViewModel {}
```

You might ask, where's the template definition? By convention, the template
URL is assumed to be `component-name/component-name.html`, where `component-name`
is the selector passed into the decorator. You can override it:

```typescript
@Component({
  selector: 'my-accordion',
  templateUrl: 'accordion/view.html'
})
class ViewModel {}
```

To include a `template`, `templateUrl`, `link`, or `compile` method for the
resulting directive, define it as a static method on the class. Note that
unless you need to `require` other directive controllers, there's no need
to define a `link` method; you can just inject `$scope` and `$element`
into the constructor.

Pass an `inject` option with a list of angular services to assign to the
class (see the [gotcha](#gotcha)):

```typescript
@Component({
  selector: 'svg-icon',
  inject: ['$templateCache']
})
class ViewModel {
  static $templateCache: ng.ITemplateCacheService;

  static template($elem: ng.IAugmentedJQueryStatic) {
    var elem: HTMLElement = $elem[0];
    var src = 'svg/' + elem.getAttribute('icon') + '.svg';
    return ViewModel.$templateCache.get(src);
  }
}
```

## Attribute

Similar to `@Component`, but defines an attribute. See [`Component`](#component)
for the decorator options.

Default options:
```typescript
{
  restrict: 'A',
  scope: false
}
```

Note that the decorated controller often obviates the need for a link function,
and serves as the directive's private state.

```typescript
@Attribute({
  // Implicitly reuses an existing module or creates a new one.
  moduleName: 'myApp',
  // 'active-if' also works.
  selector: '[active-if]',
})
class Directive {
  static $inject = ['$element', '$scope', '$parse'];
  constructor($element, $scope, $parse) {
    var element: HTMLElement = $element[0];

    var expression = $parse(element.getAttribute('active-if'));

    $scope.$watch(() => expression($scope), result => {
      if (result) element.classList.add('active');
      else element.classList.remove('active');
    });
  }
}
```

## Service

Makes the decorated class available as an angular service. In other words, makes it
available for dependency injection in the angular module system.

Decorator options reference (using TypeScript syntax):
```typescript
interface ServiceConfig {
  // Service name in angular's DI system. Mandatory due to minification woes.
  serviceName: string;

  // Angular module object. If provided, other module options are ignored, and
  // no new module is declared.
  module?: ng.IModule;

  // Module name. Will reuse an existing module or create a new one.
  // If omitted, defaults to the name of the service.
  moduleName?: string;

  // Names of other angular modules this module depends on.
  dependencies?: string[];

  // Angular services that will be assigned to the class prototype.
  inject?: string[];

  // Angular services that will be assigned to the class as static properties.
  injectStatic?: string[];
}
```

In the simplest form, the declaration looks like this:

```typescript
@Service({serviceName: 'MyCustomClass'})
export class MyCustomClass {}
```

This implicitly defines or reuses an angular module named `'MyCustomClass'`
and makes the class available for dependency injection under the same name.
Similarly to `@Attribute` and `@Component`, you can pass an existing module or
specify a `moduleName` and its `dependencies`:

```typescript
@Service({
  module: angular.module('myApp'),
  serviceName: 'MyClass'
})
export class MyClass {}

@Service({
  moduleName: 'app.MyOtherClass',
  dependencies: ['ng', '3dPartyLibrary'],
  serviceName: 'MyOtherClass'
})
export class MyOtherClass {}

@Service({
  // Reuse an existing 'app' module or create a new one.
  moduleName: 'app',
  serviceName: 'MyAnotherClass'
})
export class MyAnotherClass {}
```

Pass `inject: [...]` to specify DI dependencies. They will be automatically
assigned to the prototype and available in class instances.

```typescript
@Service({
  inject: ['$parse', '$timeout']
})
export class Timekeeper {
  // Add optional type annotations if you're using TypeScript.
  $parse: ng.IParseService;
  $timeout: ng.ITimeoutService;

  constructor() {
    this.$timeout(() => {
      console.log(this.$parse('now()')(Date));
    });
  }
}
```

Pass `injectStatic: [...]` to specify static DI dependencies. They will be
automatically assigned to the class.

```typescript
@Service({
  injectStatic: ['$parse', '$timeout']
})
export class Timekeeper {
  // Add optional type annotations if you're using TypeScript.
  static $parse: ng.IParseService;
  static $timeout: ng.ITimeoutService;

  constructor() {
    Timekeeper.$timeout(() => {
      console.log(Timekeeper.$parse('now()')(Date));
    });
  }
}
```

If you don't need to publish your service to Angular's DI system, replace
`Service` with `Ambient`. It doesn't require a `serviceName`, but still provides
automatic assignment of injected dependencies.

```diff
- import {Service} from 'ng-decorate';
+ import {Ambient} from 'ng-decorate';

- @Service({serviceName: 'MyService'})
+ @Ambient({})
export class MyService {}
```

## Bindings

`ng-decorate` provides _property decorators_ to declare properties as bindable.
This lets you skip `scope: {/* ... */}` and specify binding types directly on
class property initialisers.

Example:

```typescript
import {Component, bindString, bindTwoWay} from 'ng-decorate';

@Component({
  selector: 'editable'
})
class VM {
  @bindString() label: string;
  @bindTwoWay() value: string;
}
```

Which is equivalent to:

```typescript
import {Component} from 'ng-decorate';

@Component({
  scope: {
    label: '@',
    value: '='
  }
})
class VM {
  label: string;
  value: string;
}
```

This saves you from duplicating property bindings in the decorator and the class
body, and makes bindings more semantic.

### @bindString

```typescript
class VM {
  @bindString() first: string;
  @bindString('last') second: string;
}
```

Is equivalent to:

```typescript
class VM {
  first: string;
  second: string;
  static scope = {
    first: '@',
    second: '@last'
  };
}
```

### @bindTwoWay

```typescript
class VM {
  @bindTwoWay() first: boolean;
  @bindTwoWay({collection: true, optional: true, key: 'last'})
  second: number[];
}
```

Is equivalent to:

```typescript
class VM {
  first: boolean;
  second: number[];
  static scope = {
    first: '=',
    second: '=*?last'
  };
}
```

### @bindOneWay

This is a special feature of `ng-decorate`. One-way binding for non-string
values isn't natively supported by Angular 1.x. `ng-decorate` implements it
through a hidden expression binding and a getter/setter pair.

Example usage:

```typescript
@Component({
  selector: 'controlled-input'
})
class VM {
  @bindOneWay() value: string;

  constructor() {
    this.value = 123;         // has no effect
    console.log(this.value);  // not 123
  }
}
```

### @bindExpression

```typescript
class VM {
  @bindExpression() first: Function;
  @bindExpression('last') second: Function;
}
```

Is equivalent to:

```typescript
class VM {
  first: Function;
  second: Function;
  static scope = {
    first: '&',
    second: '&last'
  };
}
```

## Defaults

The package has a stateful default configuration. You can import and mutate it
to set global defaults.

Default configuration:

```typescript
export const defaults = {
  // Default angular module. Supersedes module declarations.
  module: <ng.IModule>null,
  // Default module name.
  moduleName: <string>null,
  // Controller key. Other common variants include 'ctrl' and 'vm'.
  controllerAs: 'self',
  // Generates a template url from an element name. Another common variant:
  // 'components/elementName/elementName.html'.
  makeTemplateUrl(elementName: string): string {
    return `${elementName}/${elementName}.html`;
  }
}
```

Example of configuring `ng-decorate`:

```typescript
import {defaults} from 'ng-decorate';

defaults.module = angular.module('app');
defaults.controllerAs = 'vm';
```

## Gotcha

The catch is that each angular "module" used by the decorators, either
explicitly or implicitly, must be present in the dependency tree of the module
that has been bootstrapped via `ng-app` or `angular.bootstrap`. If you let the
decorators define new angular modules, you must add them to the dependency list
of the main one.

To skip this chore, I recommend using a single angular module for the entire
application, setting it in `defaults` or explicitly passing it to decorators.
There's no need to maintain a separate dependency tree for the DI injector when
the real modularity comes from ES6.

## Analogs

Here are some other Angular1.x decorator libraries I found.
* [a1atscript](https://github.com/hannahhoward/a1atscript)
* [angular2-now](https://github.com/pbastowski/angular2-now)

`ng-decorate` is minimalistic. It aligns with the Angular1.x directive API so
you don't have to learn new things, and uses only one decorator per service or
directive. The libraries listed above aim to align with the Angular2 decorator
API. Pick whichever approach you prefer.
