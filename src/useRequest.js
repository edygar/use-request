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
  releaseOnAbort = true,
  cacheBucket = 'local',
  cacheBy = undefined,
  cacheByParams = undefined,
  cacheByArgs = undefined,
  concurrentRequests = false,
  fetchPolicy,
  ...params
}) {
  const silence = React.useRef(false)
  const concurrentRequestsRef = useUpdatedRef(concurrentRequests)
  const releaseOnAbortRef = useUpdatedRef(releaseOnAbort)
  const abortOnReleaseRef = useUpdatedRef(abortOnRelease)
  const abortOnUnmountRef = useUpdatedRef(abortOnUnmount)
  const onChangeRef = useUpdatedRef(params.onChange || false)
  const bucket = useCacheBucket(cacheBucket)
  const mapRequest = params.request
  const mapRequestType = typeof mapRequest
  const [requestsMapRef, updateMap] = useStateMap()

  // Although it's never reassign, requestRef is referred on callbacks
  // before its declaration, therefore, `let`, so it can be referred but
  // later assigned
  let requestRef // eslint-disable-line prefer-const

  const getResult = () =>
    concurrentRequests === false
      ? Array.from(requestsMapRef.current.values())[
          requestsMapRef.current.size - 1
        ] || idleState
      : Array.from(requestsMapRef.current.values())

  const resultingState = React.useMemo(getResult, [
    concurrentRequests,
    requestsMapRef,
  ])

  const applyCachePolicy = getCacheResolver({
    fetchPolicy,
    cacheBy,
    cacheByArgs,
    cacheByParams,
    mapRequestType,
    bucket,
  })

  function release(requestId, shouldAbort = abortOnReleaseRef.current) {
    if (!requestsMapRef.current.has(requestId)) return
    const requestState = requestsMapRef.current.get(requestId)
    if (shouldAbort) {
      requestState.abort()
    }

    requestsMapRef.current.delete(requestId)

    if (!silence.current) updateMap()
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
        repeat: () => requestRef.current(...state.args),
      })

      if (onChangeRef.current)
        onChangeRef.current(getResult(), requestRef.current)

      if (state.status === 'aborted' && releaseOnAbortRef.current) {
        release(state.requestId)
      }

      if (!silence.current) updateMap()
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

  requestRef = useUpdatedRef(
    React.useCallback(
      (...args) => {
        releaseExceeded()
        return performRequest(...args)
      },
      [performRequest], // eslint-disable-line react-hooks/exhaustive-deps
    ),
  )

  useDeepCompareEffect(() => {
    if (typeof params.request !== 'function') {
      if (params.request) {
        requestRef.current(params.request)
      } else {
        releaseExceeded()
        if (!silence.current) updateMap()
      }
    }
  }, [{request: params.request}])

  React.useEffect(
    () => () => {
      silence.current = true // eslint-disable-line react-hooks/exhaustive-deps
      if (abortOnUnmountRef.current) {
        for (const [, requestState] of requestsMapRef.current.entries()) {
          requestState.abort()
        }
      }
    },
    [], // eslint-disable-line
  )

  return [resultingState, requestRef.current]
}
