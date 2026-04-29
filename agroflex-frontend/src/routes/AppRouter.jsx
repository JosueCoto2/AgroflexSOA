import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Auth Pages
import LoginPage          from '../pages/auth/LoginPage'
import RegisterPage       from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage'

// Shared Pages
import LandingPage        from '../pages/shared/LandingPage'
import PerfilPage         from '../pages/shared/PerfilPage'
import NotificacionesPage from '../pages/shared/NotificacionesPage'
import MapaPage           from '../pages/shared/MapaPage'
import ReputationPage      from '../pages/shared/ReputationPage'
import ConfiguracionPage  from '../pages/shared/ConfiguracionPage'
import PublicProfilePage  from '../pages/shared/PublicProfilePage'

// Layout
import PrivateRoute from '../components/layout/PrivateRoute/PrivateRoute'
import GuestRoute   from '../components/layout/GuestRoute/GuestRoute'
import AppLayout    from '../components/layout/AppLayout/AppLayout'
import AdminRoute   from '../components/admin/AdminRoute'
import AdminLayout  from '../components/admin/AdminLayout'
import { ToastProvider } from '../components/admin/ToastNotification'

// Catalog
import CatalogPage       from '../pages/catalog/CatalogPage'
import HarvestDetailPage from '../pages/catalog/HarvestDetailPage'

// Buyer Pages
import MisPedidos       from '../pages/buyer/MisPedidos'
import EscanearQR       from '../pages/buyer/EscanearQR'
import OrdenDetallePage from '../pages/buyer/OrdenDetallePage'
import MiQRPage         from '../pages/buyer/MiQRPage'
import PagarOrdenPage   from '../pages/buyer/PagarOrdenPage'

// Producer Pages
import MyHarvestsPage    from '../pages/producer/MyHarvestsPage'
import EditLotePage       from '../pages/producer/EditLotePage'
import PublishHarvestPage from '../pages/producer/PublishHarvestPage'

// Supplier Pages
import DashboardSupplier from '../pages/supplier/DashboardSupplier'

// Badge
import VerifyBadgePage from '../pages/auth/VerifyBadgePage'

// Admin pages
import DashboardAdmin       from '../pages/admin/DashboardAdmin'
import UsersManagementPage  from '../pages/admin/UsersManagementPage'
import AdminInsignias       from '../pages/admin/AdminInsignias'
import AdminCatalogo        from '../pages/admin/AdminCatalogo'
import AdminPedidos         from '../pages/admin/AdminPedidos'
import AdminDisputas        from '../pages/admin/AdminDisputas'
import TransactionsPage     from '../pages/admin/TransactionsPage'
import AdminUsuarioDetalle  from '../pages/admin/AdminUsuarioDetalle'
import AdminHealthMonitor   from '../pages/admin/AdminHealthMonitor'
import AdminBroadcast       from '../pages/admin/AdminBroadcast'

import { ROUTES } from './routeConfig'

const ComingSoon = ({ label }) => (
  <div className="min-h-screen flex items-center justify-center text-campo-400">
    {label} — Próximamente
  </div>
)

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-campo-50">
    <div className="text-center">
      <h1 className="text-7xl font-semibold text-campo-200 mb-2">404</h1>
      <p className="text-campo-500">Página no encontrada.</p>
    </div>
  </div>
)

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-campo-50">
    <div className="text-center">
      <h1 className="text-4xl font-semibold text-red-600 mb-4">Acceso Denegado</h1>
      <p className="text-campo-600">No tienes permisos para acceder a esta sección.</p>
    </div>
  </div>
)

