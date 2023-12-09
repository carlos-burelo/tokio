export class Matcher {
  static #EXTENSION_REGEX = /\.[^/.]+$/i
  static #INDEX_REGEX = /\/index(?=\/|$)/i
  static #SLASHES_REGEX = /\\/g
  static #DYNAMIC_REGEX = /\/\[(\w+)\]/g
  static #MULTIPLE_REGEX = /\[\.{3}(\w+)\]/g
  static #DYNAMIC_STRING = '/(?<$1>[^/]+)'
  static #MULTIPLE_STRING = '(?<$1>.*)'

  static COOKIE_REG = /([^;=\s]*)=([^;]*)/g

  static build (path: string, BASE: string) {
    const regex = path
      .replace(this.#EXTENSION_REGEX, '')
      .replace(BASE, '')
      .replace(this.#SLASHES_REGEX, '/')
      .replace(this.#INDEX_REGEX, '')
      .replace(this.#DYNAMIC_REGEX, this.#DYNAMIC_STRING)
      .replace(this.#MULTIPLE_REGEX, this.#MULTIPLE_STRING)
    return `^${regex}/?$`
  }
}
