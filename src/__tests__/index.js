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

test('useRequest exposes initial request state and request initiator callback', () => {
  const {
    result: {
      current: [state, initiate],
    },
  } = renderHook(params => useRequest(params), {
    initialProps: {},
  })

  expect(state).toEqual({
    status: 'idle',
    pending: false,
    release: expect.any(Function),
    abort: expect.any(Function),
  })
  expect(initiate).toBeInstanceOf(Function)
})

test('request initiator callback resolves to final request state', async () => {
  const [fetchResponse, respond] = usePromise()
  const request = {url: '/some-endpoint'}
  const resolved = {result: [1, 2, 3]}
  const responded = {ok: true, json: () => fetchResponse}
  const requested = Promise.resolve(responded)
  window.fetch = jest.fn(() => requested)

  const {result} = renderHook(params => useRequest(params), {
    initialProps: {},
  })

  const suspense = result.current[1](request)
  expect(suspense).toBeInstanceOf(Promise)

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
  it("doesn't fetch automatically when is a function", async () => {
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
