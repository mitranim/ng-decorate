/**
 * Mutable configuration values.
 */
var defaults = (function () {
    function defaults() {
    }
    defaults.makeTemplateUrl = function (selector) {
        return selector + "/" + selector + ".html";
    };
    defaults.module = null;
    defaults.moduleName = null;
    defaults.controllerAs = 'self';
    return defaults;
})();
exports.defaults = defaults;
/**
 * Reuses or creates an angular module from the given configuration.
 */
function getModule(config, definitionName) {
    if (config.module)
        return config.module;
    if (config.moduleName)
        return getModuleByName(config, config.moduleName);
    if (defaults.module)
        return defaults.module;
    if (defaults.moduleName)
        return getModuleByName(config, defaults.moduleName);
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
