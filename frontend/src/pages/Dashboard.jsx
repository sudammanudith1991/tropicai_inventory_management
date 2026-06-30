import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ orders: 0, inventory: 0, lowStock: 0, products: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/orders').catch(() => ({ data: [] })),
      api.get('/inventory').catch(() => ({ data: [] })),
      api.get('/products').catch(() => ({ data: [] })),
    ]).then(([orders, inventory, products]) => {
      const inv = Array.isArray(inventory.data) ? inventory.data : []
      setStats({
        orders: Array.isArray(orders.data) ? orders.data.length : 0,
        inventory: inv.length,
        lowStock: inv.filter(i => i.quantity <= i.reorderLevel).length,
        products: Array.isArray(products.data) ? products.data.length : 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Total Orders',     value: stats.orders,    bg: 'bg-blue-50',    text: 'text-blue-700',    icon: '📋' },
    { label: 'Inventory Items',  value: stats.inventory, bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '📦' },
    { label: 'Products',         value: stats.products,  bg: 'bg-purple-50',  text: 'text-purple-700',  icon: '🏷️' },
    { label: 'Low Stock Alerts', value: stats.lowStock,  bg: 'bg-red-50',     text: 'text-red-700',     icon: '⚠️' },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-400 text-sm mt-1">Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 md:p-6`}>
            <div className="text-xl md:text-2xl mb-2 md:mb-3">{card.icon}</div>
            <div className={`text-2xl md:text-3xl font-bold ${card.text}`}>{card.value}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
