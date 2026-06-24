import { useEffect, useState } from 'react'
import { customersApi } from '../api'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm] = useState({ name: '', location: '', phone: '', customerType: 'RETAIL' })

  const load = () => customersApi.getAll().then(r => setCustomers(r.data))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await customersApi.create(form)
      toast.success('Customer added')
      setShowForm(false)
      load()
    } catch { toast.error('Failed to add customer') }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Customers</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
          + Add Customer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-3">
          <div><label className="label">Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
          <div><label className="label">Type</label>
            <select className="input" value={form.customerType} onChange={e => setForm(f => ({...f, customerType: e.target.value}))}>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
            </select>
          </div>
          <div className="col-span-full flex gap-2">
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customers.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-gray-800">{c.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.customerType === 'WHOLESALE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {c.customerType}
              </span>
            </div>
            {c.location && <p className="text-sm text-gray-500 mt-1">📍 {c.location}</p>}
            {c.phone    && <p className="text-sm text-gray-500">📞 {c.phone}</p>}
          </div>
        ))}
      </div>
      <style>{`.label{display:block;font-size:0.75rem;font-weight:500;color:#4b5563;margin-bottom:0.25rem}.input{width:100%;border:1px solid #d1d5db;border-radius:0.5rem;padding:0.4rem 0.6rem;font-size:0.875rem;outline:none}`}</style>
    </div>
  )
}
