import { useEffect, useRef, useState } from 'react'

function usePWAInstall() {
  const deferredPromptRef = useRef(null)
  const [puedeInstalar, setPuedeInstalar] = useState(false)
  const [yaInstalada, setYaInstalada] = useState(false)
  const [sO, setOS] = useState(null)

  useEffect(() => {
    // Detectar sistema operativo
    const userAgent = navigator.userAgent
    if (/android/i.test(userAgent)) {
      setOS('android')
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      setOS('ios')
    } else {
      setOS('desktop')
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setPuedeInstalar(true)
    }

    // Escuchar si ya está instalada
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setYaInstalada(true)
      setPuedeInstalar(false)
    })

    // Verificar si está en modo standalone (ya instalada)
    if (window.navigator.standalone === true) {
      setYaInstalada(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const instalar = async () => {
    if (!deferredPromptRef.current) {
      return
    }

    try {
      deferredPromptRef.current.prompt()
      const { outcome } = await deferredPromptRef.current.userChoice
      if (outcome === 'accepted') {
        setPuedeInstalar(false)
        setYaInstalada(true)
      }
    } catch (error) {
      console.error('Error al instalar PWA:', error)
    }
  }

  const getInstruccionesManual = () => {
    if (sO === 'ios') {
      return 'Toca el botón < Compartir y luego "Añadir a pantalla de inicio"'
    }
    if (sO === 'android') {
      return 'Toca los 3 puntos (⋮) del navegador y luego "Instalar app"'
    }
    return 'Consulta las opciones de tu navegador para instalar la app'
  }

  return {
    puedeInstalar,
    yaInstalada,
    instalar,
    sO,
    instruccionesManual: getInstruccionesManual()
  }
}

export { usePWAInstall }
export default usePWAInstall
