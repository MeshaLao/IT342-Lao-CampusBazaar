import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Toast from '../components/ui/Toast'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ProductCard from '../components/dashboard/ProductCard'
import EditListingModal from '../components/dashboard/EditListingModal'
import OrdersTab from '../components/dashboard/OrdersTab'
import useToast from '../hooks/useToast'
import {
  Store, CheckCircle, PlusCircle,
  Package, Trash2, AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { toast, showToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')
  const [editProduct, setEditProduct] = useState(null)
  const [isResubmit, setIsResubmit] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchMyProducts() }, [])

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
      showToast('Listing deleted successfully.')
    } catch {
      showToast('Failed to delete listing.', 'error')
    }
  }

  const handleEditSave = async (form, image, resubmit) => {
    try {
      const token = localStorage.getItem('token')
      const data = new FormData()
      data.append('name', form.name)
      data.append('price', form.price)
      data.append('stock', form.stock)
      data.append('category', form.category)
      data.append('description', form.description)
      if (image) data.append('image', image)

      const endpoint = resubmit
        ? `/products/${editProduct.id}/resubmit`
        : `/products/${editProduct.id}`

      await api.put(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setEditProduct(null)
      fetchMyProducts()
      showToast(resubmit
        ? 'Product resubmitted for approval!'
        : 'Listing updated successfully!')
    } catch {
      showToast('Failed to save changes.', 'error')
    }
  }

  const activeProducts = products.filter(p => p.status !== 'REJECTED')
  const rejectedProducts = products.filter(p => p.status === 'REJECTED')

  const SidebarBtn = ({ tab, icon: Icon, label, count, badgeColor }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
      style={{
        backgroundColor: activeTab === tab ? '#1D5D5D' : 'transparent',
        color: activeTab === tab ? '#E8E4C9' : '#421C3B'
      }}>
      <Icon size={16} />
      <span>{label}</span>
      {count !== undefined && (
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
          style={{
            backgroundColor: badgeColor || '#E8E4C9',
            color: badgeColor ? '#fff' : '#421C3B'
          }}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <Toast message={toast?.msg} type={toast?.type} />

      {/* Edit Modal */}
      {editProduct && (
        <EditListingModal
          product={editProduct}
          isResubmit={isResubmit}
          onClose={() => { setEditProduct(null); setIsResubmit(false) }}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmDialog
          icon={Trash2}
          title="Delete Listing?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-6">

        {/* ── SIDEBAR ── */}
        <div className="w-72 bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-8">
          <h2
            className="text-lg font-bold mb-5"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            Seller Dashboard
          </h2>

          <div className="space-y-1">
            <SidebarBtn
              tab="listings"
              icon={Store}
              label="Your Listings"
              count={activeProducts.length}
            />

            {/* Rejected sub-tab */}
            <button
              onClick={() => setActiveTab('rejected')}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition ml-4"
              style={{
                backgroundColor: activeTab === 'rejected'
                  ? '#A3464D22' : 'transparent',
                color: activeTab === 'rejected' ? '#A3464D' : '#6b7280'
              }}>
              <AlertCircle size={14} />
              <span>Rejected Listings</span>
              {rejectedProducts.length > 0 && (
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: '#A3464D', color: '#fff' }}>
                  {rejectedProducts.length}
                </span>
              )}
            </button>

            <SidebarBtn
              tab="orders"
              icon={CheckCircle}
              label="Orders to Fulfill"
            />
          </div>

          <div className="my-4" style={{ borderTop: '1px solid #f0ebe0' }} />

          <Link
            to="/sell"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:opacity-80"
            style={{ color: '#1D5D5D' }}>
            <PlusCircle size={16} />
            Create New Listing
          </Link>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1">

          {/* YOUR LISTINGS */}
          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Your Listings
                </h1>
                <Link
                  to="/sell"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold"
                  style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                  <PlusCircle size={14} />
                  New Listing
                </Link>
              </div>

              {loading ? (
                <EmptyState icon={Package} title="Loading your listings..." />
              ) : activeProducts.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="You have no listings yet."
                  action={
                    <Link
                      to="/sell"
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
                      <PlusCircle size={14} />
                      Create your first listing!
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {activeProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={() => navigate(`/product/${product.id}`)}
                      onEdit={() => {
                        setEditProduct(product)
                        setIsResubmit(false)
                      }}
                      onDelete={() => setDeleteConfirm(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REJECTED LISTINGS */}
          {activeTab === 'rejected' && (
            <div>
              <h1
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                Rejected Listings
              </h1>

              {rejectedProducts.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No rejected listings!"
                  subtitle="All your listings are in good standing."
                />
              ) : (
                <div className="space-y-4">
                  {rejectedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showRejectionBanner
                      onView={() => navigate(`/product/${product.id}`)}
                      onResubmit={() => {
                        setEditProduct(product)
                        setIsResubmit(true)
                      }}
                      onDelete={() => setDeleteConfirm(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS TO FULFILL — uses separate component */}
          {activeTab === 'orders' && <OrdersTab />}
        </div>
      </div>

      <Footer />
    </div>
  )
}