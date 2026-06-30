import { useState, useEffect } from 'react'
import api from '../api'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/inventory')
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
          <p className="text-sm text-gray-400 mt-1">{items.length} items tracked</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['SKU', 'Name', 'Quantity', 'Unit Price', 'Reorder Level', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    No inventory yet. Add items via the Purchases page.
                  </td>
                </tr>
              ) : items.map(item => {
                const isLow = item.quantity <= item.reorderLevel
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className={`px-6 py-4 font-semibold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600">${Number(item.unitPrice).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">{item.reorderLevel}</td>
                    <td className="px-6 py-4">
                      {isLow
                        ? <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Low Stock</span>
                        : <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">In Stock</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
