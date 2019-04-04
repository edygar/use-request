import useRequest from './useRequest'
import * as cached from './cache'

export default useRequest

export const cache = cached
export * from './useRequestInitiator'
export {default as useRequestInitiator} from './useRequestInitiator'
export {default as useRequest} from './useRequest'
export {default as Request} from './Request'
