import { useEffect, useState } from 'react'
import { dashboardApi } from '../api'

export default function Inventory() {
  const [stock, setStock] = useState([])

  useEffect(() => {
    dashboardApi.stock().then(r => setStock(r.data))
  }, [])

  const low  = stock.filter(s => s.isLowStock)
  const good = stock.filter(s => !s.isLowStock)

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Inventory / Stock Levels</h2>

      {low.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-2">⚠️ Low Stock ({low.length} items)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {low.map(s => (
              <div key={s.productId} className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="font-semibold text-gray-800 text-sm">{s.productName}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{Number(s.remaining).toFixed(1)}</p>
                <p className="text-xs text-gray-500">{s.unit} · alert at {s.lowStockAlert}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">All Products</h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Product','Remaining','Unit','Alert Threshold','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stock.map(s => (
                <tr key={s.productId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.productName}</td>
                  <td className="px-4 py-3 font-bold">{Number(s.remaining).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{s.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{s.lowStockAlert}</td>
                  <td className="px-4 py-3">
                    {s.isLowStock
                      ? <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Low</span>
                      : <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">OK</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
