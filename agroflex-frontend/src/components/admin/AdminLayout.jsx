import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../hooks/useAuth'
import { useAdminStats } from '../../hooks/useAdminStats'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { stats } = useAdminStats()

  const badges = {
    insignias: stats?.insignias?.pendientes ?? 0,
    disputas: (stats?.disputas?.abiertas ?? 0) + (stats?.disputas?.enRevision ?? 0),
  }

  const initials = user?.nombre
    ? user.nombre.charAt(0).toUpperCase() + (user?.apellidos?.charAt(0) ?? '').toUpperCase()
    : 'A'

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar fijo */}
      <div
        className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} badges={badges} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm h-16 flex items-center px-4 sm:px-6 gap-3">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
            <Bell className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-xl bg-green-700 flex items-center justify-center text-xs font-bold text-white select-none">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.nombre ?? 'Admin'}</p>
              <p className="text-xs text-slate-400 leading-tight">{user?.correo ?? ''}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
