## Description

ES7 decorators for Angular 1.x. Allow you to combine angular1 service and
directive definitions with ES6-style imports. Perfect for an ES7 / TypeScript
application.

This readme assumes you're already using [`jspm`](http://jspm.io) and `System`,
and have an ES6 transpilation workflow with [`babel`](https://babeljs.io/) or
[`typescript`](https://github.com/Microsoft/TypeScript).

## Contents

* [Description](#description)
* [Contents](#contents)
* [Installation](#installation)
* [Component](#component)
* [Attribute](#attribute)
* [Service](#Service)

## Installation

In a shell:

```sh
jspm install npm:ng-decorate
```

In your application:

```javascript
import {Attribute, Component, Service} from 'ng-decorate'
```

The distribution includes the file `def/ng-decorate.d.ts` with the module
definition. If you're using TypeScript, add it to your `tsconfig.json` for
contextual help.

## Component

Defines a component: an element directive with an isolated scope. In this
example, we explicitly pass an angular module to the decorator. If omitted, the
decorator will create a new angular module, inferring its name from the class.

```javascript
@Component({
  module: angular.module('myApp'),
  selector: 'my-custom-element',
  // Dependency annotations for static properties. Assigned
  // to the class during the annotation process.
  inject: ['$parse']
})
export class ViewModel {
  // Optional type declaration. The property will be assigned automatically.
  static $parse: ng.IParseService

  constructor() {
    /* do my stuff */
  }
}
```

This implicitly defines a directive named `myCustomElement` on the given angular
module. If the module is omitted, a new module is created. Example:

```javascript
@Component({
  // Optional namespace prefix for your module names.
  modulePrefix: 'myApp',
  selector: 'my-carousel',
  // Dependency annotations for constructor arguments.
  $inject: ['$element'],
  // Optional scope settings.
  scope: {
    myProperty: '='
  }
})
export class ViewModel {
  $element: ng.IAugmentedJQueryStatic

  constructor($element) {
    this.$element = $element
    /* do stuff */
  }
}
```

In this example, the decorator implicitly defines a module named
`myApp.myCarousel` and a directive named `myCarousel` associated with it.

You can also pass an array of module dependencies as `moduleDeps` to specify
this module's dependencies on other angular modules. This may be necessary
if you want to inject services from third party libraries.

You might ask, where's the template definition? By convention, the template
URL is assumed to be `selector-name/selector-name.html`, where `selector-name`
is the selector string passed into the decorator. You can override it:

```javascript
@Component({
  selector: 'my-accordion',
  templateUrl: 'accordion/view.html'
})
class ViewModel {}
```

To include a `template`, `link`, or `compile` method for the resulting
directive, define it as a static method on the class. Note that there's usually
no need to define a `link` method; you can just inject `$scope` and `$element`
into the constructor.

```javascript
@Component({
  selector: 'svg-icon',
  inject: ['$templateCache']
})
class ViewModel {
  static $templateCache: ng.ITemplateCacheService

  static template($elem: ng.IAugmentedJQueryStatic) {
    var elem: HTMLElement = $elem[0]
    var src = 'svg/' + elem.getAttribute('icon') + '.svg'
    return ViewModel.$templateCache.get(src)
  }
}
```

The decorator configuration object is passed to the angular directive
definition, so you can include any directive options like `transclude` or
`scope` to override the defaults.

Default component directive settings:

```javascript
{
  restrict: 'E',
  scope: {},
  templateUrl: /* derived from selector */,
  controllerAs: 'self',
  bindToController: true
}
```

You can override any of them in your decorator config object.

## Attribute

Similar to `@Component`, but defines an attribute. By default, it has `scope:
false` and no template. The decorated class becomes its controller.

Note that the decorated controller obviates the need for a link function, and
serves as the directive's isolated private state, regardless of its `scope`
setting.

```javascript
@Attribute({
  module: angular.module('myApp.attributes'),  // optional
  selector: '[active-if]', // 'active-if' also works
  // Dependency annotations for constructor arguments.
  $inject: ['$element', '$scope', '$parse']
})
class ViewModel {
  constructor($element, $scope, $parse) {
    var element: HTMLElement = $element[0]

    var expression = $parse(element.getAttribute('active-if'))

    $scope.$watch(() => expression($scope), result => {
      if (result) element.classList.add('active')
      else element.classList.remove('active')
    })
  }
}
```

Like with `@Component`, if we don't provide an explicit module, a new module is
created with the same name as the directive (in this case `activeIf`) and an
optional namespace prefix.

## Service

Makes the decorated class available as an angular service.

To clarify the terminology: in angular's convoluted module system, 'services'
are analogous to ES6 named exports. The `@Service` decorator makes your
ES6-style exports available through the angular DI.

In the simplest form, the declaration looks like this:

```javascript
@Service({})
export class MyCustomClass {}
```

This implicitly defines an angular module named `MyCustomClass` and an angular
factory that exports `MyCustomClass`. Like with `@Attribute` and `@Component`,
you can pass an existing module or specify `modulePrefix` and `moduleDeps`:

```javascript
@Service({
  module: angular.module('myApp')
})
export class MyClass {}

@Service({
  modulePrefix: 'app', // the module name will be app.MyOtherClass
  moduleDeps: ['ng', '3dPartyLibrary']
})
export class MyOtherClass {}
```

The service name is derived from the class name. You can specify it explicitly:

```javascript
@Service({name: 'CustomClass'})
export class MyCustomClass {}
```

This class will be available as a service named `CustomClass`.

Pass `inject: [...]` to specify static dependencies. They will be automatically
assigned to the class.

```javascript
@Service({
  inject: ['$parse', '$timeout']
})
export class Timekeeper {
  // Optional type annotations. The properties will be assigned regardless.
  static $parse: ng.IParseService
  static $timeout: ng.ITimeoutService
}
```

Pass `$inject: [...]` to specify instance dependencies that will be passed to
the constructor whenever the class is instantiated by Angular (e.g. as a
controller):

```javascript
@Service({
  $inject: ['$scope', '$element']
})
export class MyController {
  constructor($scope, $timeout) {
    /* do my stuff */
  }
}
```

This is identical to annotating with a static property:

```javascript
@Service({})
export class MyController {
  static $inject = ['$scope', '$element']
  constructor($scope, $timeout) {
    /* do my stuff */
  }
}
```
