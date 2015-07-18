## Description

ES7 decorators for Angular 1.x. Help you:

* Get around Angular's dependency injection while using ES6 modules.
* Make custom directive declarations very short and semantic.
* Declare bindables directly on class properties.

Perfect for an ES7 / TypeScript application.

This readme assumes you're already using [`jspm`](http://jspm.io) and `System`,
and have an ES6 transpilation workflow with [`babel`](https://babeljs.io/) or
[`typescript`](https://github.com/Microsoft/TypeScript). If not, here's a guide
to get you started: [[1]](http://mitranim.com/thoughts/next-generation-today/).

## Contents

* [Installation](#installation)
* [Directives](#directives)
  * [`@Component`](#component)
  * [`@Attribute`](#attribute)
  * [Directive Options](#directive-options)
* [Services](#services)
  * [`@Ambient`](#ambient)
  * [`@Service`](#service)
  * [`@Controller`](#controller)
  * [Service Options](#service-options)
* [Bindings](#bindings)
  * [`@bindString`](#bindstring)
  * [`@bindTwoWay`](#bindtwoway)
  * [`@bindOneWay`](#bindoneway)
  * [`@bindExpression`](#bindexpression)
* [`@autoinject`](#autoinject)
* [`defaults`](#defaults)
* [Gotcha](#gotcha)
* [Prior Art](#prior-art)

## Installation

In shell:

```sh
jspm install npm:ng-decorate
```

In app:

```typescript
import {Component, bindTwoWay} from 'ng-decorate';

@Component({
  selector: 'my-accordeon'
})
class X {
  @bindTwoWay length: number;
}
```

## Directives

`ng-decorate` provides two directive shortcuts: custom element (`@Component`)
and custom attribute (`@Attribute`).

### `@Component`

Defines a custom element: a directive with a template and an isolated scope.

Simplest usage:

```typescript
import {Component} from 'ng-decorate';

@Component({
  selector: 'my-element'
})
class X {}
```

With default settings, this expands to:

```typescript
angular.module('myElement', ['ng']).directive('myElement', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'my-element/my-element.html',
    controller: X,
    controllerAs: 'self',
    bindToController: true
  };
});
class X {}
```

See [`defaults`](#defaults) for customisation.

### `@Attribute`

Defines a custom attribute.

Simplest usage:

```typescript
import {Attribute} from 'ng-decorate';

@Attribute({
  selector: '[my-attribute]'
})
class X {}
```

With default settings, this expands to:

```typescript
angular.module('myAttribute', ['ng']).directive('myAttribute', function() {
  return {
    restrict: 'A',
    scope: false,
    controller: X
  };
});
class X {}
```

See [`defaults`](#defaults) for customisation.

### Directive Options

This applies to both `@Component` and `@Attribute`.

Any passed options will be included into the resulting
[directive definition object](https://docs.angularjs.org/api/ng/service/$compile#directive-definition-object),
so you can use the standard directive API on top of `ng-decorate`-specific
options. Example:

```typescript
@Component({
  selector: 'my-element',
  scope: {myProperty: '='}
})
```

#### `selector` `: string`

Required. This is the selector string for the resulting directive. For
`@Attribute`, you can optionally enclose it into brackets:

```typescript
@Attribute({selector: '[my-attribute]'})
```

#### `module` `: ng.IModule`

Optional. The directive will be registered under the given angular module, no
new module will be created, and other module options will be ignored:

```typescript
@Component({
  module: angular.module('myApp'),
  selector: 'my-element'
})
```

I recommend using a single angular "module" for the entire application. Angular
dependencies are kinda fake: all providers (services, etc.) are registered
globally in the application injector, and dependencies "bleed through" to sister
modules. Might as well admit this and keep it simple. The real dependency tree
of your application is defined by ES6 modules. See [`defaults`](#defaults) for
setting up a default angular module.

#### `moduleName` `: string`

Optional. Dictates the name of the new angular "module" that will be created:

```typescript
@Attribute({
  moduleName: 'app.myAttribute',
  selector: '[my-attribute]'
})
```

If omitted, defaults to the directive's name, as shown above. See
[`defaults`](#defaults) for how to set up an implicit module.

#### `dependencies` `: string[]`

Optional. Names of other angular "modules" the newly created module depends on.
This is necessary when you depend on third party services that need to be
dependency-injected (see `inject` below):

```typescript
@Component({
  selector: 'my-link',
  dependencies: ['ui.router']
})
```

If omitted, defaults to `['ng']`, as shown above.

#### `inject` `: string[]`

**Deprecated**, see [`@autoinject`](#autoinject).

Optional. Names of angular services that will be dependency-injected and
automatically assigned to the class's prototype:

```typescript
@Component({
  selector: 'my-element',
  inject: ['$q']
})
class X {
  constructor() {
    console.log(this.$q)
  }
}
```

This lets you easily get hold of angular services while using ES6 modules for
everything else. The magic happens during Angular's "run phase", before any
directives are instantiated.

See the [`gotcha`](#gotcha) for the possible dependency injection issues. They
can be easily avoided by using just one module.

#### `injectStatic` `: string[]`

**Deprecated**, see [`@autoinject`](#autoinject).

Optional. Works exactly like `inject`, but assigns the injected services to the
class as static properties.

```typescript
@Component({
  selector: 'my-element',
  injectStatic: ['$http']
})
class X {
  constructor() {
    console.log(X.$http)
  }
}
```

#### Statics

These directive options can be included as static methods or properties:

```typescript
template
templateUrl
compile
link
scope
```

Example:

```typescript
@Attribute({
  selector: 'svg-icon'
})
class X {
  @autoinject $templateCache;

  static template($element) {
    var element = $element[0];
    var src = 'svg/' + element.getAttribute('icon') + '.svg';
    return X.$templateCache.get(src);
  }
}
```

## Services

### `@Ambient`

Dependency injection helper. It's a strict subset of other decorators in this
library. Use it when you want to obtain Angular's services without creating any
new directives or services.

```typescript
import {Ambient, autoinject} from 'ng-decorate';

@Ambient
class X {
  @autoinject $q;
  @autoinject static $http;

  constructor() {
    console.log(this.$q)
    console.log(X.$http)
  }
}
```

(See [`@autoinject`](#autoinject) below.)

Just like with other class decorators, you can include `module`, `moduleName`
and so on. For this particular decorator, arguments are optional.

### `@Service`

Same as `@Ambient` but registers a new angular service with the given name. The
`serviceName` option is mandatory. This is useful when you're porting a legacy
application, where some parts still rely on Angular's DI.

Create a service:

```typescript
@Service({
   serviceName: 'MySpecialClass'
})
class X {}
```

Get it in Angular's DI:

```typescript
angular.module('app').run(['MySpecialClass', function(MySpecialClass) {
  /* ... */
}]);
```

### `@Controller`

Same as `@Ambient` but also registers the class as an "old school" controller
under the given name. Can optionally publish the class to the DI system, just
like `@Service`.

Register the controller:

```typescript
@Controller({
  controllerName: 'X'
})
class X {}

@Controller({
  controllerName: 'Y',
  serviceName: 'Y'
})
class Y {}
```

Use in a template:

```html
<div ng-controller="X"></div>
```

This type of controller usage is outdated and generally **not recommended**. Use
`@Component` instead. This decorator is provided to ease migration of legacy
apps to ES6/7.

### Service Options

This applies to `@Ambient`, `@Service`, and `@Controller`.

#### `module` `: ng.IModule`
#### `moduleName` `: string[]`
#### `dependencies` `: string[]`

See [Directive Options](#directive-options).

## Bindings

Directly annotate class properties to declare them as bindable. Perfect with
TypeScript. When used with `@Component` or `@Attribute`, the annotations are
grouped and converted into a `scope: {/* ... */}` declaration for the internal
directive definition object.

Example:

```typescript
import {Component, bindString, bindTwoWay} from 'ng-decorate';

@Component({
  selector: 'editable'
})
class X {
  @bindString label: string;
  @bindTwoWay value: string;
}
```

Expands to:

```typescript
import {Component} from 'ng-decorate';

@Component({
  selector: 'editable',
  scope: {
    label: '@',
    value: '='
  }
})
class X {
  label: string;
  value: string;
}
```

This lets you declare bindings directly in the class body and makes them more
semantic.

### `@bindString`

```typescript
@Component({
  selector: 'my-element'
})
class X {
  @bindString first: string;
  @bindString('last') second: string;
}
```

Expands to:

```typescript
@Component({
  selector: 'my-element',
  scope: {
    first: '@',
    second: '@last'
  }
})
class X {
  first: string;
  second: string;
}
```

### `@bindTwoWay`

```typescript
@Component({
  selector: 'my-element'
})
class X {
  @bindTwoWay first: any;
  @bindTwoWay({collection: true, optional: true, key: 'last'})
  second: any;
}
```

Expands to:

```typescript
@Component({
  selector: 'my-element',
  scope: {
    first: '=',
    second: '=*?last'
  }
})
class X {
  first: any;
  second: any;
}
```

### `@bindOneWay`

This is a special feature of `ng-decorate`. It bridges the gap between Angular
2, where one-way binding is the default, and Angular 1.x, which doesn't support
it natively.

Example with a hardcoded string:

```html
<controlled-input value="'constant value'"></controlled-input>
```

```typescript
@Component({
  selector: 'controlled-input'
})
class X {
  @bindOneWay value: any;

  constructor() {
    this.value = 123;         // has no effect
    console.log(this.value);  // prints 'constant value'
  }
}
```

### `@bindExpression`

```typescript
@Component({
  selector: 'my-element'
})
class X {
  @bindExpression first: Function;
  @bindExpression('last') second: Function;
}
```

Expands to:

```typescript
@Component({
  selector: 'my-element',
  scope: {
    first: '&',
    second: '&last'
  }
})
class X {
  first: Function;
  second: Function;
}
```

## `@autoinject`

Properties annotated with `@autoinject` are automatically assigned to the prototype
(instance properties) or class (static properties). You don't need to inject them
in the constructor.

Must be used with one of the class decorators, like `@Component` or `@Ambient`.

```typescript
import {Component, autoinject} from 'ng-decorate';

@Component({
  selector: 'todo-list'
})
class X {
  @autoinject $q;
  @autoinject static $timeout;

  constructor() {
    console.log(this.$q);
    console.log(X.$timeout);
  }
}
```

Works great with TypeScript and property type annotations.

As an alternative, you can pass arrays of properties as `inject` and
`injectStatic` to the class decorator (deprecated).

Note that this only works for global services. For contextual dependencies
like `$scope`, use constructor injection:

```javascript
class X {
  static $inject = ['$scope', '$element'];
  constructor($scope, $element) {
    /* ... */
  }
}
```

With TypeScript, use the `private` or `public` modifier to automatically assign
the injected value to the instance:

```typescript
class X {
  static $inject = ['$scope', '$element'];
  constructor(private $scope, private $element) {
    /* ... */
  }
}
```

## `defaults`

The package is stateful. You can import its configuration object and mutate it
to set global defaults.

Default configuration (with type annotations for the sake of clarity):

```typescript
export const defaults = {
  // Default angular module. Supersedes module declarations.
  module: <ng.IModule>null,
  // Default module name.
  moduleName: <string>null,
  // Controller key. Other common variants include 'ctrl' and 'vm'.
  controllerAs: 'self',
  // Generates a template url from an element name. Another common variant:
  //   'components/elementName/elementName.html'.
  makeTemplateUrl(elementName: string): string {
    return elementName + '/' + elementName + '.html';
  }
};
```

Example configuration:

```typescript
import {defaults} from 'ng-decorate';

defaults.module = angular.module('app');
defaults.controllerAs = 'vm';
```

I recommend setting your application's main, or only, module as the default (see
below).

## Gotcha

Each angular "module" created or reused by the decorators must be present in the
dependency tree of your main module (the one that has been bootstrapped via
`ng-app` or `angular.bootstrap`). If you let the decorators create new
modules, you must add them to the dependency list of the main module.

To avoid this, use a single angular module for the entire application, setting
it in `defaults` or explicitly passing it to decorators. There's nothing to gain
by using fake Angular dependendencies that end up sharing the same global
namespace.

## Prior Art

Found some other Angular1.x decorator libraries:
* [a1atscript](https://github.com/hannahhoward/a1atscript)
* [angular2-now](https://github.com/pbastowski/angular2-now)

These libraries focus on syntax, trying to emulate the Angular 2 decorator API.

In contrast, `ng-decorate` focuses on solving the real problem of making
Angular's dependency injection work with ES6 modules, and aligns with the
Angular 1.x directive API. It also introduces useful property annotations for
bindings and injection.
