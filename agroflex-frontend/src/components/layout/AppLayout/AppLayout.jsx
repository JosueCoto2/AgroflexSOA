import { Outlet, useLocation } from 'react-router-dom'
import TopNavbar from '../TopNavbar/TopNavbar'
import BottomNav from '../BottomNav/BottomNav'
import { useNotificacionesSSE } from '../../../hooks/useNotificacionesSSE'

const RUTAS_SIN_NAV  = ['/', '/login', '/register', '/forgot-password', '/reset-password']
const RUTAS_FULLPAGE = ['/mapa']

const AppLayout = () => {
  const { pathname } = useLocation()
  const sinNav    = RUTAS_SIN_NAV.includes(pathname)
  const fullPage  = RUTAS_FULLPAGE.includes(pathname)

  const { noLeidas, nuevaNotif } = useNotificacionesSSE()

  return (
    <div className="min-h-screen bg-campo-50">
      {!sinNav && <TopNavbar noLeidas={noLeidas} nuevaNotif={nuevaNotif} />}
      <main
        className={
          sinNav   ? '' :
          fullPage ? 'pt-[80px] min-h-[calc(100vh-80px)]' :
                     'pt-[80px] pb-[64px] lg:pb-0'
        }
      >
        <Outlet />
      </main>
      {!sinNav && <BottomNav noLeidas={noLeidas} />}
    </div>
  )
}

export default AppLayout
