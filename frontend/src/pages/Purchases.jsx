// Purchases Page
import { useEffect, useState } from 'react'
import { purchasesApi, vendorsApi, productsApi } from '../api'
import { format, startOfMonth } from 'date-fns'
import toast from 'react-hot-toast'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [vendors, setVendors]     = useState([])
  const [products, setProducts]   = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm] = useState({
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    vendorId: '', productId: '', quantityKg: '', buyingPricePerKg: '', wastageKg: '', notes: ''
  })

  const from = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const to   = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    purchasesApi.getAll(from, to).then(r => setPurchases(r.data))
    vendorsApi.getAll().then(r => setVendors(r.data))
    productsApi.getAll().then(r => setProducts(r.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await purchasesApi.create({
        ...form,
        vendorId: Number(form.vendorId),
        productId: Number(form.productId),
        quantityKg: Number(form.quantityKg),
        buyingPricePerKg: Number(form.buyingPricePerKg),
        wastageKg: form.wastageKg ? Number(form.wastageKg) : 0,
      })
      toast.success('Purchase recorded')
      setShowForm(false)
      purchasesApi.getAll(from, to).then(r => setPurchases(r.data))
    } catch { toast.error('Failed to save purchase') }
  }

  const totalCost = purchases.reduce((s, p) => s + p.quantityKg * p.buyingPricePerKg, 0)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vendor Purchases</h2>
          <p className="text-sm text-gray-500">Total: Rs. {totalCost.toLocaleString()}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
          + Add Purchase
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><label className="label">Date</label><input type="date" className="input" value={form.purchaseDate} onChange={e => setForm(f => ({...f, purchaseDate: e.target.value}))} required /></div>
          <div><label className="label">Vendor</label>
            <select className="input" value={form.vendorId} onChange={e => setForm(f => ({...f, vendorId: e.target.value}))} required>
              <option value="">Select…</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div><label className="label">Product</label>
            <select className="input" value={form.productId} onChange={e => setForm(f => ({...f, productId: e.target.value}))} required>
              <option value="">Select…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="label">Quantity (kg)</label><input type="number" step="0.01" className="input" value={form.quantityKg} onChange={e => setForm(f => ({...f, quantityKg: e.target.value}))} required /></div>
          <div><label className="label">Buy Price / kg (Rs.)</label><input type="number" step="0.01" className="input" value={form.buyingPricePerKg} onChange={e => setForm(f => ({...f, buyingPricePerKg: e.target.value}))} required /></div>
          <div><label className="label">Wastage (kg)</label><input type="number" step="0.01" className="input" value={form.wastageKg} onChange={e => setForm(f => ({...f, wastageKg: e.target.value}))} /></div>
          <div className="col-span-full flex gap-2">
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              {['Date','Vendor','Product','Qty (kg)','Price/kg','Total Cost','Wastage'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {purchases.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{p.purchaseDate}</td>
                <td className="px-4 py-3">{p.vendor?.name}</td>
                <td className="px-4 py-3 font-medium">{p.product?.name}</td>
                <td className="px-4 py-3">{p.quantityKg}</td>
                <td className="px-4 py-3">Rs. {p.buyingPricePerKg?.toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-green-700">Rs. {(p.quantityKg * p.buyingPricePerKg)?.toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500">{p.wastageKg || 0}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No purchases this month</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`.label{display:block;font-size:0.75rem;font-weight:500;color:#4b5563;margin-bottom:0.25rem}.input{width:100%;border:1px solid #d1d5db;border-radius:0.5rem;padding:0.4rem 0.6rem;font-size:0.875rem;outline:none}`}</style>
    </div>
  )
}
