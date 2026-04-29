/**
 * useQRScanner — Hook que gestiona el ciclo completo del escáner QR.
 *
 * Estados: 'idle' | 'requesting' | 'denied' | 'scanning' | 'validating' | 'success' | 'error'
 * Delega la validación de la entrega en qrService (SOA layer 1).
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { qrService }  from '../services/qrService'

const QR_ELEMENT_ID = 'agroflex-qr-reader'

export function useQRScanner() {
  const [estado,     setEstado]    = useState('idle')
  const [resultado,  setResultado] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const scannerRef = useRef(null)

  // ── Detener escáner activo
  const detener = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ya detenido */ }
      try { scannerRef.current.clear() }      catch { /* ignorar */     }
      scannerRef.current = null
    }
  }, [])

  // ── Limpiar al desmontar
  useEffect(() => () => { detener() }, [detener])

  // ── Solicitar permiso de cámara
  const solicitarPermiso = useCallback(async () => {
    setEstado('requesting')
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setEstado('scanning')
    } catch {
      setEstado('denied')
    }
  }, [])

  // ── Iniciar escáner
  const iniciarEscaner = useCallback(async (lat, lng) => {
    if (scannerRef.current) await detener()

    const html5Qrcode = new Html5Qrcode(QR_ELEMENT_ID)
    scannerRef.current = html5Qrcode

    await html5Qrcode.start(
      { facingMode },
      { fps: 10, qrbox: { width: 240, height: 240 }, formatsToSupport: [0] },
      async (decodedText) => {
        await detener()
        setEstado('validating')
        try {
          const data = await qrService.validarEntrega({ token: decodedText, lat, lng })
          setResultado({ ok: true, data })
          setEstado('success')
        } catch (err) {
          const errorTipo = err?.response?.data?.code ?? 'UNKNOWN'
          setResultado({ ok: false, errorTipo, data: err?.response?.data })
          setEstado('error')
        }
      },
      () => {}
    )
  }, [facingMode, detener])

  // ── Validación manual
  const validarManual = useCallback(async (token, lat, lng) => {
    setEstado('validating')
    setResultado(null)
    try {
      const data = await qrService.validarEntrega({ token, lat, lng })
      setResultado({ ok: true, data })
      setEstado('success')
    } catch (err) {
      const errorTipo = err?.response?.data?.code ?? 'UNKNOWN'
      setResultado({ ok: false, errorTipo, data: err?.response?.data })
      setEstado('error')
    }
  }, [])

  const reiniciar = useCallback(() => {
    detener()
    setResultado(null)
    setEstado('scanning')
  }, [detener])

  const cambiarCamara = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }, [])

  return {
    estado,
    resultado,
    facingMode,
    qrElementId: QR_ELEMENT_ID,
    solicitarPermiso,
    iniciarEscaner,
    validarManual,
    reiniciar,
    cambiarCamara,
    detener,
  }
}
