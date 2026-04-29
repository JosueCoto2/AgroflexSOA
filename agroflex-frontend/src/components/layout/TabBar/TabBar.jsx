import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Plus, ShoppingBag, User,
  QrCode, MapPin, LogIn, Store, Leaf
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../routes/routeConfig';

const ROLES = {
  PRODUCTOR: 'PRODUCTOR',
  INVERNADERO: 'INVERNADERO',
  COMPRADOR: 'COMPRADOR',
  EMPAQUE: 'EMPAQUE',
  PROVEEDOR: 'PROVEEDOR',
};

function getPrimaryRole(roles = []) {
  if (!Array.isArray(roles)) return null;
  const order = [ROLES.PRODUCTOR, ROLES.INVERNADERO, ROLES.COMPRADOR, ROLES.EMPAQUE, ROLES.PROVEEDOR];
  return order.find(r => roles.includes(r)) || null;
}

export default function TabBar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getPrimaryRole(user?.roles || []);

  // Define tab sets per role
  const getTabConfig = () => {
    if (!isAuthenticated) {
      return {
        left: [
          { icon: Home, label: 'Inicio', path: ROUTES.HOME },
          { icon: BookOpen, label: 'Catálogo', path: ROUTES.CATALOG },
        ],
        fab: { icon: LogIn, label: 'Únete', path: ROUTES.REGISTER },
        right: [
          { icon: MapPin, label: 'Cerca', path: ROUTES.MAPA },
          { icon: User, label: 'Entrar', path: ROUTES.LOGIN },
        ],
      };
    }

    if (role === ROLES.PRODUCTOR || role === ROLES.INVERNADERO) {
      return {
        left: [
          { icon: Home, label: 'Inicio', path: ROUTES.HOME },
          { icon: Leaf, label: 'Cosechas', path: ROUTES.MIS_COSECHAS },
        ],
        fab: { icon: Plus, label: 'Publicar', path: ROUTES.PUBLICAR_LOTE },
        right: [
          { icon: ShoppingBag, label: 'Pedidos', path: ROUTES.MIS_PEDIDOS },
          { icon: User, label: 'Perfil', path: ROUTES.PERFIL },
        ],
      };
    }

    if (role === ROLES.COMPRADOR || role === ROLES.EMPAQUE) {
      return {
        left: [
          { icon: Home, label: 'Inicio', path: ROUTES.HOME },
          { icon: BookOpen, label: 'Catálogo', path: ROUTES.CATALOG },
        ],
        fab: { icon: QrCode, label: 'Escanear', path: ROUTES.QR_SCANNER },
        right: [
          { icon: ShoppingBag, label: 'Pedidos', path: ROUTES.MIS_PEDIDOS },
          { icon: User, label: 'Perfil', path: ROUTES.PERFIL },
        ],
      };
    }

    if (role === ROLES.PROVEEDOR) {
      return {
        left: [
          { icon: Home, label: 'Inicio', path: ROUTES.HOME },
          { icon: Store, label: 'Mi tienda', path: ROUTES.MI_TIENDA },
        ],
        fab: { icon: Plus, label: 'Agregar', path: ROUTES.MI_TIENDA_NUEVO },
        right: [
          { icon: ShoppingBag, label: 'Pedidos', path: ROUTES.MIS_PEDIDOS },
          { icon: User, label: 'Perfil', path: ROUTES.PERFIL },
        ],
      };
    }

    // Default authenticated (no recognized role)
    return {
      left: [
        { icon: Home, label: 'Inicio', path: ROUTES.HOME },
        { icon: BookOpen, label: 'Catálogo', path: ROUTES.CATALOG },
      ],
      fab: { icon: QrCode, label: 'QR', path: ROUTES.QR_SCANNER },
      right: [
        { icon: ShoppingBag, label: 'Pedidos', path: ROUTES.MIS_PEDIDOS },
        { icon: User, label: 'Perfil', path: ROUTES.PERFIL },
      ],
    };
  };

  const { left, fab, right } = getTabConfig();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const TabItem = ({ icon: Icon, label, path }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => navigate(path)}
        className="flex-1 flex flex-col items-center gap-0.5 py-1"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
      >
        <Icon
          size={20}
          color={active ? '#3BAF2A' : '#D0ECC8'}
          strokeWidth={active ? 2.5 : 2}
        />
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 9,
          fontWeight: 600,
          color: active ? '#3BAF2A' : '#A8C8A0',
        }}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center"
      style={{
        background: '#fff',
        borderTop: '1px solid #EAF9E4',
        boxShadow: '0 -1px 8px rgba(59,175,42,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        paddingTop: 8,
      }}
    >
      {/* Left tabs */}
      {left.map(tab => <TabItem key={tab.path} {...tab} />)}

      {/* Center FAB */}
      <div className="flex justify-center" style={{ flex: '0 0 auto', width: 72 }}>
        <button
          onClick={() => navigate(fab.path)}
          className="flex flex-col items-center gap-0.5"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: '#3BAF2A',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -16,
              boxShadow: '0 5px 16px rgba(59,175,42,0.4)',
            }}
          >
            <fab.icon size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 9,
            fontWeight: 600,
            color: '#3BAF2A',
            marginTop: 2,
          }}>
            {fab.label}
          </span>
        </button>
      </div>

      {/* Right tabs */}
      {right.map(tab => <TabItem key={tab.path} {...tab} />)}
    </nav>
  );
}
