import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import StatusBadge from '../components/ui/StatusBadge'
import ProductImage from '../components/ui/ProductImage'
import { MessageCircle, ShoppingCart, Zap, Share2 } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  // Get current user email from localStorage
  const userEmail = localStorage.getItem('userEmail')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`)
      setProduct(res.data.data?.product)
    } catch (err) {
      console.error('Failed to fetch product', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="text-center py-20">
        <p style={{ color: '#421C3B' }}>Loading product...</p>
      </div>
      <Footer />
    </div>
  )

  if (!product) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="text-center py-20">
        <p className="text-lg font-bold mb-4" style={{ color: '#421C3B' }}>
          Product not found.
        </p>
        <button onClick={() => navigate('/marketplace')}
          className="px-6 py-2 rounded-lg text-sm font-bold"
          style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
          Back to Marketplace
        </button>
      </div>
      <Footer />
    </div>
  )

  // Check if current user is the owner
  const isOwner = token && product.seller &&
    localStorage.getItem('userName') &&
    product.seller.fullName === localStorage.getItem('userName')

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm mb-6 hover:opacity-70 flex items-center gap-1"
          style={{ color: '#1D5D5D' }}>
          ← Back
        </button>

        <div className="flex gap-8">

          {/* Left — Images */}
          <div className="flex-1">

            {/* Main Image */}
            <div className="w-full rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#f5f0e0', height: '420px' }}>
              <ProductImage
                imageUrl={product.imageUrl}
                name={product.name}
                size="lg"
              />
            </div>

            {/* Thumbnail strip */}
            {product.imageUrl && (
              <div className="flex gap-3 mt-3">
                {[0, 1, 2].map((i) => (
                  <div key={i}
                    onClick={() => setActiveImage(i)}
                    className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2"
                    style={{
                      borderColor: activeImage === i ? '#B28E3A' : 'transparent',
                      backgroundColor: '#f5f0e0'
                    }}>
                    <ProductImage
                      imageUrl={product.imageUrl}
                      name={product.name}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Public Discussion */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                <MessageCircle size={16} color="#421C3B" />
                Public Discussion
              </h3>

              {/* Empty state */}
              <div className="text-center py-6 mb-4">
                <MessageCircle size={32} className="mx-auto mb-2" color="#ddd" />
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  No comments yet. Be the first to ask!
                </p>
              </div>

              {/* Message Input — only for non-owners */}
              {!isOwner && token && (
                <div className="flex items-center gap-3 border rounded-xl px-4 py-2"
                  style={{ borderColor: '#ddd' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                    {localStorage.getItem('userName')?.charAt(0) || 'U'}
                  </div>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about availability, condition, etc..."
                    className="flex-1 text-sm focus:outline-none bg-transparent"
                  />
                  <button style={{ color: '#1D5D5D' }}>
                    <Share2 size={16} />
                  </button>
                </div>
              )}

              {!token && (
                <p className="text-xs text-center mt-2" style={{ color: '#9ca3af' }}>
                  <span
                    className="cursor-pointer hover:underline"
                    style={{ color: '#B28E3A' }}
                    onClick={() => navigate('/login')}>
                    Login
                  </span> to join the discussion
                </p>
              )}
            </div>
          </div>

          {/* Right — Details Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm">

              {/* Title & Share */}
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-xl font-bold leading-tight flex-1 mr-2"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  {product.name}
                </h1>
                <button className="hover:opacity-70" style={{ color: '#9ca3af' }}>
                  <Share2 size={18} />
                </button>
              </div>

              {/* Price */}
              <p className="text-2xl font-bold mt-1" style={{ color: '#421C3B' }}>
                ₱{product.price}
              </p>

              {/* Category & Status */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded font-bold tracking-wide"
                  style={{ backgroundColor: '#E8E4C9', color: '#1D5D5D' }}>
                  {product.category?.toUpperCase()}
                </span>
                <StatusBadge status={product.status} />
                <span className="text-xs" style={{ color: '#9ca3af' }}>
                  • Listed recently
                </span>
              </div>

              {/* Owner notice */}
              {isOwner && (
                <div className="mt-4 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#1D5D5D22', color: '#1D5D5D' }}>
                  🏪 This is your listing. Manage it from your dashboard.
                </div>
              )}

              {/* Quantity — only for non-owners */}
              {!isOwner && (
                <div className="mt-4">
                  <label className="text-xs font-bold"
                    style={{ color: '#421C3B' }}>
                    Quantity (1-{product.stock})
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                    style={{ borderColor: '#ddd' }}>
                    {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwner && (
                <div className="mt-4 space-y-3">
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                    <MessageCircle size={16} />
                    Message Seller
                  </button>
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#421C3B', color: '#fff' }}>
                    <Zap size={16} />
                    Buy Now
                  </button>
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#421C3B', color: '#fff' }}>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              )}

              {/* Owner action buttons */}
              {isOwner && (
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 rounded-xl font-bold text-sm"
                    style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                    Manage in Dashboard
                  </button>
                </div>
              )}

              <hr className="my-4" style={{ borderColor: '#f0ebe0' }} />

              {/* Details */}
              <div>
                <h3 className="font-bold text-sm mb-2"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Details
                </h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  {product.description || 'No description provided.'}
                </p>
              </div>

              <hr className="my-4" style={{ borderColor: '#f0ebe0' }} />

              {/* Product Specs */}
              <div>
                <h3 className="font-bold text-sm mb-3"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Product Specifications
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Category:</span>
                    <span className="font-medium" style={{ color: '#421C3B' }}>
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Availability:</span>
                    <span className="font-medium"
                      style={{ color: product.stock > 0 ? '#6F803C' : '#A3464D' }}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Stock:</span>
                    <span className="font-medium" style={{ color: '#421C3B' }}>
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Status:</span>
                    <StatusBadge status={product.status} />
                  </div>
                </div>
              </div>

              <hr className="my-4" style={{ borderColor: '#f0ebe0' }} />

              {/* Seller Info */}
              {product.seller && (
                <div>
                  <h3 className="font-bold text-sm mb-3"
                    style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                    Seller Information
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                        {product.seller.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#421C3B' }}>
                          {product.seller.fullName}
                          {isOwner && (
                            <span className="ml-2 text-xs font-normal"
                              style={{ color: '#1D5D5D' }}>(You)</span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: '#B28E3A' }}>
                          ⭐ Verified Student
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs"
                    style={{ color: '#9ca3af' }}>
                    <span>◎ VERIFIED STUDENT</span>
                    <span>◎ SECURE TRADE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}