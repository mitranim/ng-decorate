var utils = require('./utils');
function service(config, ambient) {
    console.assert(config != null && typeof config === 'object', "expected a configuration object, got: " + config);
    if (!ambient)
        console.assert(!!config.serviceName, 'you must provide a service name');
    return function (constructor) {
        var module = utils.getModule(config, config.serviceName);
        // Injector function that assigns the injected services to the class.
        injector.$inject = [].concat(config.inject || [], config.injectStatic || []);
        function injector() {
            var injected = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                injected[_i - 0] = arguments[_i];
            }
            var map = utils.zipObject(injector.$inject, injected);
            // Assign injected values to the prototype.
            if (config.inject) {
                config.inject.forEach(function (token) {
                    constructor.prototype[token] = map[token];
                });
            }
            // Assign injected values to the class.
            if (config.injectStatic) {
                config.injectStatic.forEach(function (token) {
                    constructor[token] = map[token];
                });
            }
        }
        // Instantiate the service and assign the injected values.
        module.run(injector);
        // If the context is not ambient, register the factory.
        if (!ambient)
            module.factory(config.serviceName, function () { return constructor; });
    };
}
/**
 * Defines a generic angular service.
 */
function Service(config) {
    return service(config, false);
}
exports.Service = Service;
/**
 * Ambient service. We inject it with DI values without exporting the class
 * into the angular DI environment.
 */
function Ambient(config) {
    return service(config, true);
}
exports.Ambient = Ambient;
