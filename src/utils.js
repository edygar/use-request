import React from 'react'
import * as cache from './cache'

export function useStateMap(initialState) {
  const [state, setState] = React.useState(() => ({
    current:
      typeof initialState === 'function'
        ? initialState()
        : initialState || new Map(),
  }))

  return [
    state,
    stateUpdate => {
      if (stateUpdate) stateUpdate(state.current)
      setState({current: state.current})
    },
  ]
}

/**
 * In order to keep the ref always correctly updated
 * whenever the component is rendered with the value
 * changed, we updated ref as early as possible.
 *
 * Note: Before the component is rendered, we can never
 * know whether the value change is effective or if the
 * render will be bailed out.
 *
 * @param {any} value the value to keep the ref
 * @return {Object} the updated ref
 */
export function useUpdatedRef(value) {
  const ref = React.useRef(value)

  React.useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

export function identity(value) {
  return value
}

export function reject(e) {
  throw e
}

export function getCacheResolver({
  cacheBy,
  cacheByArgs,
  cacheByParams,
  bucket,
  mapRequestType,
  fetchPolicy,
}) {
  if (
    (cacheBy !== undefined && cacheByArgs !== undefined) ||
    (cacheBy !== undefined && cacheByParams !== undefined) ||
    (cacheByArgs !== undefined && cacheByParams !== undefined)
  ) {
    throw new Error(
      `You can't use cacheBy, cacheByParams and cacheByArgs simultaneosly, only one can be used at once.`,
    )
  }

  if (cacheBy !== undefined) {
    const getCacheId = typeof cacheBy === 'function' ? cacheBy : () => cacheBy

    if (mapRequestType === 'function')
      return cache.byArgs(getCacheId, {bucket, fetchPolicy})

    return cache.byParams(getCacheId, {bucket, fetchPolicy})
  }

  if (cacheByArgs) {
    return cache.byArgs(cacheByArgs === true ? undefined : cacheByArgs, {
      bucket,
      fetchPolicy,
    })
  }

  if (cacheByParams) {
    return cache.byParams(cacheByParams === true ? undefined : cacheByParams, {
      bucket,
      fetchPolicy,
    })
  }

  return identity
}

export function useCacheBucket(cacheBucket) {
  const [localBucket] = React.useState(() => new Map(), [])
  return cacheBucket === 'local'
    ? localBucket
    : cacheBucket === 'global'
    ? undefined
    : cacheBucket
}
