import { useState } from 'react'
import api from '../api'

const EMPTY = {
  sku: '', name: '', description: '', quantity: '', unitPrice: '', reorderLevel: '10',
}

export default function Purchases() {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/inventory', {
        ...form,
        quantity:     Number(form.quantity),
        unitPrice:    Number(form.unitPrice),
        reorderLevel: Number(form.reorderLevel),
      })
      setForm(EMPTY)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to add inventory item')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Wholesale Purchase</h2>
        <p className="text-sm text-gray-400 mt-1">Add new stock from a wholesale purchase.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8 max-w-2xl">
        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
            ✓ Inventory added successfully
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU <span className="text-red-400">*</span></label>
              <input type="text" value={form.sku} onChange={set('sku')} required placeholder="e.g. MANGO-01" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.name} onChange={set('name')} required placeholder="e.g. Fresh Mango" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={2}
              placeholder="Optional description"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-400">*</span></label>
              <input type="number" min="1" value={form.quantity} onChange={set('quantity')} required placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($) <span className="text-red-400">*</span></label>
              <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} required placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <input type="number" min="0" value={form.reorderLevel} onChange={set('reorderLevel')} placeholder="10" className={inputClass} />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Adding...' : 'Add to Inventory'}
            </button>
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
