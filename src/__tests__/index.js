/* eslint-disable no-console */
import {renderHook, cleanup} from 'react-hooks-testing-library'
import useRequest from '../index'

const originalError = console.error
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return
  }
  originalError.call(console, ...args)
}

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

test('useRequest exposes the initial request state and the request initiator callback', () => {
  const {
    result: {
      current: [state, initiate],
    },
  } = renderHook(params => useRequest(params), {
    initialProps: {},
  })

  expect(state).toEqual({
    // the initial (not sent) request state is `idle`
    status: 'idle',
    pending: false,

    // the helpers are there, even though to this point they are noop
    release: expect.any(Function),
    abort: expect.any(Function),
  })
  expect(initiate).toBeInstanceOf(Function)
})

test('request initiator callback resolves to final request state', async () => {
  // A controlled promise, so that we can resolve it when approriate
  const [fetchResponse, respond] = usePromise()
  // The description of the request
  const request = {url: '/some-endpoint'}
  // The content of the response
  const resolved = {result: [1, 2, 3]}
  // The representation of fetch API could respond, but returing the controlled promise
  // so that we can control when to resolve the promise
  const responded = {ok: true, json: () => fetchResponse}
  // The representation of what was requested
  const requested = Promise.resolve(responded)

  // Faking the fetch so that we can respond with our response
  window.fetch = jest.fn(() => requested)

  const {result} = renderHook(params => useRequest(params), {
    initialProps: {},
  })

  // it won't do anything until initiator is called, since no request param was provided
  expect(window.fetch).toHaveBeenCalledTimes(0)

  // `suspense` stands for the the whole flow, including any mapping through the middle
  const suspense = result.current[1](request)
  expect(suspense).toBeInstanceOf(Promise)

  // we resolve our controlled promise with the expected resolution
  respond(resolved)

  expect(await suspense).toEqual({
    requestId: expect.anything(),
    suspense,
    requested,
    responded,
    resolved,
    args: [request],
    params: request,
    pending: false,
    status: 'resolved',
  })

  expect(window.fetch).toHaveBeenCalledTimes(1)
})

test('request state is updated when request initiator is called with its arguments', async () => {
  window.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => ({})}))

  const {result, waitForNextUpdate} = renderHook(params => useRequest(params), {
    initialProps: {},
  })

  result.current[1](Infinity, 'shape', ['of'], {args: 'args'})

  await waitForNextUpdate()

  expect(result.current[0]).toEqual(
    expect.objectContaining({
      status: 'init',
      pending: true,
      args: [Infinity, 'shape', ['of'], {args: 'args'}],
    }),
  )
})

describe('request param as an object', () => {
  it('fetches automatically when is an object', async () => {
    const [fetchResponse, respond] = usePromise()
    window.fetch = jest.fn(() =>
      Promise.resolve({ok: true, json: () => fetchResponse}),
    )

    const {result, waitForNextUpdate} = renderHook(
      params => useRequest(params),
      {
        initialProps: {request: {url: '/some-endpoint'}},
      },
    )

    await waitForNextUpdate()
    expect(result.current[0]).toEqual({
      release: expect.any(Function),
      abort: expect.any(Function),
      repeat: expect.any(Function),
      setProgress: expect.any(Function),
      suspense: expect.any(Promise),
      args: [{url: '/some-endpoint'}],
      pending: true,
      status: 'init',
      requestId: expect.anything(),
    })

    respond({result: [1, 2, 3]})
    await result.current[0].suspense

    expect(result.current[0].resolved).toEqual({result: [1, 2, 3]})
  })

  it('aborts ongoing fetch when is set to an falsy value', async () => {
    const [fetchResponse, respond] = usePromise()
    window.fetch = jest.fn(() =>
      Promise.resolve({ok: true, json: () => fetchResponse}),
    )

    const {result, rerender, waitForNextUpdate} = renderHook(
      params => useRequest(params),
      {
        initialProps: {request: {url: '/some-endpoint'}},
      },
    )

    await waitForNextUpdate()
    expect(result.current[0]).toEqual({
      release: expect.any(Function),
      abort: expect.any(Function),
      repeat: expect.any(Function),
      setProgress: expect.any(Function),
      suspense: expect.any(Promise),
      args: [{url: '/some-endpoint'}],
      pending: true,
      status: 'init',
      requestId: expect.anything(),
    })

    respond({result: [1, 2, 3]})

    await waitForNextUpdate()
    rerender({request: false})

    await result.current[0].suspense
    expect(result.current[0]).toEqual({
      release: expect.any(Function),
      abort: expect.any(Function),
      pending: false,
      status: 'idle',
    })
  })
})

