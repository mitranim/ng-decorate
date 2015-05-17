/**
 * Mutable configuration values.
 */
export class defaults {
  static module: ng.IModule = null
  static moduleName: string = null
  static controllerAs: string = 'self'
  static makeTemplateUrl(selector: string): string {
    return `${selector}/${selector}.html`
  }
}

/**
 * Reuses or creates an angular module from the given configuration.
 */
export function getModule(config: BaseConfig, definitionName: string): ng.IModule {
  if (config.module) return config.module
  if (config.moduleName) return getModuleByName(config, config.moduleName)
  if (defaults.module) return defaults.module
  if (defaults.moduleName) return getModuleByName(config, defaults.moduleName)
  return getModuleByName(config, definitionName)
}

/**
 * Gets an angular module by name.
 */
function getModuleByName(config: BaseConfig, name: string): ng.IModule {
  try {
    return angular.module(name)
  } catch (err) {
    var dependencies = config.dependencies instanceof Array ? config.dependencies : ['ng']
    return angular.module(name, dependencies)
  }
}

/**
 * Normalises a string, converting non-English-letters into singular spaces,
 * inserting spaces into case boundaries, and lowercasing.
 */
function normalise(name: string): string {
  name = name.replace(/[^A-Za-z]+/g, ' ')

  for (var i = 0; i < name.length - 1; i++) {
    var prefix = name.slice(0, i + 1)
    var next = name[i + 1]

    if (/[a-z]/.test(name[i]) && /[A-Z]/.test(next)) {
      next = next.toLowerCase()
      name = prefix + ' ' + next + name.slice(i + 2)
    }
  }

  return name.trim().toLowerCase()
}

/**
 * Converts an identifier into kebab case.
 */
export function kebabCase(name: string): string {
  return normalise(name).replace(/ /g, '-')
}

/**
 * Converts an identifier into camelcase.
 */
export function camelCase(name: string): string {
  name = normalise(name)
  return name.replace(/ (.)/g, (m, p1: string) => p1.toUpperCase())
}

/**
 * Primitive version of lodash#zipObject.
 */
export function zipObject(one: string[], other: any[]): {} {
  var buffer = {}
  one.forEach((key, index) => {
    buffer[key] = other[index]
  })
  return buffer
}
