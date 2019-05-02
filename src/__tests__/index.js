/* eslint-disable max-lines-per-function */
import {renderHook, cleanup} from 'react-hooks-testing-library'
import {useRequestInitiator} from '../useRequestInitiator'

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

describe('useRequestInitiator', () => {
  it('returns same function for different renders', () => {
    const {result, rerender} = renderHook(
      params => useRequestInitiator(params),
      {
        initialProps: {
          request: () => ({}),
        },
      },
    )

    const firstRenderResult = result.current
    rerender()
    const secondRenderResult = result.current
    expect(firstRenderResult).toBe(secondRenderResult)
  })

  describe('request initator callback', () => {
    it('calls request lifecycle callbacks in order', async () => {
      const anyArgs = [
        Infinity,
        'arguments',
        {
          and: 'shapes',
        },
      ]
      const requestDescription = {url: '/some-end-point?some=data'}
      const payload = {result: ['some', 'data']}
      const result = payload.result
      const pendingRequest = Promise.resolve(payload)

      const [requestEnd, request] = usePromise(() => requestDescription)
      const [performEnd, perform] = usePromise(() => pendingRequest)
      const [responseEnd, response] = usePromise(() => result)

      const {
        result: {current: initiate},
      } = renderHook(params => useRequestInitiator(params), {
        initialProps: {
          request,
          perform,
          response,
        },
      })

      const suspense = initiate(...anyArgs)

      await requestEnd
      expect(request).toHaveBeenCalledWith(...anyArgs)
      expect(perform).not.toHaveBeenCalled()
      expect(response).not.toHaveBeenCalled()

      await performEnd
      expect(perform).toHaveBeenCalledWith(
        {
          requestId: expect.anything(),
          status: 'prepared',
          suspense,
          pending: true,
          args: anyArgs,
          params: requestDescription,
        },
        {
          registerAborter: expect.any(Function),
          setProgress: expect.any(Function),
        },
      )
      expect(response).not.toHaveBeenCalled()

      await responseEnd
      expect(response).toHaveBeenCalledWith(
        {
          requestId: expect.anything(),
          status: 'responded',
          suspense,
          pending: true,
          args: anyArgs,
          params: requestDescription,
          requested: pendingRequest,
          responded: payload,
        },
        {
          setProgress: expect.any(Function),
        },
      )

      await expect(suspense).resolves.toEqual({
        requestId: expect.anything(),
        status: 'resolved',
        suspense,
        pending: false,
        args: anyArgs,
        params: requestDescription,
        requested: pendingRequest,
        responded: payload,
        resolved: result,
      })
    })

    it("calls 'perform' callback with current state and helpers", async () => {
      const [requestEnd, completeRequest] = usePromise()
      const perform = completeRequest

      const {
        result: {current: initiate},
      } = renderHook(params => useRequestInitiator(params), {
        initialProps: {perform},
      })

      const requestDescription = {url: '/some-url'}
      const suspense = initiate(requestDescription)

      await requestEnd

      expect(perform).toHaveBeenCalledWith(
        {
          requestId: expect.anything(),
          status: 'prepared',
          suspense,
          pending: true,
          args: [requestDescription],
          params: requestDescription,
        },
        {
          registerAborter: expect.any(Function),
          setProgress: expect.any(Function),
        },
      )
    })

    it("calls 'request' callback with its own arguments", async () => {
      const [requestEnd, completeRequest] = usePromise()
      const [performEnd, perform] = usePromise()

      const request = jest.fn(completeRequest)
      const {
        result: {current: initiate},
      } = renderHook(params => useRequestInitiator(params), {
        initialProps: {request, perform},
      })

      const args = [
        Infinity,
        'arguments',
        {
          and: 'shapes',
        },
      ]
      initiate(...args)

      await requestEnd
      await performEnd

      expect(request).toHaveBeenCalledWith(...args)
    })

    it("calls 'perform' with params", async () => {
      const [requestEnd, completeRequest] = usePromise()
      jest
        .spyOn(window, 'fetch')
        .mockImplementation(() => new Promise(() => {}))

      const request = jest.fn(completeRequest)
      const {
        result: {current: initiate},
      } = renderHook(params => useRequestInitiator(params), {
        initialProps: {request},
      })

      initiate(Infinity, 'arguments', {
        and: 'shapes',
      })

      await requestEnd

      expect(request).toHaveBeenCalledWith(Infinity, 'arguments', {
        and: 'shapes',
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
