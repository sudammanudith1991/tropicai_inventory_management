import { useEffect, useState } from 'react'
import { dashboardApi } from '../api'
import { format, startOfMonth } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}`

function StatCard({ label, value, color = 'green' }) {
  const colors = { green: 'bg-green-50 border-green-200 text-green-700', amber: 'bg-amber-50 border-amber-200 text-amber-700', red: 'bg-red-50 border-red-200 text-red-700', blue: 'bg-blue-50 border-blue-200 text-blue-700' }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [stock, setStock]     = useState([])
  const [from]  = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to]    = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    dashboardApi.summary(from, to).then(r => setSummary(r.data))
    dashboardApi.stock().then(r => setStock(r.data))
  }, [from, to])

  const lowStock = stock.filter(s => s.isLowStock)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">{from} → {to} (this month)</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Revenue"    value={fmt(summary.totalRevenue)}     color="green" />
          <StatCard label="Received Cash"    value={fmt(summary.receivedCash)}     color="blue"  />
          <StatCard label="Outstanding Credit" value={fmt(summary.totalCredit)}    color="amber" />
          <StatCard label="Net Profit"       value={fmt(summary.netProfit)}        color={summary.netProfit >= 0 ? 'green' : 'red'} />
          <StatCard label="Purchase Cost"    value={fmt(summary.totalPurchaseCost)} color="blue" />
          <StatCard label="Gross Profit"     value={fmt(summary.grossProfit)}      color="green" />
          <StatCard label="Other Costs"      value={fmt(summary.totalOtherCosts)}  color="amber" />
        </div>
      )}

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-700 mb-2">⚠️ Low Stock Alerts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lowStock.map(s => (
              <div key={s.productId} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-sm">
                <p className="font-medium text-gray-800">{s.productName}</p>
                <p className="text-red-600 font-bold">{s.remaining} {s.unit} remaining</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock chart */}
      {stock.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Stock Levels</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stock} margin={{ top: 0, right: 0, bottom: 60, left: 0 }}>
              <XAxis dataKey="productName" angle={-40} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} kg`, 'Remaining']} />
              <Bar dataKey="remaining" radius={[4,4,0,0]}>
                {stock.map((s, i) => (
                  <Cell key={i} fill={s.isLowStock ? '#ef4444' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
