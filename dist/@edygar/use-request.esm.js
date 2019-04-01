import useDeepCompareEffect from 'use-deep-compare-effect';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import _asyncToGenerator from '@babel/runtime/helpers/esm/asyncToGenerator';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose';
import React from 'react';
import _inheritsLoose from '@babel/runtime/helpers/esm/inheritsLoose';
import _extends from '@babel/runtime/helpers/esm/extends';

function requestStateReducer(state, _ref) {
  var type = _ref.type,
      payload = _ref.payload;

  switch (type) {
    case 'init':
      return _extends({}, state, {
        pending: true,
        status: 'pending'
      }, payload);

    case 'params_defined':
      return _extends({}, state, {
        params: payload
      });

    case 'request_succeeded':
      return _extends({}, state, {
        status: 'resolved',
        pending: false
      }, payload);

    case 'request_aborted':
      return _extends({}, state, {
        status: 'aborted',
        pending: false
      }, payload);

    case 'request_failed':
      return _extends({}, state, {
        status: 'rejected',
        pending: false
      }, payload);

    default:
      return _extends({}, state, payload);
  }
}

/**
 * In order to keep the ref always correctly updated
 * whenever the component is rendered with the value
 * changed, we updated ref as early as possible.
 *
 * Note: Before the component is rendered, we can never
 * know whether the value change is effective or if the
 * render will be bailed out.
 *
 * @param {any} value the value to keep the ref
 * @return {Object} the updated ref
 */

function useUpdatedRef(value) {
  var ref = React.useRef(value);
  React.useLayoutEffect(function () {
    ref.current = value;
  }, [value]);
  return ref;
}

/**
 * Helper Class to produce local spec-compliant abortations
 */
var AbortError =
/*#__PURE__*/
function (_ref) {
  _inheritsLoose(AbortError, _ref);

  function AbortError() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _ref.call.apply(_ref, [this].concat(args)) || this;
    _this.name = 'AbortError';
    return _this;
  }

  return AbortError;
}('DOMError' in global ? DOMError : Error);

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

function defaultPerformRequest(requestState, registerAborter) {
  if (!requestState.params) {
    throw new Error('useRequest: Invalid request parameters.');
  }

  var _requestState$params$ = requestState.params.params,
      url = _requestState$params$.url,
      fetchOptions = _objectWithoutPropertiesLoose(_requestState$params$, ["url"]);

  var controller = new AbortController();
  registerAborter(function () {
    controller.abort();
  });
  return fetch(url, _extends({}, fetchOptions, {
    signal: controller.signal
  }));
}
/**
 * Expects the fetch options, including the URL
 *
 * @param {Object} fetchOptions Options passed to the `fetch` function
 * @return {Object} fetchOptions noop
 */

function defaultMapRequest(fetchOptions) {
  return fetchOptions;
}
/**
 * Expects a fetch response and assumes JSON
 *
 * @param {Object} requestState the current state of the request
 */

