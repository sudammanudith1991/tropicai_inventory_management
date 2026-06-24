import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/purchases', label: '🛒 Purchases' },
  { to: '/orders',    label: '📦 Orders' },
  { to: '/inventory', label: '🗃️ Inventory' },
  { to: '/customers', label: '👥 Customers' },
  { to: '/credits',   label: '💳 Credits' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-green-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-green-800">
          <h1 className="text-xl font-bold tracking-wide">🌿 Tropicai</h1>
          <p className="text-xs text-green-300 mt-1">Inventory System</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-green-800">
          <p className="text-xs text-green-300 mb-2">{user?.username} · {user?.role}</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs bg-green-800 hover:bg-green-700 text-white py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
