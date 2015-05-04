'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Shared utilities.
 */

/**
 * Takes a class and optionally a hash of options and infers the name for the
 * directive / service / module.
 */
exports.getName = getName;

/**
 * Takes a previously deduced name and converts it into a module name in
 * concordance with the given options.
 */
exports.getModuleName = getModuleName;

/**
 * Takes a hash of options and tries to retrieve or create an angular module.
 */
exports.getModule = getModule;

/**
 * Converts an identifier into kebab case.
 */
exports.kebabCase = kebabCase;

/**
 * Converts an identifier into camelcase.
 */
exports.camelCase = camelCase;

/**
 * Converts an identifier into start case.
 */
exports.startCase = startCase;

function getName(constructor, config) {
  // If a name is provided explicitly, just use it.
  if (config.name) return config.name;

  // Otherwise try to figure it out from the selector.
  if (config.selector) return camelCase(config.selector);

  // Otherwise use the name of the provided class.
  var name = constructor.name;

  // If this is a directive definition, use camelcase.
  if (config.selector) name = camelCase(name);

  if (!name) {
    throw new Error('couldn\'t infer name when decorating constructor: ' + constructor);
  }

  return name;
}

function getModuleName(name, config) {
  if (config.modulePrefix) return '' + config.modulePrefix + '.' + name;
  return name;
}

function getModule(constructor, config) {
  // If an actual module is provided (the value is assumed to be one), use it
  // and ignore other options.
  if (config.module) return config.module;

  // Deduce module name.
  var name = getModuleName(getName(constructor, config), config);

  // Deduce module dependencies.
  var deps = config.moduleDeps instanceof Array ? config.moduleDeps : ['ng'];

  return angular.module(name, deps);
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
function kebabCase(name) {
  return normalise(name).replace(/ /g, '-');
}

function camelCase(name) {
  name = normalise(name);
  return name.replace(/ (.)/g, function (m, p1) {
    return p1.toUpperCase();
  });
}

function startCase(name) {
  name = camelCase(name);
  return name[0].toUpperCase() + name.slice(1);
}