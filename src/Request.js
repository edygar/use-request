import {useRequest} from './useRequest'

export function Request({render, children = render, ...requestParams}) {
  const [response, request] = useRequest(requestParams)

  return children(response, request)
}
