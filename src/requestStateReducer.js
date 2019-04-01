export default function requestStateReducer(state = {}, {type, payload}) {
  switch (type) {
    case 'init':
      return {
        ...state,
        pending: true,
        status: 'pending',
        ...payload,
      }

    case 'params_defined':
      return {
        ...state,
        params: payload,
      }

    case 'request_succeeded':
      return {
        ...state,
        status: 'resolved',
        pending: false,
        ...payload,
      }

    case 'request_aborted':
      return {
        ...state,
        status: 'aborted',
        pending: false,
        ...payload,
      }

    case 'request_failed':
      return {
        ...state,
        status: 'rejected',
        pending: false,
        ...payload,
      }

    default:
      return {
        ...state,
        ...payload,
      }
  }
}
