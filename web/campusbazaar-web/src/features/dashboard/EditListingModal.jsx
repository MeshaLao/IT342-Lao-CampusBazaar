import { useState } from 'react'
import Modal from '../../shared/components/ui/Modal'
import ImageUpload from '../../shared/components/ui/ImageUpload'
import AlertBanner from '../../shared/components/ui/AlertBanner'

const CATEGORIES = [
  'Textbooks', 'Electronics', 'Furniture',
  'Clothing', 'Merchandise', 'Supplies', 'Uniforms', 'Other'
]

export default function EditListingModal({ product, isResubmit, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
    description: product.description || ''
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    await onSave(form, image, isResubmit)
    setLoading(false)
  }

  return (
    <Modal
      title={isResubmit ? 'Edit & Resubmit Listing' : 'Edit Listing'}
      onClose={onClose}
      maxWidth="max-w-lg">

      {isResubmit && (
        <AlertBanner type="error"
          message="Your listing was rejected by the admin. Please update your details and resubmit for approval." />
      )}

      <div className="space-y-4">
        <ImageUpload
          currentUrl={product.imageUrl}
          name={product.name}
          onChange={setImage}
        />

        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: '#421C3B' }}>
            Product Name
          </label>
          <input type="text" value={form.name} onChange={set('name')}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: '#ddd' }} />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold block mb-1" style={{ color: '#421C3B' }}>
              Price (₱)
            </label>
            <input type="number" value={form.price} onChange={set('price')}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: '#ddd' }} />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold block mb-1" style={{ color: '#421C3B' }}>
              Stock
            </label>
            <input type="number" value={form.stock} onChange={set('stock')}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: '#ddd' }} />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: '#421C3B' }}>
            Category
          </label>
          <select value={form.category} onChange={set('category')}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: '#ddd' }}>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: '#421C3B' }}>
            Description
          </label>
          <textarea value={form.description} onChange={set('description')}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none"
            style={{ borderColor: '#ddd' }} />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose}
          className="px-5 py-2 rounded-lg text-sm border"
          style={{ borderColor: '#ddd', color: '#6b7280' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: isResubmit ? '#B28E3A' : '#1D5D5D',
            color: '#fff'
          }}>
          {loading ? 'Saving...' : isResubmit ? '↩ Resubmit for Approval' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
}