function defaultMapResponse() {
  return _defaultMapResponse.apply(this, arguments);
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

function _defaultMapResponse() {
  _defaultMapResponse = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(requestState) {
    var parsed;
    return _regeneratorRuntime.wrap(function (_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return requestState.responded.json();

          case 2:
            parsed = _context2.sent;

            if (requestState.responded.ok) {
              _context2.next = 5;
              break;
            }

            throw parsed;

          case 5:
            return _context2.abrupt("return", parsed);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _defaultMapResponse.apply(this, arguments);
}

function useRequestFactory(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$throwOnAbortions = _ref.throwOnAbortions,
      throwOnAbortions = _ref$throwOnAbortions === void 0 ? false : _ref$throwOnAbortions,
      _ref$throwOnRejection = _ref.throwOnRejections,
      throwOnRejections = _ref$throwOnRejection === void 0 ? false : _ref$throwOnRejection,
      _ref$onStateChange = _ref.onStateChange,
      onStateChange = _ref$onStateChange === void 0 ? function () {} : _ref$onStateChange,
      _ref$request = _ref.request,
      mapRequest = _ref$request === void 0 ? function (payload) {
    return payload;
  } : _ref$request,
      _ref$response = _ref.response,
      mapResponse = _ref$response === void 0 ? defaultMapResponse : _ref$response,
      _ref$perform = _ref.perform,
      performRequest = _ref$perform === void 0 ? defaultPerformRequest : _ref$perform,
      _ref$stateReducer = _ref.stateReducer,
      stateReducer = _ref$stateReducer === void 0 ? requestStateReducer : _ref$stateReducer;

  /* As all of the params will be called during the async
   * function, they should be a ref so at each new render
   * with new values, they are updated and a on going async
   * function uses the latest values.
   */
  var stateReducerRef = useUpdatedRef(stateReducer);
  var mapRequestRef = useUpdatedRef(mapRequest);
  var mapResponseRef = useUpdatedRef(mapResponse);
  var performRequestRef = useUpdatedRef(performRequest);
  var throwOnAbortionsRef = useUpdatedRef(throwOnAbortions);
  var throwOnRejectionsRef = useUpdatedRef(throwOnRejections);
  var onStateChangeRef = useUpdatedRef(onStateChange);
  return React.useCallback(
  /*#__PURE__*/
  function () {
    var _request = _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee() {
      var aborted,
          interruped,
          unsubscribed,
          state,
          _len,
          args,
          _key,
          requestArgs,
          params,
          _abort,
          requested,
          responded,
          resolved,
          propagateChange,
          _args = arguments;

      return _regeneratorRuntime.wrap(function (_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              propagateChange = function (action) {
                // Checks for abortions from the last life cycle update
                if (aborted && !interruped) throw new AbortError('The operation was aborted.');
                state = stateReducerRef.current(state, action);
                if (!unsubscribed) onStateChangeRef.current(state); // Checks for abortions from the last onStateChange call

                if (aborted && !interruped) throw new AbortError('The operation was aborted.');
              };

              aborted = false;
              interruped = false;
              unsubscribed = false;

              for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = _args[_key];
              }

              requestArgs = args;
              _context.prev = 6;
              propagateChange({
                type: 'init',
                payload: {
                  unsubscribe: function unsubscribe() {
                    unsubscribed = true;
                  },
                  abort: function abort() {
                    aborted = true;
                  },
                  args: requestArgs
                }
              });
              _context.next = 10;
              return typeof mapRequestRef.current === 'function' ? mapRequestRef.current.apply(mapRequestRef, args) : mapRequestRef.current;

            case 10:
              params = _context.sent;
              propagateChange({
                type: 'params_defined',
                payload: params
              });
              requested = performRequestRef.current(state, function (aborter) {
                _abort = aborter;
              });
              propagateChange({
                type: 'request_sent',
                payload: {
                  requested: requested,
                  abort: function abort() {
                    _abort();

                    aborted = true;
                  }
                }
              });
              _context.next = 16;
              return requested;

            case 16:
              responded = _context.sent;
              propagateChange({
                type: 'response_received',
                payload: {
                  requested: requested,
                  responded: responded,
                  abort: function abort() {
                    aborted = true;
                  }
                }
              });
              _context.next = 20;
              return mapResponseRef.current(state);

            case 20:
              resolved = _context.sent;
              propagateChange({
                type: 'request_succeeded',
                payload: {
                  resolved: resolved,
                  abort: function abort() {}
                }
              });
              return _context.abrupt("return", state);

            case 25:
              _context.prev = 25;
              _context.t0 = _context["catch"](6);
              interruped = true;

              if (!(_context.t0 instanceof Error && _context.t0.name === 'AbortError')) {
                _context.next = 33;
                break;
              }

              propagateChange({
                type: 'request_aborted',
                payload: {
                  rejected: _context.t0,
                  abort: function abort() {}
                }
              });

              if (!throwOnAbortionsRef.current) {
                _context.next = 32;
                break;
              }

              throw state;

            case 32:
              return _context.abrupt("return", state);

            case 33:
              propagateChange({
                type: 'request_failed',
                payload: {
                  rejected: _context.t0,
                  abort: function abort() {}
                }
              });

              if (!throwOnRejectionsRef.current) {
                _context.next = 36;
                break;
              }

              throw state;

            case 36:
              return _context.abrupt("return", state);

            case 37:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[6, 25]]);
    }));

    return function () {
      return _request.apply(this, arguments);
    };
  }(), // All its dependencies are updated through refs
  [mapRequestRef, mapResponseRef, onStateChangeRef, performRequestRef, stateReducerRef, throwOnAbortionsRef, throwOnRejectionsRef]); // eslint-disable-line
}

var idleState = {
  pending: false,
  status: 'idle',
  unsubscribe: function unsubscribe() {},
  abort: function abort() {}
};
function useRequestReporter(_ref) {
  var _ref$onStateChange = _ref.onStateChange,
      onStateChange = _ref$onStateChange === void 0 ? function () {} : _ref$onStateChange,
      useRequestParams = _objectWithoutPropertiesLoose(_ref, ["onStateChange"]);

  var _React$useState = React.useState(idleState),
      currentState = _React$useState[0],
      setState = _React$useState[1];

  var onStateChangeRef = useUpdatedRef(onStateChange);
  var request = useRequestFactory(_extends({}, useRequestParams, {
    onStateChange: React.useCallback(function (newState) {
      setState(newState);
      onStateChangeRef.current(newState);
    }, [onStateChangeRef])
  }));
  return [React.useMemo(function () {
    return _extends({}, currentState, {
      reset: function reset() {
        setState(idleState);
        onStateChangeRef.current(idleState);
      }
    });
  }, [currentState, onStateChangeRef]), request];
}

var bucket = new Map();
/**
 * Converts GET Request Params into cache id, otherwise, null
 *
 * @param {Request} params Definition for the request, including the url and fetch options
 *
 * @return {String} the cache id
 */

function defaultGetCachedIdByParams(params) {
  if (params.method && params.method.toLowerCase() !== 'get') {
    return null;
  }

  return JSON.stringify(params);
}
/**
 * Converts arguments given to request initiator into cache id
 *
 * @return {String} the cache id
 */

function defaultGetCachedId() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return JSON.stringify(args);
}
/**
 * Produces a stateReducerFn that caches requests by their params
 *
 * @param {Function} getCacheId retrieves an unique id from params to retrieve later
 * @param {Object} params.bucket The bucket to where the cache is going to be saved
 * @returns {Function} the resulting stateReducerFn
 */

