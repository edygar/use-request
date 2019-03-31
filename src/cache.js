import requestStateReducer from './requestStateReducer'

export const bucket = new Map()

/**
 * Converts GET Request Params into cache id, otherwise, null
 *
 * @param {Request} params Definition for the request, including the url and fetch options
 *
 * @return {String} the cache id
 */
export function defaultGetCachedIdByParams(params) {
  if (params.method && params.method.toLowerCase() !== 'get') {
    return null
  }
  return JSON.stringify(params)
}

/**
 * Converts arguments given to request initiator into cache id
 *
 * @return {String} the cache id
 */
export function defaultGetCachedId(...args) {
  return JSON.stringify(args)
}

/**
 * Produces a stateReducerFn that caches requests by their params
 *
 * @param {Function} getCacheId retrieves an unique id from params to retrieve later
 * @param {Object} params.bucket The bucket to where the cache is going to be saved
 * @returns {Function} the resulting stateReducerFn
 */
export function byParams(
  getCacheId = defaultGetCachedIdByParams,
  {bucket: localBucket = bucket} = {},
) {
  return (state, action) => {
    const newState = requestStateReducer(state, action)

    if (action.type === 'params_defined') {
      const cacheId = getCacheId(action.payload)
      if (cacheId !== null && localBucket.has(cacheId)) {
        const fromCache = localBucket.get(cacheId)
        return {...fromCache, ...newState}
      }
    }

    if (action.type === 'request_succeeded') {
      const cacheId = getCacheId(newState.params)
      localBucket.set(cacheId, newState)
    }

    return newState
  }
}

/**
 * Produces a stateReducerFn that caches requests by their args
 *
 * @param {Function} getCacheId retrieves an unique id from arguments to retrieve later
 * @param {Object} params.bucket The bucket to where the cache is going to be saved
 * @returns {Function} the resulting stateReducerFn
 */
export function byArgs(
  getCacheId = defaultGetCachedId,
  {bucket: localBucket = bucket} = {},
) {
  return (state, action) => {
    const newState = requestStateReducer(state, action)

    if (action.type === 'init') {
      const cacheId = getCacheId(...action.payload.args)
      if (cacheId !== null && localBucket.has(cacheId)) {
        // defines already from cache
        return {...localBucket.get(cacheId), ...newState}
      }
    }

    if (action.type === 'request_succeeded') {
      localBucket.set(getCacheId(...newState.args), newState)
    }

    return newState
  }
}
