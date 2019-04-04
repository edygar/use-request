export default function requestStateReducer(state = {}, {type, payload}) {
  switch (type) {
    case 'init':
      return {
        ...state,
        pending: true,
        status: 'init',
        ...payload,
      }

    case 'progress':
      return {
        ...state,
        progress: payload,
      }

    case 'params_defined':
      return {
        ...state,
        status: 'prepared',
        params: payload,
      }

    case 'request_sent':
      return {
        ...state,
        requested: payload,
        status: 'requested',
      }

    case 'response_received':
      return {
        ...state,
        responded: payload,
        status: 'resolved',
      }

    case 'request_succeeded':
      return {
        ...state,
        status: 'resolved',
        pending: false,
        resolved: payload,
      }

    case 'request_aborted': {
      return {
        status: 'aborted',
        pending: false,
      }
    }

    case 'request_failed':
      return {
        ...state,
        status: 'rejected',
        pending: false,
        rejected: payload,
      }

    default:
      return {
        ...state,
        ...payload,
      }
  }
}
