import React from 'react'
import useRequest from './useRequest'

export default function Request({render, children = render, ...requestParams}) {
  const [response, request] = useRequest({
    auto: false,
    ...requestParams,
  })

  return children(
    React.useMemo(() => ({...response, request}), [response, request]),
  )
}