describe('request param as a function', () => {
  it("doesn't fetch automatically", async () => {
    const [timeout, expire] = usePromise()
    window.fetch = jest.fn()

    const {result} = renderHook(params => useRequest(params), {
      initialProps: {request: () => ({url: '/some-endpoint'})},
    })

    setTimeout(expire, 200)
    await timeout

    expect(result.current[0]).toEqual({
      status: 'idle',
      pending: false,
      release: expect.any(Function),
      abort: expect.any(Function),
    })
    expect(window.fetch).not.toHaveBeenCalled()
  })

  it('awaits for any returned promise', async () => {
    const [pendingRequestMapping, finishRequestMapping] = usePromise()
    window.fetch = jest.fn()

    const {result, waitForNextUpdate} = renderHook(
      params => useRequest(params),
      {
        initialProps: {
          request: () =>
            pendingRequestMapping.then(() => ({url: '/some-endpoint'})),
        },
      },
    )

    result.current[1]()

    // goes to init stat
    await waitForNextUpdate()

    finishRequestMapping()

    // goes to prepared
    await waitForNextUpdate()

    expect(result.current[0].params).toEqual({url: '/some-endpoint'})
  })

  it("returns the 'params' request state", async () => {
    window.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => ({})}))

    const request = jest.fn(() => ({url: '/some-endpoint'}))
    const {result, waitForNextUpdate} = renderHook(
      params => useRequest(params),
      {
        initialProps: {request},
      },
    )

    result.current[1]()
    await waitForNextUpdate()
    await waitForNextUpdate()

    expect(result.current[0]).toEqual(
      expect.objectContaining({
        status: 'prepared',
        pending: true,
        params: {url: '/some-endpoint'},
      }),
    )
  })
})

test("'perform' param is called on request and is used by 'response' to resolve", async () => {
  // the final resolution can be of any shape
  const resolved = []

  // but as we're are going to use the default 'response' callback, our perform
  // should respond with a fetch-compatible API.
  const responded = {
    ok: true,
    json: () => resolved,
  }

  // The function we're providing
  const perform = jest.fn(() => responded)

  // `fetch` shouldn't be called as we are providing our own `perform` fn
  window.fetch = jest.fn()

  const {result} = renderHook(params => useRequest(params), {
    initialProps: {
      perform,
    },
  })

  // As we are providing the 'perform' fn, we can deal with a request description
  // of our own shape.
  const customRequestDescription = []
  const suspense = result.current[1](customRequestDescription)

  await suspense
  expect(await suspense).toEqual(
    expect.objectContaining({
      requestId: expect.anything(),
      suspense,
      responded,
      resolved,
      args: [customRequestDescription],
      params: customRequestDescription,
      pending: false,
      status: 'resolved',
    }),
  )

  expect(perform).toHaveBeenCalledWith(
    expect.objectContaining({
      args: [customRequestDescription],
      params: customRequestDescription,
    }),
    expect.objectContaining({
      registerAborter: expect.any(Function),
      setProgress: expect.any(Function),
    }),
  )
})

test("custom request aborters can be registered through 'perform' callback", async () => {
  const aborter = jest.fn()
  const [pendingRequest, respond] = usePromise()
  const perform = jest.fn((_, {registerAborter}) => {
    registerAborter(aborter)

    return pendingRequest
  })

  const {result, waitForNextUpdate} = renderHook(params => useRequest(params), {
    initialProps: {
      perform,
    },
  })

  const suspense = result.current[1]()

  await waitForNextUpdate() // status === 'init'
  await waitForNextUpdate() // status === 'prepared'
  await waitForNextUpdate() // status === 'requested'

  expect(result.current[0].status).toBe('requested')
  result.current[0].abort()

  expect(aborter).toHaveBeenCalledTimes(1)

  await suspense
  expect(await suspense).toEqual(
    expect.objectContaining({
      requestId: expect.anything(),
      suspense,
      pending: false,
      status: 'aborted',
    }),
  )

  expect(result.current[0]).toEqual(
    expect.objectContaining({status: 'idle', pending: false}),
  )

  respond('noop')
  await pendingRequest

  expect(result.current[0]).toEqual(
    expect.objectContaining({status: 'idle', pending: false}),
  )
})

function identity(arg) {
  return arg
}

function usePromise(mapResolution = identity, mapRejection = identity) {
  let resolve, reject

  return [
    new Promise((res, rej) => {
      resolve = res
      reject = rej
    }),
    jest.fn((...args) => {
      const result = mapResolution(...args)
      resolve(result)
      return result
    }),
    jest.fn((...args) => {
      const result = mapRejection(...args)
      reject(result)
      return result
    }),
  ]
}