function byParams(getCacheId, _temp) {
  if (getCacheId === void 0) {
    getCacheId = defaultGetCachedIdByParams;
  }

  var _ref = _temp === void 0 ? {} : _temp,
      _ref$bucket = _ref.bucket,
      localBucket = _ref$bucket === void 0 ? bucket : _ref$bucket;

  return function (state, action) {
    var newState = requestStateReducer(state, action);

    if (action.type === 'params_defined') {
      var cacheId = getCacheId(action.payload);

      if (cacheId !== null && localBucket.has(cacheId)) {
        var fromCache = localBucket.get(cacheId);
        return _extends({}, fromCache, newState);
      }
    }

    if (action.type === 'request_succeeded') {
      var _cacheId = getCacheId(newState.params);

      localBucket.set(_cacheId, newState);
    }

    return newState;
  };
}
/**
 * Produces a stateReducerFn that caches requests by their args
 *
 * @param {Function} getCacheId retrieves an unique id from arguments to retrieve later
 * @param {Object} params.bucket The bucket to where the cache is going to be saved
 * @returns {Function} the resulting stateReducerFn
 */

function byArgs(getCacheId, _temp2) {
  if (getCacheId === void 0) {
    getCacheId = defaultGetCachedId;
  }

  var _ref2 = _temp2 === void 0 ? {} : _temp2,
      _ref2$bucket = _ref2.bucket,
      localBucket = _ref2$bucket === void 0 ? bucket : _ref2$bucket;

  return function (state, action) {
    var newState = requestStateReducer(state, action);

    if (action.type === 'init') {
      var cacheId = getCacheId.apply(void 0, action.payload.args);

      if (cacheId !== null && localBucket.has(cacheId)) {
        // defines already from cache
        return _extends({}, localBucket.get(cacheId), newState);
      }
    }

    if (action.type === 'request_succeeded') {
      localBucket.set(getCacheId.apply(void 0, newState.args), newState);
    }

    return newState;
  };
}

