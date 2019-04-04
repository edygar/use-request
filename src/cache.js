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
export function defaultGetCachedIdByArgs(...args) {
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
  {fetchPolicy = 'cache-first', bucket: localBucket = bucket} = {},
) {
  return onChange => (state, helpers) => {
    if (state.status === 'aborted' && 'resolved' in state) {
      onChange({...state, status: 'resolved'}, helpers)
    }

    if (state.status === 'parameterized' && fetchPolicy.match(/(?!no-)cache/)) {
      const cacheId = getCacheId(state)
      if (cacheId !== null && localBucket.has(cacheId)) {
        const fromCache = localBucket.get(cacheId)

        if (fetchPolicy === 'cache-only') {
          helpers.abort()
        }

        onChange({...fromCache, ...state, status: 'resolved'}, helpers)
        return
      }
    }

    if (state.status === 'resolved') {
      const cacheId = getCacheId(state.params)
      localBucket.set(cacheId, state)
    }

    onChange(state, helpers)
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
  getCacheId = defaultGetCachedIdByArgs,
  {fetchPolicy = 'cache-first', bucket: localBucket = bucket} = {},
) {
  return onChange => (state, helpers) => {
    if (state.status === 'aborted' && 'resolved' in state) {
      onChange({...state, status: 'resolved'}, helpers)
    }

    if (state.status === 'parameterized' && fetchPolicy.match(/(?!no-)cache/)) {
      const cacheId = getCacheId(state)
      if (cacheId !== null && localBucket.has(cacheId)) {
        const fromCache = localBucket.get(cacheId)

        if (fetchPolicy === 'cache-only') {
          helpers.abort()
        }

        onChange({...fromCache, ...state, status: 'resolved'}, helpers)
        return
      }
    }

    if (state.status === 'resolved') {
      const cacheId = getCacheId(state.args)
      localBucket.set(cacheId, state)
    }

    onChange(state, helpers)
  }
}
