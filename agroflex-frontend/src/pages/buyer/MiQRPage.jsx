/**
 * MiQRPage — Muestra el código QR de la orden para que el productor lo escanee.
 * Ruta: /mi-qr/:orderId
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { qrService } from '../../services/qrService'
import useOrderStore from '../../store/orderStore'
import QRGenerator from '../../components/qr/QRGenerator/QRGenerator'

export default function MiQRPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { ordenActual, fetchDetalle } = useOrderStore()
  const [qrData, setQrData] = useState(null)
  const [loadingQr, setLoadingQr] = useState(true)
  const [errorQr, setErrorQr] = useState(null)

  useEffect(() => {
    if (orderId) fetchDetalle(orderId)
    cargarQr()
  }, [orderId])

  const cargarQr = async () => {
    setLoadingQr(true)
    setErrorQr(null)
    try {
      const data = await qrService.getQrDeOrden(orderId)
      setQrData(data)
    } catch {
      setErrorQr('No se encontró el QR de esta orden')
    } finally {
      setLoadingQr(false)
    }
  }

  const tokenQr = qrData?.tokenQr || qrData?.token || ordenActual?.idTransaccionPago
  const estado = qrData?.estadoQr || 'GENERADO'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <div className="bg-green-700 px-4 pt-4 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-white/15 text-white text-sm font-semibold rounded-xl px-3 py-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h1 className="text-xl font-bold text-white">Código QR de entrega</h1>
        <p className="text-green-200 text-sm mt-0.5">
          {ordenActual?.numeroOrden ?? `Orden #${orderId}`}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 py-8">
        <QRGenerator
          tokenQr={tokenQr}
          estado={estado}
          fechaExpiracion={qrData?.fechaExpiracion}
          numeroOrden={ordenActual?.numeroOrden ?? `Orden #${orderId}`}
          loading={loadingQr}
          error={errorQr}
          onRecargar={cargarQr}
        />
      </div>
    </div>
  )
}
