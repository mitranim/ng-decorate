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
        if (!Class.scope)
            Class.scope = {};
        Class.scope[propertyName] = descriptor;
    };
}
/**
 * Semantic version of @bind('@').
 *
 * Example usage:
 *   class VM {
 *     @bindString() first: string;
 *     @bindString('secunda') second: string;
 *   }
 */
function bindString(key) {
    if (key === void 0) { key = ''; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class.scope)
            Class.scope = {};
        Class.scope[propertyName] = '@' + key;
    };
}
exports.bindString = bindString;
/**
 * Semantic version of @bind() or @bind('=').
 *
 * Example usage:
 *   class VM {
 *     @bindTwoWay() first: {};
 *     @bindTwoWay({optional: true, key: 'secunda', collection: true})
 *     second: string[];
 *   }
 */
function bindTwoWay(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class.scope)
            Class.scope = {};
        Class.scope[propertyName] = '=' + encodeDescriptor(options);
    };
}
exports.bindTwoWay = bindTwoWay;
/**
 * Semantic version of @bind('&').
 *
 * Example usage:
 *   class VM {
 *     @bindExpression() first: Function;
 *     @bindExpression('secunda') second: Function;
 *   }
 */
function bindExpression(key) {
    if (key === void 0) { key = ''; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class.scope)
            Class.scope = {};
        Class.scope[propertyName] = '&' + key;
    };
}
exports.bindExpression = bindExpression;
/**
 * Emulates a one-way binding, which is not supported by Angular natively.
 * Uses a hidden '&' binding and a getter/setter pair to make the decorated
 * property read-only.
 *
 * Example usage:
 *   class VM {
 *     @bindOneWay() first: Function;
 *     @bindOneWay('secunda') second: string;
 *     constructor() {
 *       this.first = null;    // has no effect
 *       this.first();         // works
 *       this.second = null;   // has no effect
 *       this.second !== null; // might be true
 *     }
 *   }
 */
function bindOneWay(key) {
    if (key === void 0) { key = ''; }
    return function (target, propertyName) {
        var Class = target.constructor;
        if (!Class.scope)
            Class.scope = {};
        var secretKey = randomString();
        Class.scope[secretKey] = '&' + (key || propertyName);
        Object.defineProperty(target, propertyName, {
            get: function () { return this[secretKey](); },
            set: function (_) { }
        });
    };
}
exports.bindOneWay = bindOneWay;
/**
 * Generates a descriptor string suffix from the given options.
 */
function encodeDescriptor(options) {
    return (options.collection ? '*' : '') + (options.optional ? '?' : '') + (options.key || '');
}
/**
 * Creates a random string that is unlikely to clash with other keys. This is
 * where you're supposed to use a Symbol, but Angular can't bind to a
 * symbol-keyed property.
 */
function randomString() {
    return (Math.random() * Math.pow(10, 16)).toString(16);
}
