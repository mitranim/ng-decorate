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
