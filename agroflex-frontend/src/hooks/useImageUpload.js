/**
 * useImageUpload.js — Hook para gestionar subida de imágenes a Firebase Storage
 *
 * Encapsula todos los estados de una subida:
 *   idle → preview → uploading → success | error
 *
 * Uso:
 *   const { estado, progreso, url, error, preview,
 *           seleccionar, subir, limpiar } = useImageUpload(STORAGE_FOLDERS.PRODUCTOS)
 */

import { useState, useCallback } from 'react'
import { subirArchivo, validarArchivo } from '../services/storageService'

export const useImageUpload = (carpeta) => {
  const [estado,   setEstado]   = useState('idle')
  // 'idle' | 'preview' | 'uploading' | 'success' | 'error'
  const [progreso, setProgreso] = useState(0)
  const [url,      setUrl]      = useState(null)
  const [error,    setError]    = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [archivo,  setArchivo]  = useState(null)

  /** Valida y genera preview local sin subir aún */
  const seleccionar = useCallback((file) => {
    if (!file) return
    const { valido, errores } = validarArchivo(file, carpeta)
    if (!valido) {
      setError(errores[0])
      setEstado('error')
      return
    }
    setArchivo(file)
    setError(null)
    // Preview local inmediato
    const reader = new FileReader()
    reader.onload  = (e) => setPreview(e.target.result)
    reader.onerror = ()  => setPreview(null)
    reader.readAsDataURL(file)
    setEstado('preview')
  }, [carpeta])

  /** Sube el archivo a Firebase y devuelve la URL pública */
  const subir = useCallback(async (userId, archivoOverride) => {
    const fileToUpload = archivoOverride || archivo
    if (!fileToUpload) {
      setError('No hay archivo seleccionado')
      setEstado('error')
      return null
    }
    setEstado('uploading')
    setProgreso(0)
    try {
      const resultado = await subirArchivo({
        archivo:    fileToUpload,
        carpeta,
        userId:     String(userId),
        onProgreso: setProgreso,
      })
      setUrl(resultado.url)
      setEstado('success')
      return resultado.url
    } catch (err) {
      setError(err.message)
      setEstado('error')
      return null
    }
  }, [carpeta, archivo])

  /** Resetea todos los estados */
  const limpiar = useCallback(() => {
    setEstado('idle')
    setProgreso(0)
    setUrl(null)
    setError(null)
    setPreview(null)
    setArchivo(null)
  }, [])

  return { estado, progreso, url, error, preview, archivo, seleccionar, subir, limpiar }
}
