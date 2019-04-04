import React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import {useRequestInitiator} from './useRequestInitiator'
import {
  getCacheReducer,
  useCacheBucket,
  useUpdatedRef,
  useStateMap,
} from './utils'

/**
 * Provides all ongoing requests hosted by this hook and a method to
 * request more.
 *
 * @returns {Array} RequestState(s) and RequestInitiator, consecutively.
 *    In case of falsy {@param concurrentRequests}, first item is the single RequestState
 *    Otherwise, first item is an array of the current requests.
 *
 *    The second position is the requestInitiator bound to this manager
 */
export function useRequest({
  abortOnUnmount = false,
  abortOnRelease = true,
  cacheBucket = 'local',
  cacheBy = undefined,
  cacheByParams = undefined,
  cacheByArgs = undefined,
  concurrentRequests = false,
  ...params
}) {
  const concurrentRequestsRef = useUpdatedRef(concurrentRequests)
  const abortOnReleaseRef = useUpdatedRef(abortOnRelease)
  const abortOnUnmountRef = useUpdatedRef(abortOnUnmount)
  const bucket = useCacheBucket(cacheBucket)
  const mapRequest = params.request
  const mapRequestType = typeof mapRequest
  const [requestsMapRef, updateMap] = useStateMap()

  const applyCachePolicy = React.useMemo(
    () =>
      getCacheReducer({
        cacheBy,
        cacheByArgs,
        cacheByParams,
        mapRequestType,
        bucket,
      }),
    [cacheBy, cacheByArgs, cacheByParams, mapRequestType, bucket],
  )

  function release(requestId) {
    updateMap(map => {
      const requestState = map.get(requestId)
      if (abortOnReleaseRef.current) {
        requestState.abort()
      }

      map.delete(requestId)
    })
  }

  const performRequest = useRequestInitiator({
    ...params,
    onChange: applyCachePolicy((state, helpers) => {
      if (
        !requestsMapRef.current.has(state.requestId) &&
        state.status !== 'init'
      )
        return

      requestsMapRef.current.set(state.requestId, {
        ...state,
        ...helpers,
        release: release.bind(state.requestId),
        repeat: () => performRequest(...state.args),
      })

      updateMap()
    }),
  })

  const releaseExceeded = React.useCallback(
    () => {
      const limit =
        concurrentRequestsRef.current === true
          ? Infinity
          : parseInt(concurrentRequestsRef.current, 10)

      if (requestsMapRef.current.size > limit) {
        let toRemove = requestsMapRef.current.size - limit
        for (const [, requestState] of requestsMapRef.current.entries()) {
          requestState.release()
          if (!toRemove--) break
        }
      }
    },
    [], // eslint-disable-line
  )

  const requestRef = useUpdatedRef(
    React.useCallback(
      (...args) => {
        releaseExceeded()
        return performRequest(...args)
      },
      [performRequest, updateMap], // eslint-disable-line react-hooks/exhaustive-deps
    ),
  )

  useDeepCompareEffect(() => {
    if (typeof params.request === 'function') {
      if (params.request) {
        requestRef.current(params.request)
      } else {
        releaseExceeded()
        updateMap()
      }
    }
  }, [params.request])

  React.useEffect(
    () => () => {
      if (abortOnUnmountRef.current) {
        for (const [, requestState] of requestsMapRef.current.entries()) {
          requestState.abort()
        }
      }
    },
    [], // eslint-disable-line
  )

  return [
    concurrentRequests === false
      ? Array.from(requestsMapRef.current)[requestsMapRef.current.size - 1]
      : Array.from(requestsMapRef.current.values()),
    requestRef.current,
  ]
}