var none = function (state) {
  return state;
};

function useRequest(_ref) {
  var _ref$auto = _ref.auto,
      auto = _ref$auto === void 0 ? true : _ref$auto,
      _ref$abortOnUnmount = _ref.abortOnUnmount,
      abortOnUnmount = _ref$abortOnUnmount === void 0 ? true : _ref$abortOnUnmount,
      _ref$cache = _ref.cache,
      shouldCache = _ref$cache === void 0 ? false : _ref$cache,
      _ref$getCacheId = _ref.getCacheId,
      getCacheId = _ref$getCacheId === void 0 ? defaultGetCachedId : _ref$getCacheId,
      _ref$cacheBucket = _ref.cacheBucket,
      cacheBucket = _ref$cacheBucket === void 0 ? 'local' : _ref$cacheBucket,
      _ref$cacheBy = _ref.cacheBy,
      cacheBy = _ref$cacheBy === void 0 ? undefined : _ref$cacheBy,
      _ref$stateReducer = _ref.stateReducer,
      _stateReducer = _ref$stateReducer === void 0 ? requestStateReducer : _ref$stateReducer,
      params = _objectWithoutPropertiesLoose(_ref, ["auto", "abortOnUnmount", "cache", "getCacheId", "cacheBucket", "cacheBy", "stateReducer"]);

  var abortOnUnmountRef = useUpdatedRef(abortOnUnmount);

  var _React$useState = React.useState(function () {
    return new Map();
  }, []),
      localBucket = _React$useState[0];

  var bucket$$1 = cacheBucket === 'local' ? localBucket : cacheBucket === 'global' ? undefined : cacheBucket;
  var finalCacheBy = shouldCache === false && !cacheBy ? none : cacheBy === 'params' || shouldCache === true || typeof cacheBy === 'function' ? byParams(typeof cacheBy === 'function' ? cacheBy : getCacheId, {
    bucket: bucket$$1
  }) : byArgs(getCacheId, {
    bucket: bucket$$1
  });

  var _useRequestReporter = useRequestReporter(_extends({}, params, {
    stateReducer: function stateReducer(newState, action) {
      return _stateReducer(finalCacheBy(newState, action), action);
    }
  })),
      state = _useRequestReporter[0],
      performRequest = _useRequestReporter[1];

  var stateRef = useUpdatedRef(state);
  var mapRequest = params.request;
  var requestRef = useUpdatedRef(React.useCallback(function () {
    stateRef.current.unsubscribe();
    performRequest.apply(void 0, arguments);
  }, [performRequest, stateRef]));
  var requestPayload = React.useMemo(function () {
    return {
      payload: auto && typeof mapRequest === 'function' ? mapRequest() : mapRequest
    };
  }, [auto, mapRequest]);
  useDeepCompareEffect(function () {
    if (auto) {
      if (requestPayload.payload) {
        stateRef.current.abort();
        requestRef.current(requestPayload.payload);
      }
    }
  }, [requestPayload, auto]);
  React.useEffect(function () {
    if (!auto) {
      stateRef.current.abort();
    }
  }, [auto, stateRef]);
  React.useEffect(function () {
    return function () {
      if (abortOnUnmountRef.current) {
        stateRef.current.abort();
      }
    };
  }, [abortOnUnmountRef, stateRef]);
  return [state, requestRef.current];
}

export default useRequest;
export { useRequestFactory, useRequestReporter, useUpdatedRef, bucket, defaultGetCachedIdByParams, defaultGetCachedId, byParams, byArgs, defaultPerformRequest, defaultMapRequest, defaultMapResponse };
