// Orders Page
import { useEffect, useState } from 'react'
import { ordersApi, customersApi, productsApi } from '../api'
import { format, startOfMonth } from 'date-fns'
import toast from 'react-hot-toast'

export function Orders() {
  const [orders, setOrders]     = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts]   = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm] = useState({
    orderDate: format(new Date(), 'yyyy-MM-dd'),
    customerId: '', status: 'PAID', notes: '',
    items: [{ productId: '', quantityKg: '', sellingPricePerKg: '', settledAmount: '' }]
  })

  const from = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const to   = format(new Date(), 'yyyy-MM-dd')

  const load = () => ordersApi.getAll(from, to).then(r => setOrders(r.data))
  useEffect(() => {
    load()
    customersApi.getAll().then(r => setCustomers(r.data))
    productsApi.getAll().then(r => setProducts(r.data))
  }, [])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: '', quantityKg: '', sellingPricePerKg: '', settledAmount: '' }] }))
  const updateItem = (i, key, val) => setForm(f => { const items = [...f.items]; items[i] = { ...items[i], [key]: val }; return { ...f, items } })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await ordersApi.create({
        ...form,
        customerId: Number(form.customerId),
        items: form.items.map(it => ({
          productId: Number(it.productId),
          quantityKg: Number(it.quantityKg),
          sellingPricePerKg: Number(it.sellingPricePerKg),
          settledAmount: it.settledAmount ? Number(it.settledAmount) : 0,
        }))
      })
      toast.success('Order recorded')
      setShowForm(false)
      load()
    } catch { toast.error('Failed to save order') }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Customer Orders</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
          + New Order
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Date</label><input type="date" className="input" value={form.orderDate} onChange={e => setForm(f => ({...f, orderDate: e.target.value}))} required /></div>
            <div><label className="label">Customer</label>
              <select className="input" value={form.customerId} onChange={e => setForm(f => ({...f, customerId: e.target.value}))} required>
                <option value="">Select…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                <option value="PAID">Paid</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Items</p>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <select className="input" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} required>
                  <option value="">Product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" step="0.01" placeholder="Qty kg" className="input" value={item.quantityKg} onChange={e => updateItem(i, 'quantityKg', e.target.value)} required />
                <input type="number" step="0.01" placeholder="Price/kg" className="input" value={item.sellingPricePerKg} onChange={e => updateItem(i, 'sellingPricePerKg', e.target.value)} required />
                <input type="number" step="0.01" placeholder="Settled Rs." className="input" value={item.settledAmount} onChange={e => updateItem(i, 'settledAmount', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-xs text-green-700 hover:underline">+ Add item</button>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Save Order</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Date','Customer','Revenue','Settled','Credit','Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{o.orderDate}</td>
                <td className="px-4 py-3 font-medium">{o.customer?.name}</td>
                <td className="px-4 py-3 text-green-700 font-medium">Rs. {Number(o.totalRevenue).toLocaleString()}</td>
                <td className="px-4 py-3">Rs. {Number(o.settledAmount).toLocaleString()}</td>
                <td className="px-4 py-3 text-amber-600">Rs. {Number(o.totalCredit).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.status === 'PAID' ? 'bg-green-100 text-green-700' : o.status === 'CREDIT' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No orders this month</td></tr>}
          </tbody>
        </table>
      </div>
      <style>{`.label{display:block;font-size:0.75rem;font-weight:500;color:#4b5563;margin-bottom:0.25rem}.input{width:100%;border:1px solid #d1d5db;border-radius:0.5rem;padding:0.4rem 0.6rem;font-size:0.875rem;outline:none}`}</style>
    </div>
  )
}

export default Orders
