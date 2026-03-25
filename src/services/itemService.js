import api from './api'

export const itemService = {
  getAll: (params) => api.get('/items', { params }).then(r => r.data),
  getById: (id) => api.get(`/items/${id}`).then(r => r.data),
  getMine: (params) => api.get('/items/my', { params }).then(r => r.data),
  create: (data) => api.post('/items', data).then(r => r.data),
  update: (id, data) => api.put(`/items/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/items/${id}`).then(r => r.data),

  // Claims
  submitClaim: (data) => {
    const hasFile = Boolean(data?.document || data?.image)
    if (!hasFile) return api.post('/claims', data).then(r => r.data)

    const formData = new FormData()
    formData.append('itemId', data.itemId)
    formData.append('proofDescription', data.proofDescription)
    if (data.document) formData.append('document', data.document)
    if (data.image) formData.append('image', data.image)

    return api.post('/claims', formData).then(r => r.data)
  },
  getClaimsForItem: (itemId) => api.get(`/claims/item/${itemId}`).then(r => r.data),
  getMyClaims: (params) => api.get('/claims/my', { params }).then(r => r.data),
  getAllClaims: (params) => api.get('/claims', { params }).then(r => r.data),
  resolveClaim: (id, data) => api.patch(`/claims/${id}/resolve`, data).then(r => r.data),
}
