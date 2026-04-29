import { X, Mail, Phone, MapPin, Star, Package, ShoppingBag, BadgeCheck } from 'lucide-react'

export default function UsuarioModal({ usuario, onClose, onSuspender, onActivar }) {
  if (!usuario) return null
  const { nombre, apellidos, correo, telefono, roles = [], activo, validado,
          municipio, estadoRepublica, totalProductos, totalPedidos, puntuacionRep } = usuario

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center text-lg font-bold text-white">
            {`${nombre?.charAt(0) ?? ''}${apellidos?.charAt(0) ?? ''}`.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate">{nombre} {apellidos}</p>
            <div className="flex gap-1.5 mt-1">
              {roles.map(r => (
                <span key={r} className="px-1.5 py-0.5 text-xs bg-white/10 text-slate-300 rounded-md">{r}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info */}
          <div className="space-y-2">
            <InfoRow icon={Mail} label={correo} />
            {telefono && <InfoRow icon={Phone} label={telefono} />}
            {(municipio || estadoRepublica) && (
              <InfoRow icon={MapPin} label={[municipio, estadoRepublica].filter(Boolean).join(', ')} />
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatChip icon={Package} label="Productos" value={totalProductos ?? 0} />
            <StatChip icon={ShoppingBag} label="Pedidos" value={totalPedidos ?? 0} />
            <StatChip icon={Star} label="Calific." value={puntuacionRep ?? '—'} />
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-green-500' : 'bg-red-400'}`} />
              {activo ? 'Cuenta activa' : 'Cuenta suspendida'}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${validado ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
              <BadgeCheck className="w-3 h-3" />
              {validado ? 'Verificado' : 'Sin verificar'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            Cerrar
          </button>
          {activo ? (
            <button
              onClick={() => { onClose(); onSuspender(usuario) }}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all"
            >
              Suspender
            </button>
          ) : (
            <button
              onClick={() => { onClose(); onActivar(usuario) }}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all"
            >
              Activar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      <span>{label}</span>
    </div>
  )
}

function StatChip({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
      <p className="text-base font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
