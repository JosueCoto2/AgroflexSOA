/**
 * useGeolocalizacion — Hook para capturar coordenadas GPS del dispositivo.
 * Solicita permiso si es necesario y devuelve { lat, lng, error, loading }.
 */
import { useState, useCallback } from 'react'

export function useGeolocalizacion() {
  const [lat,     setLat]     = useState(null)
  const [lng,     setLng]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const obtener = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocalización no disponible en este dispositivo'
        setError(err)
        reject(err)
        return
      }
      setLoading(true)
      setError(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude)
          setLng(pos.coords.longitude)
          setLoading(false)
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => {
          const msg = err.code === 1
            ? 'Permiso de ubicación denegado'
            : 'No se pudo obtener la ubicación'
          setError(msg)
          setLoading(false)
          // Resolver con null — la validación puede proceder sin GPS
          resolve({ lat: null, lng: null })
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      )
    })
  }, [])

  return { lat, lng, loading, error, obtener }
}
