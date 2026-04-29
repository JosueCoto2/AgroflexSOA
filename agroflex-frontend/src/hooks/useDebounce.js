import { useState, useEffect } from 'react'

/**
 * Retrasa la actualización de un valor hasta que el usuario deje de cambiar el input.
 * @param {*} value - Valor a debounce
 * @param {number} delay - Milisegundos de espera (default 300ms)
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
