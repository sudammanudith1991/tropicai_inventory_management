import { useState, useEffect } from 'react'
import api from '../api'

const STATUS_COLORS = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED:    'bg-orange-100 text-orange-700',
  DELIVERED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-red-100 text-red-700',
}

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const EMPTY = {
  orderNumber: '', customerName: '', customerEmail: '',
  status: 'PENDING', totalAmount: '', notes: '',
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/orders')
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (order) => { setEditing(order); setForm({ ...order, totalAmount: order.totalAmount ?? '' }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, totalAmount: Number(form.totalAmount) }
      editing ? await api.put(`/orders/${editing.id}`, payload)
               : await api.post('/orders', payload)
      closeModal()
      load()
    } catch (err) {
      alert(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await api.delete(`/orders/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  const field = (label, key, type = 'text', extra = {}) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        {...extra}
      />
    </div>
  )

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-400 mt-1">{orders.length} orders total</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Order
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-16 text-center text-gray-400">
          No orders yet. Create your first one.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Order #', 'Customer', 'Email', 'Status', 'Total', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                      <td className="px-6 py-4 text-gray-500">{order.customerEmail}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">${Number(order.totalAmount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => openEdit(order)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                          <button onClick={() => setDeleteTarget(order.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                  </div>
                  <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-semibold text-gray-700">${Number(order.totalAmount).toFixed(2)}</span>
                  <div className="flex gap-4">
                    <button onClick={() => openEdit(order)} className="text-blue-600 text-sm font-medium">Edit</button>
                    <button onClick={() => setDeleteTarget(order.id)} className="text-red-500 text-sm font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit Order' : 'New Order'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {field('Order Number', 'orderNumber', 'text', { required: true, placeholder: 'ORD-001' })}
            {field('Customer Name', 'customerName', 'text', { required: true })}
            {field('Customer Email', 'customerEmail', 'email')}
            {field('Total Amount ($)', 'totalAmount', 'number', { required: true, min: '0', step: '0.01' })}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={set('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Order" onClose={() => setDeleteTarget(null)}>
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <p className="text-gray-600 text-sm mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
