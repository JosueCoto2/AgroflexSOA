import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { getMenuByRole } from '../../../utils/menuConfig'

const MiniSidebar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const menuItems = getMenuByRole(user?.roles)

  return (
    <div className="flex flex-col gap-1 py-4 px-2">
      {menuItems.map(({ icon: Icon, path, label }) => {
        const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
        return (
          <Link
            key={path}
            to={path}
            title={label}
            className={[
              'w-11 h-11 rounded-card flex items-center justify-center transition-all',
              isActive
                ? 'bg-verde-400/15 text-verde-400'
                : 'text-white/45 hover:bg-white/5 hover:text-white/80',
            ].join(' ')}
          >
            <Icon size={19} />
          </Link>
        )
      })}
    </div>
  )
}

export default MiniSidebar
