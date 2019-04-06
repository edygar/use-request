import React from 'react'
import {useUpdatedRef, identity, reject} from './utils'
import {requestStateReducer} from './requestStateReducer'
import AbortError from './AbortError'

/**
 * Default function for performing the request at `useRequest`.
 * It uses the native `fetch` with native `AbortController`
 * so polyfill according to your requirements.  Assumes `url`
 * as part of the `fetchParams`
 *
 * It creates its own AbortController so that it can be registered
 * with registerAbort, any signal present on fetchOptions will be
 * overwritten.
 *
 * @param {Object} requestState the current request state
 * @param {Request} requestState.params Definition for the request, including the url and fetch options
 * @param {Function} params.registerAborter Callback to set the aborter function
 * @param {Function} params.setProgress Communicates intermediate progress
 *
 * @return {Promise<Response>} the future response
 */
export function defaultPerformRequest(
  requestState,
  {/* setProgress, */ registerAborter},
) {
  if (!requestState.params) {
    throw new Error('useRequest: Invalid request parameters.')
  }
  const {
    params: {url, ...fetchOptions},
  } = requestState

  const controller = new AbortController()
  registerAborter(() => {
    controller.abort()
  })

  return fetch(url, {
    ...fetchOptions,
    signal: controller.signal,
  })
}

/**
 * Expects the fetch options, including the URL
 *
 * @param {Object} fetchOptions Options passed to the `fetch` function
 * @return {Object} fetchOptions noop
 */
export function defaultMapRequest(fetchOptions) {
  return fetchOptions
}

/**
 * Expects a fetch response and assumes JSON
 *
 * @param {Object} requestState the current state of the request
 */
export async function defaultMapResponse(requestState /* { setProgress } */) {
  const parsed = await requestState.responded.json()

  if (!requestState.responded.ok) {
    throw parsed
  }

  return parsed
}

/**
 * Make sure to schedule one microtask after "arg" execution
 * so if there's an abortion in its running, it wins the race
 *
 * @param {any} arg Any value to be projected to the last microtask
 * @return {Promise} a Promise with 2 steps
 */
function thenOnce(arg) {
  return Promise.resolve(arg).then(identity)
}

/**
 * Produces a callback that makes Requests, returning a Promise with
 * the last state, either a resolvution or rejection.
 *
 * The future object contains all the information around the request
 * from the arguments passed from consumer of the callback, parameters
 * the request, the own request, the own response, the mapped response,
 * also a `status` informing the last status ("resolved", "rejected", "aborted").
 *
 * @param {Boolean} throwOnAbortions whether the promise rejects on abortions.
 * @param {Boolean} throwOnRejections whether the promise rejects at all, it's
 *      usefull when the promises are not being used to control flow.
 * @param {Function} onChange called at each request state change
 * @param {Function|Object} request Object representing the parameters to
 *      perform request or a function that produces it from the arguments
 *      of the last call.
 * @param {Function} perform Receives the parameters and the registerAbort
 *      callback and peforms the request, returing a promise of it.
 * @param {Function} response called when request responds in order to map the
 *      request result to a consumable structure.
 * @param {Fuction} stateReducer reducer used to update the request state.
 *
 * @return {Function} request initiator
 */
export function useRequestInitiator({
  throwOnAbortions = false,
  throwOnRejections = false,
  onChange = () => {},
  request: mapRequest = payload => payload,
  response: mapResponse = defaultMapResponse,
  perform: performRequest = defaultPerformRequest,
  stateReducer: stateReducer = requestStateReducer,
} = {}) {
  /* As all of the params will be called during the async
   * function, they should be a ref so at each new render
   * with new values, they are updated and a on going async
   * function uses the latest values.
   */
  const counterRef = React.useRef(0)
  const mapRequestRef = useUpdatedRef(mapRequest)
  const mapResponseRef = useUpdatedRef(mapResponse)
  const performRequestRef = useUpdatedRef(performRequest)
  const throwOnAbortionsRef = useUpdatedRef(throwOnAbortions)
  const throwOnRejectionsRef = useUpdatedRef(throwOnRejections)
  const onChangeRef = useUpdatedRef(onChange)
  const stateReducerRef = useUpdatedRef(stateReducer)

  return React.useCallback(
    async function request(...args) {
      let state, abort, onAbort
      let requestEnded = false

      const abortion = new Promise(resolve => {
        abort = () => {
          if (requestEnded) return
          if (onAbort) onAbort()
          resolve(new AbortError('The operation was aborted.'))
        }
      })

      try {
        await dispatch({
          type: 'init',
          payload: {
            requestId: Symbol(counterRef.current++),
            args,
          },
        })

        const params = await Promise.race([
          abortion.then(reject),
          thenOnce(
            typeof mapRequestRef.current === 'function'
              ? mapRequestRef.current(...args)
              : mapRequestRef.current,
          ),
        ])

        await dispatch({
          type: 'params_defined',
          payload: params,
        })

        const requested = performRequestRef.current(state, {
          setProgress,
          registerAborter: providedAborter => {
            onAbort = providedAborter
          },
        })

        await dispatch({
          type: 'request_sent',
          payload: requested,
        })

        const responded = await Promise.race([abortion.then(reject), requested])
        requestEnded = true

        await dispatch({
          type: 'response_received',
          payload: responded,
        })

        const resolved = await Promise.race([
          abortion.then(reject),
          thenOnce(mapResponseRef.current(state, {setProgress})),
        ])

        await dispatch({
          type: 'request_succeeded',
          payload: resolved,
        })
      } catch (rejected) {
        requestEnded = true
        if (rejected instanceof Error && rejected.name === 'AbortError') {
          dispatch({
            type: 'request_aborted',
            payload: rejected,
          })

          if (throwOnAbortionsRef.current) throw state
        } else {
          dispatch({
            type: 'request_failed',
            payload: rejected,
          })

          if (throwOnRejectionsRef.current) throw state
        }
      }

      return state

      function dispatch(action) {
        state = stateReducerRef.current(state, action)

        if (requestEnded) {
          return onChangeRef.current(state, {abort, setProgress})
        }

        return Promise.race([
          abortion.then(reject),
          thenOnce(onChangeRef.current(state, {abort, setProgress})),
        ])
      }

      function setProgress(payload) {
        dispatch({
          type: 'progress',
          payload,
        })
      }
    },
    /**
     * The callback doesn't ever change, as the hook params
     * are consumed as refs, once they need to be always
     * up-to-date
     */
    [], // eslint-disable-line
  )
}
