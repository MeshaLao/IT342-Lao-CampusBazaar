import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  Store, CheckCircle, PlusCircle,
  Eye, Pencil, Trash2, Package, X
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchMyProducts()
  }, [])

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get('/products/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(res.data.data?.products || [])
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(prev => prev.filter(p => p.id !== productId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete product', err)
    }
  }
const [isResubmit, setIsResubmit] = useState(false)

const handleEditOpen = (product, resubmit = false) => {
  setEditProduct(product)
  setIsResubmit(resubmit)
  setEditForm({
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
    description: product.description || ''
  })
}

const handleEditSave = async () => {
  setEditLoading(true)
  try {
    const token = localStorage.getItem('token')
    const data = new FormData()
    data.append('name', editForm.name)
    data.append('price', editForm.price)
    data.append('stock', editForm.stock)
    data.append('category', editForm.category)
    data.append('description', editForm.description)

    const endpoint = isResubmit
      ? `/products/${editProduct.id}/resubmit`
      : `/products/${editProduct.id}`

    await api.put(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })

    setEditProduct(null)
    setIsResubmit(false)
    fetchMyProducts()
  } catch (err) {
    console.error('Failed to update product', err)
  } finally {
    setEditLoading(false)
  }
}

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { color: '#6F803C', backgroundColor: '#6F803C22' }
      case 'PENDING_APPROVAL':
        return { color: '#B28E3A', backgroundColor: '#B28E3A22' }
      case 'REJECTED':
        return { color: '#A3464D', backgroundColor: '#A3464D22' }
      default:
        return { color: '#6b7280', backgroundColor: '#6b728022' }
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'ACTIVE'
      case 'PENDING_APPROVAL': return 'PENDING'
      case 'REJECTED': return 'REJECTED'
      default: return status
    }
  }

  const categories = [
    'Textbooks', 'Electronics', 'Furniture',
    'Clothing', 'Merchandise', 'Supplies', 'Uniforms', 'Other'
  ]

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                Edit Listing
              </h2>
              <button onClick={() => setEditProduct(null)}>
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1"
                  style={{ color: '#421C3B' }}>Title</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1"
                  style={{ color: '#421C3B' }}>Price (₱)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={e => setEditForm({...editForm, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1"
                  style={{ color: '#421C3B' }}>Stock</label>
                <input
                  type="number"
                  value={editForm.stock}
                  onChange={e => setEditForm({...editForm, stock: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1"
                  style={{ color: '#421C3B' }}>Category</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1"
                  style={{ color: '#421C3B' }}>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none"
                  style={{ borderColor: '#ddd' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditProduct(null)}
                className="px-5 py-2 rounded-lg text-sm"
                style={{ color: '#6b7280' }}>
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="px-6 py-2 rounded-lg text-sm font-bold"
                style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <Trash2 size={40} className="mx-auto mb-4" color="#A3464D" />
            <h2 className="text-lg font-bold mb-2"
              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
              Delete Listing?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2 rounded-lg text-sm border"
                style={{ borderColor: '#ddd', color: '#6b7280' }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-5 py-2 rounded-lg text-sm font-bold"
                style={{ backgroundColor: '#A3464D', color: '#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-6">

        {/* Sidebar */}
        <div className="w-72 bg-white rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-5"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            Seller Dashboard
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('listings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
              style={{
                backgroundColor: activeTab === 'listings' ? '#1D5D5D' : 'transparent',
                color: activeTab === 'listings' ? '#E8E4C9' : '#421C3B'
              }}>
              <Store size={16} />
              <span>Your Listings</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: '#E8E4C9', color: '#421C3B' }}>
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
              style={{
                backgroundColor: activeTab === 'orders' ? '#1D5D5D' : 'transparent',
                color: activeTab === 'orders' ? '#E8E4C9' : '#421C3B'
              }}>
              <CheckCircle size={16} />
              <span>Orders to Fulfill</span>
            </button>
          </div>
          <div className="my-4" style={{ borderTop: '1px solid #f0ebe0' }} />
          <Link to="/sell"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:opacity-80"
            style={{ color: '#1D5D5D' }}>
            <PlusCircle size={16} />
            <span>Create New Listing</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Your Listings
                </h1>
                <Link to="/sell"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold"
                  style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                  <PlusCircle size={14} />
                  Create New Listing
                </Link>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <Package size={40} className="mx-auto mb-3" color="#B28E3A" />
                  <p style={{ color: '#421C3B' }}>Loading your listings...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <Package size={40} className="mx-auto mb-3" color="#B28E3A" />
                  <p className="font-medium mb-4" style={{ color: '#421C3B' }}>
                    You have no listings yet.
                  </p>
                  <Link to="/sell"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold"
                    style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
                    <PlusCircle size={14} />
                    Create your first listing!
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id}
                      className="bg-white rounded-2xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition">

                      {/* Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: '#f5f0e0' }}>
                        {product.imageUrl ? (
                          <img
                            src={`http://localhost:8080${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} color="#B28E3A" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-base cursor-pointer hover:underline"
                          style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}
                          onClick={() => navigate(`/product/${product.id}`)}>
                          {product.name}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                          ₱{product.price} • {product.category}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={getStatusStyle(product.status)}>
                            {getStatusLabel(product.status)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
{/* Actions */}
<div className="flex flex-col gap-2">
  <button
    onClick={() => navigate(`/product/${product.id}`)}
    className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border hover:bg-gray-50"
    style={{ borderColor: '#ddd', color: '#421C3B' }}>
    <Eye size={12} /> View
  </button>

  {/* Show Edit for ACTIVE and PENDING */}
  {product.status !== 'REJECTED' && (
    <button
      onClick={() => handleEditOpen(product)}
      className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border hover:bg-gray-50"
      style={{ borderColor: '#ddd', color: '#421C3B' }}>
      <Pencil size={12} /> Edit
    </button>
  )}

  {/* Show Resubmit for REJECTED */}
  {product.status === 'REJECTED' && (
    <button
      onClick={() => handleEditOpen(product, true)}
      className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border font-bold"
      style={{ borderColor: '#B28E3A', color: '#B28E3A' }}>
      <Pencil size={12} /> Resubmit
    </button>
  )}

  <button
    onClick={() => setDeleteConfirm(product.id)}
    className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border hover:bg-red-50"
    style={{ borderColor: '#ddd', color: '#A3464D' }}>
    <Trash2 size={12} /> Delete
  </button>
</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                Orders to Fulfill
              </h1>
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <CheckCircle size={40} className="mx-auto mb-3" color="#B28E3A" />
                <p style={{ color: '#6b7280' }}>
                  You have no pending orders to fulfill.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    <Footer />
    </div>
  )
}