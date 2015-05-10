'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Reuses or creates an angular module from the given configuration.
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

function getModule(config, definitionName) {
  if (config.module) return config.module;
  var name = config.moduleName || definitionName;
  try {
    return angular.module(name);
  } catch (err) {
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
function kebabCase(name) {
  return normalise(name).replace(/ /g, '-');
}

function camelCase(name) {
  name = normalise(name);
  return name.replace(/ (.)/g, function (m, p1) {
    return p1.toUpperCase();
  });
}