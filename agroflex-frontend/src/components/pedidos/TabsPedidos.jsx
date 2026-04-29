/**
 * TabsPedidos — Selector de tab "Como Comprador" / "Como Vendedor".
 * Solo muestra los tabs que aplican al rol del usuario.
 */
import { ShoppingBag, Store } from 'lucide-react'
import { authService } from '../../services/authService'

const SELLER_ROLES = ['PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'ADMIN']
const BUYER_ROLES  = ['COMPRADOR', 'EMPAQUE', 'PRODUCTOR', 'INVERNADERO', 'ADMIN']

const tabs = [
  { id: 'comprador', label: 'Como Comprador', icon: ShoppingBag, roles: BUYER_ROLES },
  { id: 'vendedor',  label: 'Como Vendedor',  icon: Store,       roles: SELLER_ROLES },
]

export default function TabsPedidos({ activo, onChange }) {
  const roles = authService.getRoles()
  const visibles = tabs.filter(t => t.roles.some(r => roles.includes(r)))

  if (visibles.length <= 1) return null

  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
      {visibles.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            activo === id
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
