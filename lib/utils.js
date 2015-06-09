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
    if (!target[exports.autoinjectKey])
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
