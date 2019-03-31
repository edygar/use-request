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
  onChange = () => {},
  ...useRequestParams
}) {
  const [currentState, setState] = React.useState(idleState)
  const onChangeRef = useUpdatedRef(onChange)

  const request = useRequestFactory({
    ...useRequestParams,
    onChange: React.useCallback(
      newState => {
        setState(newState)
        onChangeRef.current(newState)
      },
      [onChangeRef],
    ),
  })

  return [
    React.useMemo(
      () => ({
        ...currentState,
        reset() {
          setState(idleState)
          onChangeRef.current(idleState)
        },
      }),
      [currentState, onChangeRef],
    ),
    request,
  ]
}
