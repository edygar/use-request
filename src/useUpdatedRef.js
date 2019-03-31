import React from 'react'

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
export default function useUpdatedRef(value) {
  const ref = React.useRef(value)

  React.useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
