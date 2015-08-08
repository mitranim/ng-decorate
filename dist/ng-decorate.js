(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ngDecorate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var utils = require('./utils');
/**
 * Property binding decorator. Takes a string property descriptor, like '@' or
 * '&action', and stores it in class's static property `scope` under the same
 * key as the name of the property being decorated.
 *
 * Basically, this:
 *   class VM {
 *     @bind() ngModel;
 *     @bind('@longWay') path;
 *   }
 *
 * Becomes this:
 *   class VM {
 *     static scope = {
 *       ngModel: '=',
 *       path: '@longWay'
 *     };
 *   }
 *
 * When used with @Component or @Attribute, the scope property is then passed
 * into the directive definition.
 *
 * Keeping this unexported for the time being. I'm not convinced we need this
 * general form over other, more descriptive decorators.
 */
function bind(descriptor) {
    if (descriptor === void 0) { descriptor = '='; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class[utils.scopeKey])
            Class[utils.scopeKey] = {};
        Class[utils.scopeKey][propertyName] = descriptor;
    };
}
/**
 * Polymorphic version of @bindString, usable without parens. Example:
 *   class VM {
 *     @bindString first: string;
 *     @bindString('secunda') second: string;
 *   }
 */
function bindString(targetOrKey, keyOrNothing) {
    if (targetOrKey != null && typeof targetOrKey === 'object' && typeof keyOrNothing === 'string') {
        return bindStringBase().apply(null, arguments);
    }
    return bindStringBase.apply(null, arguments);
}
exports.bindString = bindString;
/**
 * Semantic version of @bind('@').
 *
 * Example usage:
 *   class VM {
 *     @bindString() first: string;
 *     @bindString('secunda') second: string;
 *   }
 */
function bindStringBase(key) {
    if (key === void 0) { key = ''; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class[utils.scopeKey])
            Class[utils.scopeKey] = {};
        Class[utils.scopeKey][propertyName] = '@' + key;
    };
}
/**
 * Polymorphic version of @bindTwoWay, usable without parens. Example:
 *   class VM {
 *     @bindTwoWay first: any;
 *     @bindTwoWay({optional: true, key: 'secunda', collection: true})
 *     second: any;
 *   }
 */
function bindTwoWay(targetOrOptions, keyOrNothing) {
    if (targetOrOptions != null && typeof targetOrOptions === 'object' && typeof keyOrNothing === 'string') {
        bindTwoWayBase()(targetOrOptions, keyOrNothing);
    }
    return bindTwoWayBase(targetOrOptions);
}
exports.bindTwoWay = bindTwoWay;
/**
 * Semantic version of @bind() or @bind('=').
 *
 * Example usage:
 *   class VM {
 *     @bindTwoWay() first: any;
 *     @bindTwoWay({optional: true, key: 'secunda', collection: true})
 *     second: any;
 *   }
 */
function bindTwoWayBase(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class[utils.scopeKey])
            Class[utils.scopeKey] = {};
        Class[utils.scopeKey][propertyName] = '=' + encodeDescriptor(options);
    };
}
/**
 * Polymorphic version of @bindExpression, usable without parens. Example:
 *   class VM {
 *     @bindExpression first: Function;
 *     @bindExpression('secunda') second: Function;
 *   }
 */
function bindExpression(targetOrKey, keyOrNothing) {
    if (targetOrKey != null && typeof targetOrKey === 'object' && typeof keyOrNothing === 'string') {
        bindExpressionBase()(targetOrKey, keyOrNothing);
    }
    return bindExpressionBase(targetOrKey);
}
exports.bindExpression = bindExpression;
/**
 * Semantic version of @bind('&').
 *
 * Example usage:
 *   class VM {
 *     @bindExpression() first: Function;
 *     @bindExpression('secunda') second: Function;
 *   }
 */
