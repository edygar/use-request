/**
 * Helper Class to produce local spec-compliant abortations
 */
export default class AbortError extends ('DOMError' in global
  ? DOMError
  : Error) {
  constructor(...args) {
    super(...args)
    this.name = 'AbortError'
  }
}
