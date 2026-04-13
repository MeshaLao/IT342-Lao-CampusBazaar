import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Footer from '../components/layout/Footer'
import StatusBadge from '../components/ui/StatusBadge'
import ProductImage from '../components/ui/ProductImage'
import {
  LayoutDashboard, Clock, Package, ShoppingBag,
  Users, Eye, Trash2, CheckCircle, XCircle,
  Search, ShieldCheck, LogOut, TrendingUp
} from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [pendingProducts, setPendingProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingCount: 0,
    totalOrders: 0,
    totalUsers: 0,
    approvedCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [expandedProduct, setExpandedProduct] = useState(null)
  const [rejectReasons, setRejectReasons] = useState({})
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [productSearch, setProductSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('All')

  const userName = localStorage.getItem('userName')
  const userRole = localStorage.getItem('userRole')

  useEffect(() => {
    if (userRole !== 'ADMIN') {
      navigate('/admin/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [pendingRes, allRes, statsRes, usersRes] = await Promise.all([
        api.get('/admin/products/pending', { headers }),
        api.get('/admin/products/all', { headers }),
        api.get('/admin/stats', { headers }),
        api.get('/admin/users', { headers })
      ])

      setPendingProducts(pendingRes.data.data?.products || [])
      setAllProducts(allRes.data.data?.products || [])
      setAllUsers(usersRes.data.data?.users || [])

      const s = statsRes.data.data
      setStats({
        totalProducts: s?.totalProducts || 0,
        pendingCount: s?.pendingCount || 0,
        totalOrders: s?.totalOrders || 0,
        totalUsers: s?.totalUsers || 0,
        approvedCount: s?.approvedCount || 0
      })
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleApprove = async (productId) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.put(`/admin/products/${productId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExpandedProduct(null)
      await fetchData()
      showMessage('Product approved! It is now live in the marketplace. ✅', 'success')
    } catch (err) {
      showMessage('Failed to approve product.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (productId) => {
    const reason = rejectReasons[productId]
    if (!reason?.trim()) {
      showMessage('Please provide a rejection reason.', 'error')
      return
    }
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.put(`/admin/products/${productId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setExpandedProduct(null)
      setRejectReasons(prev => ({ ...prev, [productId]: '' }))
      await fetchData()
      showMessage('Product rejected. Seller has been notified. ❌', 'error')
    } catch (err) {
      showMessage('Failed to reject product.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      await api.put(`/admin/products/${productId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchData()
      showMessage('Product deactivated successfully.', 'success')
    } catch (err) {
      showMessage('Failed to deactivate product.', 'error')
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Approvals', icon: Clock, badge: stats.pendingCount },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
  ]

  const orderStatuses = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled']

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#6F803C22', text: '#6F803C', label: 'approved' }
      case 'PENDING_APPROVAL': return { bg: '#B28E3A22', text: '#B28E3A', label: 'pending' }
      case 'REJECTED': return { bg: '#A3464D22', text: '#A3464D', label: 'rejected' }
      case 'DEACTIVATED': return { bg: '#6b728022', text: '#6b7280', label: 'deactivated' }
      default: return { bg: '#6b728022', text: '#6b7280', label: status }
    }
  }

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>

      {/* Admin Top Navbar */}
      <div style={{ backgroundColor: '#1D5D5D', borderBottom: '3px solid #B28E3A' }}>
        <div className="max-w-7xl mx-auto px-8 py-4">

          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#B28E3A' }}>
                <ShieldCheck size={20} color="#421C3B" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight"
                  style={{ color: '#B28E3A', fontFamily: 'Georgia, serif' }}>
                  Admin Dashboard
                </h1>
                <p className="text-xs" style={{ color: '#E8E4C9' }}>
                  Welcome back, {userName}
                </p>
              </div>
            </div>

            <button
              onClick={() => { localStorage.clear(); navigate('/admin/login') }}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-80"
              style={{ color: '#E8E4C9', border: '1px solid #2a7a7a' }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition"
                style={{
                  backgroundColor: activeTab === item.id ? '#B28E3A' : 'rgba(255,255,255,0.1)',
                  color: activeTab === item.id ? '#421C3B' : '#E8E4C9'
                }}>
                <item.icon size={14} />
                {item.label}
                {item.badge > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: '#A3464D', color: '#fff' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Message Banner */}
        {message.text && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: message.type === 'success' ? '#6F803C22' : '#A3464D22',
              color: message.type === 'success' ? '#6F803C' : '#A3464D'
            }}>
            {message.text}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: 'TOTAL PRODUCTS',
                  value: stats.totalProducts,
                  sub: `${stats.approvedCount} approved`,
                  subColor: '#6F803C',
                  icon: Package,
                  iconColor: '#1D5D5D'
                },
                {
                  label: 'PENDING APPROVALS',
                  value: stats.pendingCount,
                  sub: 'Require review',
                  subColor: '#6b7280',
                  icon: Clock,
                  iconColor: '#B28E3A'
                },
                {
                  label: 'TOTAL ORDERS',
                  value: stats.totalOrders,
                  sub: 'All time',
                  subColor: '#6b7280',
                  icon: ShoppingBag,
                  iconColor: '#421C3B'
                },
                {
                  label: 'TOTAL USERS',
                  value: stats.totalUsers,
                  sub: `${stats.totalUsers} active`,
                  subColor: '#6F803C',
                  icon: Users,
                  iconColor: '#6F803C'
                },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold tracking-widest"
                      style={{ color: '#9ca3af' }}>
                      {stat.label}
                    </p>
                    <stat.icon size={20} color={stat.iconColor} />
                  </div>
                  <p className="text-3xl font-bold mb-1" style={{ color: '#421C3B' }}>
                    {loading ? '...' : stat.value}
                  </p>
                  <p className="text-xs font-medium" style={{ color: stat.subColor }}>
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Pending Approvals */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Recent Pending Approvals
                </h2>
                {pendingProducts.length > 0 && (
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="text-xs font-bold hover:opacity-80"
                    style={{ color: '#1D5D5D' }}>
                    View All ({pendingProducts.length}) →
                  </button>
                )}
              </div>

              {loading ? (
                <p className="text-center py-8" style={{ color: '#9ca3af' }}>
                  Loading...
                </p>
              ) : pendingProducts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={32} className="mx-auto mb-2" color="#6F803C" />
                  <p style={{ color: '#6b7280' }}>No pending approvals! All caught up.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingProducts.slice(0, 3).map(product => (
                    <div key={product.id}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ backgroundColor: '#f9f7f2' }}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: '#f5f0e0' }}>
                        <ProductImage
                          imageUrl={product.imageUrl}
                          name={product.name}
                          size="sm"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: '#421C3B' }}>
                          {product.name}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          By {product.seller?.fullName} •{' '}
                          {product.createdAt?.split('T')[0] || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('pending')
                          setExpandedProduct(product.id)
                        }}
                        className="text-xs px-4 py-2 rounded-lg font-bold"
                        style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && (
          <div>
            <h2 className="font-bold text-xl mb-1"
              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
              Pending Product Approvals ({pendingProducts.length})
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Review listings before they go live in the marketplace.
            </p>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p style={{ color: '#9ca3af' }}>Loading...</p>
              </div>
            ) : pendingProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <CheckCircle size={40} className="mx-auto mb-3" color="#6F803C" />
                <p className="font-medium" style={{ color: '#421C3B' }}>
                  All caught up! No pending listings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map(product => (
                  <div key={product.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    {/* Product Info */}
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: '#f5f0e0' }}>
                        <ProductImage
                          imageUrl={product.imageUrl}
                          name={product.name}
                          size="md"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-base"
                              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                              {product.name}
                            </h3>
                            <p className="text-lg font-bold mt-1"
                              style={{ color: '#421C3B' }}>
                              ₱{product.price}
                            </p>
                            {product.description && (
                              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                                {product.description}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={product.status} />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>Seller:</p>
                            <p className="text-sm font-bold" style={{ color: '#421C3B' }}>
                              {product.seller?.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>Category:</p>
                            <p className="text-sm font-bold" style={{ color: '#421C3B' }}>
                              {product.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>Stock:</p>
                            <p className="text-sm font-bold" style={{ color: '#421C3B' }}>
                              {product.stock} units
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>Submitted:</p>
                            <p className="text-sm font-bold" style={{ color: '#421C3B' }}>
                              {product.createdAt?.split('T')[0] || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Review Panel */}
                    {expandedProduct === product.id ? (
                      <div className="px-5 pb-5"
                        style={{ borderTop: '1px solid #f0ebe0', paddingTop: '16px' }}>
                        <label className="text-sm font-bold block mb-2"
                          style={{ color: '#421C3B' }}>
                          Rejection Reason (if rejecting):
                        </label>
                        <textarea
                          value={rejectReasons[product.id] || ''}
                          onChange={e => setRejectReasons(prev => ({
                            ...prev, [product.id]: e.target.value
                          }))}
                          placeholder="Explain why this product is being rejected..."
                          rows={3}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none resize-none mb-4"
                          style={{ borderColor: '#ddd', backgroundColor: '#fafafa' }}
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApprove(product.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                            style={{ backgroundColor: '#6F803C', color: '#fff' }}>
                            <CheckCircle size={14} />
                            {actionLoading ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(product.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                            style={{ backgroundColor: '#A3464D', color: '#fff' }}>
                            <XCircle size={14} />
                            {actionLoading ? 'Processing...' : 'Reject'}
                          </button>
                          <button
                            onClick={() => setExpandedProduct(null)}
                            className="px-5 py-2 rounded-lg text-sm"
                            style={{ color: '#6b7280' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pb-5 flex gap-3"
                        style={{ borderTop: '1px solid #f0ebe0', paddingTop: '16px' }}>
                        <button
                          onClick={() => setExpandedProduct(product.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                          style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                          <Eye size={14} />
                          Review Product
                        </button>
                        <button
                          onClick={() => handleApprove(product.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border disabled:opacity-50"
                          style={{ borderColor: '#6F803C', color: '#6F803C' }}>
                          <CheckCircle size={14} />
                          Quick Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4"
                style={{ borderBottom: '1px solid #f0ebe0' }}>
                <h2 className="font-bold text-lg"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  All Products ({allProducts.length})
                </h2>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg"
                  style={{ borderColor: '#ddd' }}>
                  <Search size={14} color="#9ca3af" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="text-sm focus:outline-none w-40"
                    style={{ color: '#421C3B' }}
                  />
                </div>
              </div>

              {allProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={32} className="mx-auto mb-2" color="#ddd" />
                  <p style={{ color: '#6b7280' }}>No products found.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#f9f7f2' }}>
                      {['Product', 'Seller', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-6 py-3 font-bold text-xs"
                          style={{ color: '#6b7280' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts
                      .filter(p =>
                        p.name?.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map(product => {
                        const statusStyle = getStatusColor(product.status)
                        return (
                          <tr key={product.id}
                            style={{ borderTop: '1px solid #f0ebe0' }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                                  style={{ backgroundColor: '#f5f0e0' }}>
                                  <ProductImage
                                    imageUrl={product.imageUrl}
                                    name={product.name}
                                    size="sm"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium" style={{ color: '#421C3B' }}>
                                    {product.name}
                                  </p>
                                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                                    {product.category}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4" style={{ color: '#6b7280' }}>
                              {product.seller?.fullName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 font-medium"
                              style={{ color: '#421C3B' }}>
                              ₱{product.price}
                            </td>
                            <td className="px-6 py-4" style={{ color: '#6b7280' }}>
                              {product.stock}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-1 rounded-full font-bold"
                                style={{
                                  backgroundColor: statusStyle.bg,
                                  color: statusStyle.text
                                }}>
                                {statusStyle.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => navigate(`/product/${product.id}`)}
                                  className="hover:opacity-70"
                                  title="View product">
                                  <Eye size={16} color="#6b7280" />
                                </button>
                                {product.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleDeactivate(product.id)}
                                    className="hover:opacity-70"
                                    title="Deactivate product">
                                    <Trash2 size={16} color="#A3464D" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4"
                style={{ borderBottom: '1px solid #f0ebe0' }}>
                <h2 className="font-bold text-lg"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Order Management
                </h2>
                <div className="flex gap-2">
                  {orderStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition"
                      style={{
                        backgroundColor: orderFilter === status ? '#1D5D5D' : '#f0ebe0',
                        color: orderFilter === status ? '#fff' : '#6b7280'
                      }}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center py-12">
                <ShoppingBag size={40} className="mx-auto mb-3" color="#B28E3A" />
                <p className="font-medium mb-1" style={{ color: '#421C3B' }}>
                  No orders yet
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Orders will appear here once buyers start purchasing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4"
                style={{ borderBottom: '1px solid #f0ebe0' }}>
                <h2 className="font-bold text-lg"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  User Management ({allUsers.length})
                </h2>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg"
                  style={{ borderColor: '#ddd' }}>
                  <Search size={14} color="#9ca3af" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="text-sm focus:outline-none w-40"
                    style={{ color: '#421C3B' }}
                  />
                </div>
              </div>

              {allUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={32} className="mx-auto mb-2" color="#ddd" />
                  <p style={{ color: '#6b7280' }}>No users found.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#f9f7f2' }}>
                      {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-6 py-3 font-bold text-xs"
                          style={{ color: '#6b7280' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter(u =>
                        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email?.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map(user => (
                        <tr key={user.id}
                          style={{ borderTop: '1px solid #f0ebe0' }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                                {user.fullName?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="font-medium" style={{ color: '#421C3B' }}>
                                {user.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4" style={{ color: '#6b7280' }}>
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full font-bold"
                              style={{ backgroundColor: '#1D5D5D22', color: '#1D5D5D' }}>
                              {user.role === 'STUDENT' ? 'Student' : 'Admin'}
                            </span>
                          </td>
                          <td className="px-6 py-4" style={{ color: '#6b7280' }}>
                            {user.createdAt?.split('T')[0] || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full font-bold"
                              style={{ backgroundColor: '#6F803C22', color: '#6F803C' }}>
                              active
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="hover:opacity-70"
                              title="Disable user">
                              <XCircle size={16} color="#A3464D" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}