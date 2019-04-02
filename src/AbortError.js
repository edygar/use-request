/**
 * Helper Class to produce local spec-compliant abortations
 */
export default class AbortError extends Error {
  constructor(...args) {
    super(...args)
    this.name = 'AbortError'
  }
}