function bindExpressionBase(key) {
    if (key === void 0) { key = ''; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class[utils.scopeKey])
            Class[utils.scopeKey] = {};
        Class[utils.scopeKey][propertyName] = '&' + key;
    };
}
/**
 * Polymorphic version of @bindOneWay, usable without parens. Example:
 *   class VM {
 *     @bindOneWay first: any;
 *     @bindOneWay('secunda') second: any;
 *   }
 */
function bindOneWay(targetOrKey, keyOrNothing) {
    if (targetOrKey != null && typeof targetOrKey === 'object' && typeof keyOrNothing === 'string') {
        bindOneWayBase()(targetOrKey, keyOrNothing);
    }
    return bindOneWayBase(targetOrKey);
}
exports.bindOneWay = bindOneWay;
/**
 * Emulates a one-way binding, which is not supported by Angular natively.
 * Uses a hidden '&' binding and a getter/setter pair to make the decorated
 * property read-only.
 *
 * Example usage:
 *   @Component({
 *     selector: 'controlled-input'
 *   })
 *   class X {
 *     @bindOneWay value: any;
 *
 *     constructor() {
 *       this.value = 123;         // has no effect
 *       console.log(this.value);  // prints 'constant value'
 *     }
 *   }
 */
function bindOneWayBase(key) {
    if (key === void 0) { key = ''; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class[utils.scopeKey])
            Class[utils.scopeKey] = {};
        var secretKey = utils.randomString();
        Class[utils.scopeKey][secretKey] = '&' + (key || propertyName);
        Object.defineProperty(target, propertyName, {
            get: function () {
                if (typeof this[secretKey] === 'function')
                    return this[secretKey]();
                return undefined;
            },
            set: function (_) { }
        });
    };
}
/**
 * Generates a descriptor string suffix from the given options.
 */
