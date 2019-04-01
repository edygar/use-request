import React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import defaultRequestStateReducer from './requestStateReducer'
import useRequestReporter from './useRequestReporter'
import useUpdatedRef from './useUpdatedRef'
import * as cache from './cache'

const identity = state => state

export function getCacheReducer({
  cacheBy,
  cacheByArgs,
  cacheByParams,
  bucket,
  mapRequestType,
}) {
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

export default function useRequest({
  auto = true,
  abortOnUnmount = false,
  cacheBucket = 'local',
  cacheBy = undefined,
  cacheByParams = undefined,
  cacheByArgs = undefined,
  stateReducer = defaultRequestStateReducer,
  ...params
}) {
  const abortOnUnmountRef = useUpdatedRef(abortOnUnmount)
  const [localBucket] = React.useState(() => new Map(), [])
  const bucket =
    cacheBucket === 'local'
      ? localBucket
      : cacheBucket === 'global'
      ? undefined
      : cacheBucket

  if (
    (cacheBy !== undefined && cacheByArgs !== undefined) ||
    (cacheBy !== undefined && cacheByParams !== undefined) ||
    (cacheByArgs !== undefined && cacheByParams !== undefined)
  ) {
    throw new Error(
      `You can't use cacheBy, cacheByParams and cacheByArgs simultaneosly, only one can be used at once.`,
    )
  }

  const mapRequest = params.request
  const mapRequestType = typeof mapRequest
  const finalCacheBy = getCacheReducer({
    cacheBy,
    cacheByArgs,
    cacheByParams,
    mapRequestType,
    bucket,
  })

  const [state, performRequest] = useRequestReporter({
    ...params,
    stateReducer: (newState, action) =>
      stateReducer(finalCacheBy(newState, action), action),
  })
  const stateRef = useUpdatedRef(state)

  const requestRef = useUpdatedRef(
    React.useCallback(
      (...args) => {
        stateRef.current.unsubscribe()
        performRequest(...args)
      },
      [performRequest, stateRef],
    ),
  )

  const requestPayload = React.useMemo(
    () => ({
      payload:
        auto && typeof mapRequest === 'function' ? mapRequest() : mapRequest,
    }),
    [auto, mapRequest],
  )

  useDeepCompareEffect(() => {
    if (auto) {
      if (requestPayload.payload) {
        stateRef.current.abort()
        requestRef.current(requestPayload.payload)
      }
    }
  }, [requestPayload, auto])

  React.useEffect(() => {
    if (!auto) {
      stateRef.current.abort()
    }
  }, [auto, stateRef])

  React.useEffect(
    () => () => {
      if (abortOnUnmountRef.current) {
        stateRef.current.abort()
      }
    },
    [abortOnUnmountRef, stateRef],
  )

  return [state, requestRef.current]
}
