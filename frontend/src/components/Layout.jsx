import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',          label: 'Dashboard', icon: '▤'  },
  { to: '/orders',    label: 'Orders',    icon: '📋' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/purchases', label: 'Purchases', icon: '🛒' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const close = () => setSidebarOpen(false)

  const navLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      onClick={close}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      <span>{item.icon}</span>
      {item.label}
    </NavLink>
  )

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-emerald-600">🌴 TropicAI</h1>
        <p className="text-xs text-gray-400 mt-1">Inventory Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(navLink)}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40 md:hidden transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-base font-bold text-emerald-600">🌴 TropicAI</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
