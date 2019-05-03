import 'unfetch/polyfill'
import {renderHook, cleanup} from 'react-hooks-testing-library'
import useRequest from '../index'

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

describe('useRequest', () => {
  it('exposes initial request state and request initiator callback', () => {
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

  describe('request param', () => {
    it('fetches automatically when is an object', async () => {
      const [fetchResponse, respond] = usePromise()
      jest
        .spyOn(window, 'fetch')
        .mockImplementation(() =>
          Promise.resolve({ok: true, json: () => fetchResponse}),
        )

      const {result, waitForNextUpdate} = renderHook(
        params => useRequest(params),
        {
          initialProps: {request: {url: '/some-endpoint'}},
        },
      )

      respond({result: [1, 2, 3]})
      await waitForNextUpdate()
      await result.current[0].suspense
      expect(result.current[0].resolved).toEqual({result: [1, 2, 3]})
    })

    it('aborts ongoing fetch when is set to an falsy value', async () => {
      const [fetchResponse, respond] = usePromise()
      jest
        .spyOn(window, 'fetch')
        .mockImplementation(() =>
          Promise.resolve({ok: true, json: () => fetchResponse}),
        )

      const {result, rerender, waitForNextUpdate} = renderHook(
        params => useRequest(params),
        {
          initialProps: {request: {url: '/some-endpoint'}},
        },
      )

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
