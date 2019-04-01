import React from 'react'
import useRequestFactory from './useRequestFactory'
import useUpdatedRef from './useUpdatedRef'

export const idleState = {
  pending: false,
  status: 'idle',
  unsubscribe() {},
  abort() {},
}

export default function useRequestReporter({
  onStateChange = () => {},
  ...useRequestParams
}) {
  const [currentState, setState] = React.useState(idleState)
  const onStateChangeRef = useUpdatedRef(onStateChange)

  const request = useRequestFactory({
    ...useRequestParams,
    onStateChange: React.useCallback(
      newState => {
        setState(newState)
        onStateChangeRef.current(newState)
      },
      [onStateChangeRef],
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
      [currentState, onStateChangeRef],
    ),
    request,
  ]
}
