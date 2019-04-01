import React from 'react'
import * as cache from './cache'

export function identity(value) {
  return value
}

export function getCacheReducer({
  cacheBy,
  cacheByArgs,
  cacheByParams,
  bucket,
  mapRequestType,
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

    if (mapRequestType === 'function') return cache.byArgs(getCacheId, {bucket})

    return cache.byParams(getCacheId, {bucket})
  }

  if (cacheByArgs) {
    return cache.byArgs(cacheByArgs === true ? undefined : cacheByArgs, {
      bucket,
    })
  }

  if (cacheByParams) {
    return cache.byArgs(cacheByParams === true ? undefined : cacheByParams, {
      bucket,
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