function encodeDescriptor(options) {
    return (options.collection ? '*' : '') + (options.optional ? '?' : '') + (options.key || '');
}

},{"./utils":5}],2:[function(require,module,exports){
'use strict';
var utils = require('./utils');
/**
 * Shared directive definition logic.
 */
function directive(config) {
    return function (constructor) {
        var module = utils.getModule(config, config.selector);
        var directiveName = utils.camelCase(config.selector);
        /**
         * Transfer properties.
         */
        config.controller = constructor;
        if (constructor[utils.scopeKey])
            config.scope = constructor[utils.scopeKey];
        // Link functions must be cloned because angular mutates them with `require`
        // annotations, then relies on those annotations for injection.
        if (typeof constructor.link === 'function') {
            config.link = utils.cloneFunction(constructor.link);
        }
        // Cloning other functions just in case.
        if (typeof constructor.compile === 'function') {
            config.compile = utils.cloneFunction(constructor.compile);
        }
        if (typeof constructor.template === 'function') {
            config.template = utils.cloneFunction(constructor.template);
        }
        else if (typeof constructor.template === 'string') {
            config.template = constructor.template;
        }
        if (typeof constructor.templateUrl === 'function') {
            config.templateUrl = utils.cloneFunction(constructor.templateUrl);
        }
        else if (typeof constructor.templateUrl === 'string') {
            config.templateUrl = constructor.templateUrl;
        }
        var inject = [].concat(config.inject || [], constructor.prototype[utils.autoinjectKey] || []);
        var injectStatic = [].concat(config.injectStatic || [], constructor[utils.autoinjectKey] || []);
        // Directive function that assigns the injected services to the constructor.
        definition.$inject = inject.concat(injectStatic);
        function definition() {
            var injected = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                injected[_i - 0] = arguments[_i];
            }
            var map = utils.zipObject(definition.$inject, injected);
            // Assign injected values to the prototype.
            inject.forEach(function (token) {
                constructor.prototype[token] = map[token];
            });
            // Assign injected values to the class.
            injectStatic.forEach(function (token) {
                constructor[token] = map[token];
            });
            return config;
        }
        // Register the directive.
        module.directive(directiveName, definition);
    };
}
/**
 * Defines an angular component (custom element).
 */
function Component(config) {
    utils.assert(config != null && typeof config === 'object', "expected a configuration object, got: " + config);
    utils.assert(!!config.selector, 'you must provide a selector');
    var selector = utils.kebabCase(config.selector);
    var directiveConfig = {
        selector: config.selector,
        restrict: 'E',
        scope: {},
        controllerAs: utils.defaults.controllerAs,
        bindToController: true
    };
    if (config.template == null && config.templateUrl === undefined) {
        directiveConfig.templateUrl = utils.defaults.makeTemplateUrl(selector);
    }
    angular.extend(directiveConfig, config);
    return directive(directiveConfig);
}
exports.Component = Component;
/**
 * Defines an attribute directive.
 */
function Attribute(config) {
    utils.assert(config != null && typeof config === 'object', "expected a configuration object, got: " + config);
    utils.assert(!!config.selector, 'you must provide a selector');
    var directiveConfig = {
        selector: config.selector,
        restrict: 'A',
        scope: false
    };
    angular.extend(directiveConfig, config);
    return directive(directiveConfig);
}
exports.Attribute = Attribute;

},{"./utils":5}],3:[function(require,module,exports){
'use strict';
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./bindings'));
__export(require('./directives'));
__export(require('./services'));
var utils_1 = require('./utils');
exports.defaults = utils_1.defaults;
exports.autoinject = utils_1.autoinject;

},{"./bindings":1,"./directives":2,"./services":4,"./utils":5}],4:[function(require,module,exports){
'use strict';
var utils = require('./utils');
function service(config, type) {
    utils.assert(config != null && typeof config === 'object', "expected a configuration object, got: " + config);
    if (type === 'service') {
        utils.assert(!!config.serviceName, 'you must provide a service name');
    }
    if (type === 'controller') {
        utils.assert(!!config.controllerName, 'you must provide a controller name');
    }
    return function (constructor) {
        var module = utils.getModule(config, config.serviceName);
        var inject = [].concat(config.inject || [], constructor.prototype[utils.autoinjectKey] || []);
        var injectStatic = [].concat(config.injectStatic || [], constructor[utils.autoinjectKey] || []);
        // Injector function that assigns the injected services to the class.
        injector.$inject = inject.concat(injectStatic);
        function injector() {
            var injected = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                injected[_i - 0] = arguments[_i];
            }
            var map = utils.zipObject(injector.$inject, injected);
            // Assign injected values to the prototype.
            inject.forEach(function (token) {
                constructor.prototype[token] = map[token];
            });
            // Assign injected values to the class.
            injectStatic.forEach(function (token) {
                constructor[token] = map[token];
            });
        }
        // Run DI.
        module.run(injector);
        // Publish service and/or controller.
        if (type === 'controller') {
            var conf = config;
            module.controller(conf.controllerName, constructor);
            if (conf.serviceName)
                module.factory(conf.serviceName, function () { return constructor; });
        }
        if (type === 'service')
            module.factory(config.serviceName, function () { return constructor; });
    };
}
/**
 * Defines a generic angular service.
 */
function Service(config) {
    return service(config, 'service');
}
exports.Service = Service;
/**
 * Polymorphic version of Ambient. Example:
 *   @Ambient
 *   class VM {
 *     @autoinject $http;
 *   }
 */
function Ambient(configOrClass) {
    if (typeof configOrClass === 'function') {
        return AmbientBase({}).apply(null, arguments);
    }
    return AmbientBase.apply(null, arguments);
}
exports.Ambient = Ambient;
/**
 * Ambient service. We inject it with DI values without exporting the class
 * into the angular DI environment.
 */
function AmbientBase(config) {
    return service(config);
}
/**
 * Old-school controller. Gets injected with DI, then published as
 * module.controller under the given name. Can also optionally be published as
 * a service.
 */
function Controller(config) {
    return service(config, 'controller');
}
exports.Controller = Controller;

},{"./utils":5}],5:[function(require,module,exports){
'use strict';
/**
 * Mutable configuration object.
 */
exports.defaults = {
    // Default angular module. Supersedes module declarations.
    module: null,
    // Default module name.
    moduleName: null,
    // Controller key. Other common variants include 'ctrl' and 'vm'.
    controllerAs: 'self',
    // Generates a template url from an element name. Another common variant:
    // 'components/elementName/elementName.html'.
    makeTemplateUrl: function (elementName) {
        return elementName + "/" + elementName + ".html";
    }
};
/**
 * Reuses or creates an angular module from the given configuration.
 */
function getModule(config, definitionName) {
    if (config.module)
        return config.module;
    if (config.moduleName)
        return getModuleByName(config, config.moduleName);
    if (exports.defaults.module)
        return exports.defaults.module;
    if (exports.defaults.moduleName)
        return getModuleByName(config, exports.defaults.moduleName);
    return getModuleByName(config, definitionName);
}
exports.getModule = getModule;
/**
 * Gets an angular module by name.
 */
function getModuleByName(config, name) {
    try {
        return angular.module(name);
    }
    catch (err) {
        var dependencies = config.dependencies instanceof Array ? config.dependencies : ['ng'];
        return angular.module(name, dependencies);
    }
}
/**
 * Normalises a string, converting non-English-letters into singular spaces,
 * inserting spaces into case boundaries, and lowercasing.
 */
function normalise(name) {
    name = name.replace(/[^A-Za-z]+/g, ' ');
    for (var i = 0; i < name.length - 1; i++) {
        var prefix = name.slice(0, i + 1);
        var next = name[i + 1];
        if (/[a-z]/.test(name[i]) && /[A-Z]/.test(next)) {
            next = next.toLowerCase();
            name = prefix + ' ' + next + name.slice(i + 2);
        }
    }
    return name.trim().toLowerCase();
}
/**
 * Converts an identifier into kebab case.
 */
function kebabCase(name) {
    return normalise(name).replace(/ /g, '-');
}
exports.kebabCase = kebabCase;
/**
 * Converts an identifier into camelcase.
 */
function camelCase(name) {
    name = normalise(name);
    return name.replace(/ (.)/g, function (m, p1) { return p1.toUpperCase(); });
}
exports.camelCase = camelCase;
/**
 * Primitive version of lodash#zipObject.
 */
function zipObject(one, other) {
    var buffer = {};
    one.forEach(function (key, index) {
        buffer[key] = other[index];
    });
    return buffer;
}
exports.zipObject = zipObject;
/**
 * "Clones" the given function by wrapping it into a pass-through function.
 * Doesn't preserve arity ('.length') and argument names.
 */
function cloneFunction(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return func.call.apply(func, [this].concat(args));
    };
}
exports.cloneFunction = cloneFunction;
/**
 * Creates a random string that is unlikely to clash with other keys. This is
 * where you're supposed to use a Symbol, but Angular can't bind to a
 * symbol-keyed property.
 */
function randomString() {
    return (Math.random() * Math.pow(10, 16)).toString(16);
}
exports.randomString = randomString;
/**
 * Adds the given property to the list of items to autoinject onto the class
 * or prototype.
 */
function autoinject(target, propertyName) {
    if (!target.hasOwnProperty(exports.autoinjectKey))
        target[exports.autoinjectKey] = [];
    target[exports.autoinjectKey].push(propertyName);
}
exports.autoinject = autoinject;
/**
 * Used to store autoinject settings (list of things to inject onto the class
 * or the prototype).
 */
exports.autoinjectKey = typeof Symbol === 'function' ? Symbol('autoinjectSettings') : randomString();
/**
 * Used to store binding information (isolated scope settings).
 */
exports.scopeKey = typeof Symbol === 'function' ? Symbol('scopeSettings') : randomString();
/**
 * Assertion utility.
 */
function assert(ok) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!ok)
        throw new Error(args.join(' '));
}
exports.assert = assert;

},{}]},{},[3])(3)
});