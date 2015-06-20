'use strict';

/**
 * Mutable configuration object.
 */
export const defaults = {
  // Default angular module. Supersedes module declarations.
  module: <ng.IModule>null,
  // Default module name.
  moduleName: <string>null,
  // Controller key. Other common variants include 'ctrl' and 'vm'.
  controllerAs: 'self',
  // Generates a template url from an element name. Another common variant:
  // 'components/elementName/elementName.html'.
  makeTemplateUrl(elementName: string): string {
    return `${elementName}/${elementName}.html`;
  }
}

/**
 * Reuses or creates an angular module from the given configuration.
 */
export function getModule(config: lib.BaseConfig, definitionName: string): ng.IModule {
  if (config.module) return config.module;
  if (config.moduleName) return getModuleByName(config, config.moduleName);
  if (defaults.module) return defaults.module;
  if (defaults.moduleName) return getModuleByName(config, defaults.moduleName);
  return getModuleByName(config, definitionName);
}

/**
 * Gets an angular module by name.
 */
function getModuleByName(config: lib.BaseConfig, name: string): ng.IModule {
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
function normalise(name: string): string {
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
export function kebabCase(name: string): string {
  return normalise(name).replace(/ /g, '-');
}

/**
 * Converts an identifier into camelcase.
 */
export function camelCase(name: string): string {
  name = normalise(name);
  return name.replace(/ (.)/g, (m, p1: string) => p1.toUpperCase());
}

/**
 * Primitive version of lodash#zipObject.
 */
export function zipObject<T>(one: string[], other: T[]): {[key: string]: T} {
  var buffer: {[key: string]: T} = {};
  one.forEach((key, index) => {
    buffer[key] = other[index];
  });
  return buffer;
}

/**
 * "Clones" the given function by wrapping it into a pass-through function.
 * Doesn't preserve arity ('.length') and argument names.
 */
export function cloneFunction(func: Function) {
  return function(...args) {return func.call(this, ...args)};
}

/**
 * Creates a random string that is unlikely to clash with other keys. This is
 * where you're supposed to use a Symbol, but Angular can't bind to a
 * symbol-keyed property.
 */
export function randomString(): string {
  return (Math.random() * Math.pow(10, 16)).toString(16);
}

/**
 * Adds the given property to the list of items to autoinject onto the class
 * or prototype.
 */
export function autoinject(target: any, propertyName: string): void {
  if (!target.hasOwnProperty(autoinjectKey)) target[autoinjectKey] = [];
  target[autoinjectKey].push(propertyName);
}

/**
 * Used to store autoinject settings (list of things to inject onto the class
 * or the prototype).
 */
export var autoinjectKey = typeof Symbol === 'function' ? Symbol('autoinjectSettings') : randomString();

/**
 * Used to store binding information (isolated scope settings).
 */
export var scopeKey = typeof Symbol === 'function' ? Symbol('scopeSettings') : randomString();

/**
 * Assertion utility.
 */
export function assert(ok: boolean, ...args: string[]): void {
  if (!ok) throw new Error(args.join(' '));
}
