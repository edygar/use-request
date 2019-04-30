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

  it("allows consumer to 'perform' the 'request'", async () => {
    const [requestCall, doRequest] = usePromise()
    jest.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}))

    const perform = jest.fn(doRequest)
    const {
      result: {current: initiate},
    } = renderHook(params => useRequestInitiator(params), {
      initialProps: {perform},
    })

    const requestDescription = {url: '/some-url'}
    const suspense = initiate(requestDescription)
    await requestCall

    expect(perform).toHaveBeenCalledWith(
      {
        requestId: expect.anything(),
        status: 'prepared',
        suspense,
        pending: true,
        args: [requestDescription],
        params: requestDescription,
      },
      expect.objectContaining({}),
    )
  })

  it("calls 'request' with arguments", async () => {
    const [requestCall, doRequest] = usePromise()
    jest.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}))

    const request = jest.fn(doRequest)
    const {
      result: {current: initiate},
    } = renderHook(params => useRequestInitiator(params), {
      initialProps: {request},
    })

    initiate(Infinity, 'arguments', {
      and: 'shapes',
    })

    await requestCall

    expect(request).toHaveBeenCalledWith(Infinity, 'arguments', {
      and: 'shapes',
    })
  })

  it("calls 'perform' with params", async () => {
    const [requestCall, doRequest] = usePromise()
    jest.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}))

    const request = jest.fn(doRequest)
    const {
      result: {current: initiate},
    } = renderHook(params => useRequestInitiator(params), {
      initialProps: {request},
    })

    initiate(Infinity, 'arguments', {
      and: 'shapes',
    })

    await requestCall

    expect(request).toHaveBeenCalledWith(Infinity, 'arguments', {
      and: 'shapes',
    })
  })

  // jest.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));
})

function usePromise() {
  let resolve, reject

  return [
    new Promise((res, rej) => {
      resolve = res
      reject = rej
    }),
    result => resolve(result),
    err => reject(err),
  ]
}