const AppRouter = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* ── Rutas solo para no autenticados (redirigen al catálogo si hay sesión) */}
          <Route element={<GuestRoute />}>
            <Route path={ROUTES.HOME}            element={<LandingPage />} />
            <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
            <Route path={ROUTES.REGISTER}        element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          </Route>
          {/* Reset password no tiene guard — el token de la URL ya lo protege */}
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

          {/* ── AppLayout — todas las rutas de la app */}
          <Route element={<AppLayout />}>
            {/* Públicas dentro del layout */}
            <Route path={ROUTES.CATALOG}         element={<CatalogPage />} />
            <Route path={ROUTES.CATALOG_DETAILS} element={<HarvestDetailPage />} />
            <Route path={ROUTES.MAPA}            element={<MapaPage />} />
            <Route path={ROUTES.VENDEDOR_PERFIL} element={<PublicProfilePage />} />

            {/* Cualquier usuario autenticado */}
            <Route element={<PrivateRoute allowedRoles={[]} />}>
              <Route path={ROUTES.QR_SCANNER}           element={<EscanearQR />} />
              <Route path={ROUTES.MIS_PEDIDOS}          element={<MisPedidos />} />
              <Route path={ROUTES.MIS_COMPRAS}          element={<MisPedidos />} />
              <Route path={ROUTES.MIS_PEDIDOS_DETALLE}  element={<OrdenDetallePage />} />
              <Route path={ROUTES.MI_QR}                element={<MiQRPage />} />
              <Route path={ROUTES.PAGAR_ORDEN}          element={<PagarOrdenPage />} />
              <Route path={ROUTES.VERIFY_BADGE}         element={<VerifyBadgePage />} />
              <Route path={ROUTES.PERFIL}               element={<PerfilPage />} />
              <Route path={ROUTES.PROFILE}              element={<PerfilPage />} />
              <Route path={ROUTES.NOTIFICACIONES}       element={<NotificacionesPage />} />
              <Route path={ROUTES.PAYMENTS}             element={<ComingSoon label="Pagos" />} />
              <Route path={ROUTES.RESENAS}              element={<ReputationPage />} />
              <Route path={ROUTES.CONFIGURACION}        element={<ConfiguracionPage />} />
            </Route>

            {/* Productor / Invernadero */}
            <Route element={<PrivateRoute allowedRoles={['PRODUCTOR', 'INVERNADERO']} />}>
              <Route path={ROUTES.MIS_COSECHAS}  element={<MyHarvestsPage />} />
              <Route path={ROUTES.EDITAR_LOTE}   element={<EditLotePage />} />
              <Route path={ROUTES.PUBLICAR_LOTE} element={<PublishHarvestPage />} />
              <Route path={ROUTES.PRODUCER_LOTS_NEW} element={<PublishHarvestPage />} />
              <Route path="/producer/publish" element={<PublishHarvestPage />} />
            </Route>

            {/* Proveedor */}
            <Route element={<PrivateRoute allowedRoles={['PROVEEDOR']} />}>
              <Route path={ROUTES.MI_TIENDA}       element={<DashboardSupplier />} />
              <Route path={ROUTES.MI_TIENDA_NUEVO} element={<PublishHarvestPage />} />
              <Route path={ROUTES.SUPPLIER_LOTS_NEW} element={<PublishHarvestPage />} />
            </Route>
          </Route>

          {/* ── Admin */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN_DASHBOARD}     element={<DashboardAdmin />} />
              <Route path={ROUTES.ADMIN_USUARIOS}      element={<UsersManagementPage />} />
              <Route path={ROUTES.ADMIN_INSIGNIAS}     element={<AdminInsignias />} />
              <Route path={ROUTES.ADMIN_CATALOGO}      element={<AdminCatalogo />} />
              <Route path={ROUTES.ADMIN_PEDIDOS}       element={<AdminPedidos />} />
              <Route path={ROUTES.ADMIN_DISPUTAS}         element={<AdminDisputas />} />
              <Route path={ROUTES.ADMIN_TRANSACCIONES}    element={<TransactionsPage />} />
              <Route path={ROUTES.ADMIN_USUARIO_DETALLE}  element={<AdminUsuarioDetalle />} />
              <Route path={ROUTES.ADMIN_HEALTH}           element={<AdminHealthMonitor />} />
              <Route path={ROUTES.ADMIN_BROADCAST}        element={<AdminBroadcast />} />
            </Route>
          </Route>

          {/* ── Errores */}
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
          <Route path="*"                   element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default AppRouter
