import React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import defaultRequestStateReducer from './requestStateReducer'
import useRequestReporter from './useRequestReporter'
import useUpdatedRef from './useUpdatedRef'
import {getCacheReducer, useCacheBucket} from './utils'

export default function useRequest({
  auto = true,
  abortOnUnmount = false,
  cacheBucket = 'local',
  cacheBy = undefined,
  cacheByParams = undefined,
  cacheByArgs = undefined,
  stateReducer = defaultRequestStateReducer,
  concurrentRequests = false,
  abort = requestState => requestState.abort(),
  unsubscribe = requestState => requestState.unsubscribe(),
  ...params
}) {
  const abortRef = useUpdatedRef(abort)
  const unsubscribeRef = useUpdatedRef(unsubscribe)
  const concurrentRequestsRef = useUpdatedRef(concurrentRequests)
  const abortOnUnmountRef = useUpdatedRef(abortOnUnmount)
  const bucket = useCacheBucket(cacheBucket)
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
        if (concurrentRequestsRef.current === false) {
          unsubscribeRef.current(stateRef.current)
          abortRef.current(stateRef.current)
        }
        return performRequest(...args)
      },
      [performRequest], // eslint-disable-line
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
        requestRef.current(requestPayload.payload)
      }
    }
  }, [requestPayload, auto])

  React.useEffect(() => {
    if (!auto) {
      abortRef.current(stateRef.current)
    }
  }, [auto]) // eslint-disable-line

  React.useEffect(
    () => () => {
      if (abortOnUnmountRef.current) {
        abortRef.current(stateRef.current)
      }
    },
    [], // eslint-disable-line
  )

  return [state, requestRef.current]
}
