import React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import defaultRequestStateReducer from './requestStateReducer'
import useRequestReporter from './useRequestReporter'
import useUpdatedRef from './useUpdatedRef'
import * as cache from './cache'

const none = state => state
export default function useRequest({
  auto = true,
  abortOnUnmount = true,
  cache: shouldCache = false,
  getCacheId = cache.defaultGetCachedId,
  cacheBucket = 'local',
  cacheBy = undefined,
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

  const finalCacheBy =
    shouldCache === false && !cacheBy
      ? none
      : cacheBy === 'params' ||
        shouldCache === true ||
        typeof cacheBy === 'function'
      ? cache.byParams(typeof cacheBy === 'function' ? cacheBy : getCacheId, {
          bucket,
        })
      : cache.byArgs(getCacheId, {bucket})
  const [state, performRequest] = useRequestReporter({
    ...params,
    stateReducer: (newState, action) =>
      stateReducer(finalCacheBy(newState, action), action),
  })
  const stateRef = useUpdatedRef(state)
  const mapRequest = params.request

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
