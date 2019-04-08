import React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import {useRequestInitiator} from './useRequestInitiator'
import {
  getCacheResolver,
  useCacheBucket,
  useUpdatedRef,
  useStateMap,
} from './utils'

const idleState = {
  status: 'idle',
  pending: false,
  release() {},
  abort() {},
}

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
  fetchPolicy,
  ...params
}) {
  const concurrentRequestsRef = useUpdatedRef(concurrentRequests)
  const abortOnReleaseRef = useUpdatedRef(abortOnRelease)
  const abortOnUnmountRef = useUpdatedRef(abortOnUnmount)
  const onChangeRef = useUpdatedRef(params.onChange)
  const bucket = useCacheBucket(cacheBucket)
  const mapRequest = params.request
  const mapRequestType = typeof mapRequest
  const [requestsMapRef, updateMap] = useStateMap()

  const resultingState = React.useMemo(
    () =>
      concurrentRequests === false
        ? Array.from(requestsMapRef.current.values())[
            requestsMapRef.current.size - 1
          ] || idleState
        : Array.from(requestsMapRef.current.values()),
    [concurrentRequests, requestsMapRef],
  )

  const applyCachePolicy = getCacheResolver({
    fetchPolicy,
    cacheBy,
    cacheByArgs,
    cacheByParams,
    mapRequestType,
    bucket,
  })

  function release(requestId) {
    updateMap(map => {
      if (!map.has(requestId)) return
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
        state.status !== 'resolved' &&
        state.status !== 'init'
      )
        return

      requestsMapRef.current.set(state.requestId, {
        ...(requestsMapRef.current.get(state.requestId) || {}),
        ...state,
        ...helpers,
        release: release.bind(null, state.requestId),
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
          : parseInt(concurrentRequestsRef.current || 0, 10)

      if (requestsMapRef.current.size > limit) {
        let toRemove = requestsMapRef.current.size - limit
        for (const [, requestState] of requestsMapRef.current.entries()) {
          requestState.release()
          if (!toRemove--) break
        }
      }
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
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
    if (typeof params.request !== 'function') {
      if (params.request) {
        requestRef.current(params.request)
      } else {
        releaseExceeded()
        updateMap()
      }
    }
  }, [{request: params.request}])

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

  React.useEffect(
    () => () => {
      if (typeof onChangeRef.current === 'function') {
        onChangeRef.current(resultingState, requestRef.current)
      }
    },
    [resultingState], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return [resultingState, requestRef.current]
}
