import React from 'react'
import useRequestFactory from './useRequestFactory'
import useUpdatedRef from './useUpdatedRef'
import {identity} from './utils'

export const idleState = {
  pending: false,
  status: 'idle',
  unsubscribe() {},
  abort() {},
}

export default function useRequestReporter({
  onStateChange = () => {},
  requestReport = identity,
  ...useRequestParams
}) {
  const [currentState, setState] = React.useState(idleState)
  const currentStateRef = useUpdatedRef(currentState)
  const onStateChangeRef = useUpdatedRef(onStateChange)

  const request = useRequestFactory({
    ...useRequestParams,
    onStateChange: React.useCallback(
      newState => {
        const report = requestReport(newState)
        setState(report)
        onStateChangeRef.current(currentStateRef.current)
      },
      [requestReport], // eslint-disable-line
    ),
  })

  return [
    React.useMemo(
      () => ({
        ...currentState,
        reset() {
          setState(idleState)
          onStateChangeRef.current(idleState)
        },
      }),
      [currentState], // eslint-disable-line
    ),
    request,
  ]
}
