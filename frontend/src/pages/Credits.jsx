import { useEffect, useState } from 'react'
import { ordersApi, customersApi } from '../api'
import { format, startOfMonth, subMonths } from 'date-fns'
import toast from 'react-hot-toast'

export default function Credits() {
  const [orders, setOrders]       = useState([])
  const [customers, setCustomers] = useState([])
  const [settling, setSettling]   = useState(null)
  const [payAmount, setPayAmount] = useState('')

  const from = format(subMonths(new Date(), 3), 'yyyy-MM-dd')
  const to   = format(new Date(), 'yyyy-MM-dd')

  const load = () => {
    ordersApi.getAll(from, to).then(r => setOrders(r.data))
    customersApi.getAll().then(r => setCustomers(r.data))
  }
  useEffect(() => { load() }, [])

  const creditOrders = orders.filter(o => Number(o.totalCredit) > 0)

  const byCustomer = customers.reduce((acc, c) => {
    const cos = creditOrders.filter(o => o.customer?.id === c.id)
    const outstanding = cos.reduce((s, o) => s + Number(o.totalCredit), 0)
    if (outstanding > 0) acc.push({ customer: c, orders: cos, outstanding })
    return acc
  }, []).sort((a, b) => b.outstanding - a.outstanding)

  const totalOutstanding = byCustomer.reduce((s, b) => s + b.outstanding, 0)

  const handleSettle = async (orderId) => {
    if (!payAmount || isNaN(payAmount)) return toast.error('Enter a valid amount')
    try {
      await ordersApi.settleCredit(orderId, Number(payAmount))
      toast.success('Payment recorded')
      setSettling(null)
      setPayAmount('')
      load()
    } catch { toast.error('Failed to record payment') }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Credit Tracker</h2>
        <p className="text-sm text-gray-500">Total outstanding: <span className="font-bold text-amber-600">Rs. {totalOutstanding.toLocaleString()}</span></p>
      </div>

      {byCustomer.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-700">
          ✅ No outstanding credits — all settled!
        </div>
      )}

      {byCustomer.map(({ customer, orders: cos, outstanding }) => (
        <div key={customer.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{customer.name}</p>
              <p className="text-xs text-gray-500">{customer.location}</p>
            </div>
            <p className="text-lg font-bold text-amber-700">Rs. {outstanding.toLocaleString()}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>{['Date','Revenue','Settled','Outstanding','Action'].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cos.map(o => (
                <tr key={o.id}>
                  <td className="px-4 py-2">{o.orderDate}</td>
                  <td className="px-4 py-2">Rs. {Number(o.totalRevenue).toLocaleString()}</td>
                  <td className="px-4 py-2 text-green-600">Rs. {Number(o.settledAmount).toLocaleString()}</td>
                  <td className="px-4 py-2 font-bold text-amber-600">Rs. {Number(o.totalCredit).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {settling === o.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" className="border rounded px-2 py-1 text-xs w-24" placeholder="Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus />
                        <button onClick={() => handleSettle(o.id)} className="text-xs bg-green-700 text-white px-2 py-1 rounded">OK</button>
                        <button onClick={() => setSettling(null)} className="text-xs text-gray-400">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setSettling(o.id); setPayAmount('') }} className="text-xs text-blue-600 hover:underline">
                        Settle payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
