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
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Inventory</h2>
          <p className="text-sm text-gray-400 mt-1">{items.length} items tracked</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-16 text-center text-gray-400">
          No inventory yet. Add items via the Purchases page.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['SKU', 'Name', 'Quantity', 'Unit Price', 'Reorder Level', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => {
                    const isLow = item.quantity <= item.reorderLevel
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50/50' : ''}`}>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                        <td className={`px-6 py-4 font-semibold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>{item.quantity}</td>
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
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map(item => {
              const isLow = item.quantity <= item.reorderLevel
              return (
                <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-4 ${isLow ? 'border-red-200' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{item.sku}</p>
                    </div>
                    {isLow
                      ? <span className="shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Low Stock</span>
                      : <span className="shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">In Stock</span>
                    }
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className={`text-base font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{item.quantity}</p>
                      <p className="text-xs text-gray-400">Qty</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-base font-bold text-gray-800">${Number(item.unitPrice).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Price</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-base font-bold text-gray-800">{item.reorderLevel}</p>
                      <p className="text-xs text-gray-400">Reorder</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
