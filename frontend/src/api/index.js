import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/api/auth/login', data),
  me:       ()     => api.get('/api/auth/me'),
  register: (data) => api.post('/api/auth/register', data),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll:   ()        => api.get('/api/products'),
  create:   (data)    => api.post('/api/products', data),
  update:   (id, data)=> api.put(`/api/products/${id}`, data),
  remove:   (id)      => api.delete(`/api/products/${id}`),
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorsApi = {
  getAll: () => api.get('/api/vendors'),
  create: (data) => api.post('/api/vendors', data),
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: () => api.get('/api/customers'),
  create: (data) => api.post('/api/customers', data),
  orders: (id) => api.get(`/api/orders/customer/${id}`),
}

// ─── Purchases ────────────────────────────────────────────────────────────────
export const purchasesApi = {
  getAll:  (from, to) => api.get('/api/purchases', { params: { from, to } }),
  create:  (data)     => api.post('/api/purchases', data),
  remove:  (id)       => api.delete(`/api/purchases/${id}`),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll:       (from, to)    => api.get('/api/orders', { params: { from, to } }),
  create:       (data)        => api.post('/api/orders', data),
  settleCredit: (id, amount)  => api.patch(`/api/orders/${id}/settle`, { amount }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  summary: (from, to) => api.get('/api/dashboard/summary', { params: { from, to } }),
  stock:   ()         => api.get('/api/dashboard/stock'),
}
