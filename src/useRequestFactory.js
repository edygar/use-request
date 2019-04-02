import React from 'react'
import useUpdatedRef from './useUpdatedRef'
import requestStateReducer from './requestStateReducer'
import AbortError from './AbortError'

/**
 * Default function for performing the request at `useRequest`.
 *
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
 * @param {Function} registerAborter Callback to set the aborter function
 *
 * @return {Promise<Response>} the future response
 */
export function defaultPerformRequest(requestState, registerAborter) {
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
export async function defaultMapResponse(requestState) {
  const parsed = await requestState.responded.json()

  if (!requestState.responded.ok) {
    throw parsed
  }

  return parsed
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
 * @param {Function} onStateChange called at each request state change
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
export default function useRequestFactory({
  throwOnAbortions = false,
  throwOnRejections = false,
  onStateChange = () => {},
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
  const mapRequestRef = useUpdatedRef(mapRequest)
  const mapResponseRef = useUpdatedRef(mapResponse)
  const performRequestRef = useUpdatedRef(performRequest)
  const throwOnAbortionsRef = useUpdatedRef(throwOnAbortions)
  const throwOnRejectionsRef = useUpdatedRef(throwOnRejections)
  const onStateChangeRef = useUpdatedRef(onStateChange)
  const stateReducerRef = useUpdatedRef(stateReducer)

  return React.useCallback(
    async function request(...args) {
      let aborted = false
      let interruped = false
      let unsubscribed = false
      let state
      const requestArgs = args

      try {
        propagateChange({
          type: 'init',
          payload: {
            unsubscribe() {
              unsubscribed = true
            },
            abort() {
              aborted = true
            },
            args: requestArgs,
          },
        })

        const params = await (typeof mapRequestRef.current === 'function'
          ? mapRequestRef.current(...args)
          : mapRequestRef.current)

        propagateChange({
          type: 'params_defined',
          payload: params,
        })

        let abort
        const requested = performRequestRef.current(state, aborter => {
          abort = aborter
        })

        propagateChange({
          type: 'request_sent',
          payload: {
            requested,
            abort() {
              abort()
              aborted = true
            },
          },
        })

        const responded = await requested

        propagateChange({
          type: 'response_received',
          payload: {
            requested,
            responded,
            abort() {
              aborted = true
            },
          },
        })

        const resolved = await mapResponseRef.current(state)

        propagateChange({
          type: 'request_succeeded',
          payload: {
            resolved,
            abort() {},
          },
        })

        return state
      } catch (rejected) {
        interruped = true
        if (rejected instanceof Error && rejected.name === 'AbortError') {
          propagateChange({
            type: 'request_aborted',
            payload: {
              rejected,
              abort() {},
            },
          })
          if (throwOnAbortionsRef.current) throw state

          return state
        }

        propagateChange({
          type: 'request_failed',
          payload: {
            rejected,
            abort() {},
          },
        })

        if (throwOnRejectionsRef.current) throw state

        return state
      }

      function propagateChange(action) {
        // Checks for abortions from the last life cycle update
        if (aborted && !interruped)
          throw new AbortError('The operation was aborted.')

        state = stateReducerRef.current(state, action)

        if (!unsubscribed) onStateChangeRef.current(state)

        // Checks for abortions from the last onStateChange call
        if (aborted && !interruped)
          throw new AbortError('The operation was aborted.')
      }
    },
    [], // eslint-disable-line
  )
}
