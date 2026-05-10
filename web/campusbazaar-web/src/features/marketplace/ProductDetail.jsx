import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../shared/api/axios'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import {
  MessageCircle, ShoppingCart, Zap,
  Share2, Send, Package, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyText, setReplyText] = useState({})
  const [showReplyFor, setShowReplyFor] = useState(null)

  const userName = localStorage.getItem('userName')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`)
      setProduct(res.data.data?.product)
      setActiveImage(0)
    } catch (err) {
      console.error('Failed to fetch product', err)
    } finally {
      setLoading(false)
    }
  }

  const isOwner = token && product?.seller &&
    product.seller.fullName === userName
  const isActive = product?.status === 'ACTIVE'
  const isPending = product?.status === 'PENDING_APPROVAL'
  const isRejected = product?.status === 'REJECTED'

  // Build image list
  const imageUrls = product?.imageUrls?.length > 0
    ? product.imageUrls
    : product?.imageUrl && product.imageUrl !== ''
      ? [product.imageUrl]
      : []

  const prevImage = () =>
    setActiveImage(i => (i === 0 ? imageUrls.length - 1 : i - 1))

  const nextImage = () =>
    setActiveImage(i => (i === imageUrls.length - 1 ? 0 : i + 1))

  const handleAddComment = () => {
    if (!newComment.trim()) return
    setComments(prev => [...prev, {
      id: Date.now(),
      author: userName || 'Anonymous',
      text: newComment,
      isOwner: false,
      timestamp: new Date().toLocaleDateString(),
      replies: []
    }])
    setNewComment('')
  }

  const handleReply = (commentId) => {
    const text = replyText[commentId]
    if (!text?.trim()) return
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? {
            ...c, replies: [...c.replies, {
              id: Date.now(),
              author: userName || 'Anonymous',
              text,
              isOwner: true,
              timestamp: new Date().toLocaleDateString()
            }]
          }
        : c
    ))
    setReplyText(prev => ({ ...prev, [commentId]: '' }))
    setShowReplyFor(null)
  }

  if (loading) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Package size={40} className="mx-auto mb-3" color="#B28E3A" />
          <p style={{ color: '#421C3B' }}>Loading product...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (!product) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="text-center py-20">
        <Package size={40} className="mx-auto mb-4" color="#B28E3A" />
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

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="text-sm mb-6 hover:opacity-70 flex items-center gap-1"
          style={{ color: '#1D5D5D' }}>
          ← Back to Marketplace
        </button>

        {/* Owner banners */}
        {isOwner && isPending && (
          <div className="mb-4 px-5 py-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: '#B28E3A22', border: '1px solid #B28E3A44' }}>
            <AlertCircle size={18} color="#B28E3A" />
            <p className="text-sm font-medium" style={{ color: '#B28E3A' }}>
              Your listing is pending admin approval.
              It will appear in the marketplace once approved.
            </p>
          </div>
        )}

        {isOwner && isRejected && (
          <div className="mb-4 px-5 py-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: '#A3464D22', border: '1px solid #A3464D44' }}>
            <AlertCircle size={18} color="#A3464D" />
            <p className="text-sm font-medium" style={{ color: '#A3464D' }}>
              Your listing was rejected. Go to your dashboard to edit and resubmit.
            </p>
          </div>
        )}

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex gap-0">

            {/* ── LEFT — Shopee-style Image Viewer ── */}
            <div className="w-96 flex-shrink-0 p-6"
              style={{ borderRight: '1px solid #f0ebe0' }}>

              {/* Main Image with arrows */}
              <div className="relative w-full rounded-xl overflow-hidden group"
                style={{ backgroundColor: '#f5f0e0', height: '380px' }}>
                {imageUrls.length > 0 ? (
                  <img
                    src={imageUrls[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={60} color="#B28E3A" />
                  </div>
                )}

                {/* Arrow navigation — only if multiple images */}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                      <ChevronRight size={16} />
                    </button>

                    {/* Image counter */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                      {activeImage + 1}/{imageUrls.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails row — only if more than 1 image */}
              {imageUrls.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition"
                      style={{
                        border: activeImage === i
                          ? '2px solid #B28E3A'
                          : '2px solid transparent',
                        backgroundColor: '#f5f0e0',
                        opacity: activeImage === i ? 1 : 0.6
                      }}>
                      <img
                        src={url}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT — Product Details ── */}
            <div className="flex-1 p-8">

              {/* Category + Status */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs px-2 py-1 rounded font-bold tracking-wide"
                  style={{ backgroundColor: '#E8E4C9', color: '#1D5D5D' }}>
                  {product.category?.toUpperCase()}
                </span>
                <StatusBadge status={product.status} />
              </div>

              {/* Title + Share */}
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-2xl font-bold leading-tight flex-1 mr-4"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  {product.name}
                </h1>
                <button className="hover:opacity-70 flex-shrink-0"
                  style={{ color: '#9ca3af' }}>
                  <Share2 size={20} />
                </button>
              </div>

              {/* Price */}
              <div className="py-4 px-5 rounded-xl mb-4"
                style={{ backgroundColor: '#f9f7f2' }}>
                <p className="text-3xl font-bold" style={{ color: '#B28E3A' }}>
                  ₱{Number(product.price).toFixed(2)}
                </p>
              </div>

              {/* Owner badge */}
              {isOwner && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                  style={{ backgroundColor: '#1D5D5D22', color: '#1D5D5D' }}>
                  🏪 This is your listing
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-bold text-sm mb-2"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Description
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-sm mb-6"
                style={{ borderTop: '1px solid #f0ebe0', paddingTop: '16px' }}>
                <div className="flex gap-2">
                  <span className="w-28 flex-shrink-0" style={{ color: '#9ca3af' }}>
                    Stock
                  </span>
                  <span className="font-medium" style={{ color: '#421C3B' }}>
                    {product.stock} units
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-28 flex-shrink-0" style={{ color: '#9ca3af' }}>
                    Availability
                  </span>
                  <span className="font-medium"
                    style={{ color: product.stock > 0 ? '#6F803C' : '#A3464D' }}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-28 flex-shrink-0" style={{ color: '#9ca3af' }}>
                    Category
                  </span>
                  <span className="font-medium" style={{ color: '#421C3B' }}>
                    {product.category}
                  </span>
                </div>
                {product.seller && (
                  <div className="flex gap-2">
                    <span className="w-28 flex-shrink-0" style={{ color: '#9ca3af' }}>
                      Seller
                    </span>
                    <span className="font-medium" style={{ color: '#421C3B' }}>
                      {product.seller.fullName}
                      {isOwner && (
                        <span className="ml-1 text-xs" style={{ color: '#1D5D5D' }}>
                          (You)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity — non-owner + active + in stock */}
              {!isOwner && isActive && product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-bold w-28"
                    style={{ color: '#421C3B' }}>
                    Quantity
                  </span>
                  <div className="flex items-center border rounded-lg overflow-hidden"
                    style={{ borderColor: '#ddd' }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50"
                      style={{ color: '#421C3B' }}>
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-bold"
                      style={{ color: '#421C3B' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q =>
                        Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50"
                      style={{ color: '#421C3B' }}>
                      +
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>
                    {product.stock} available
                  </span>
                </div>
              )}

              {/* Action Buttons — non-owner + active */}
              {!isOwner && isActive && (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/checkout/${product.id}?qty=${quantity}`)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                    <Zap size={16} />
                    Buy Now
                  </button>
                  <button
                    className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2"
                    style={{ borderColor: '#1D5D5D', color: '#1D5D5D' }}>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    className="px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center border-2"
                    style={{ borderColor: '#421C3B', color: '#421C3B' }}>
                    <MessageCircle size={16} />
                  </button>
                </div>
              )}

              {/* Not available notice */}
              {!isOwner && !isActive && (
                <div className="px-4 py-3 rounded-xl text-sm text-center"
                  style={{ backgroundColor: '#f9f7f2', color: '#9ca3af' }}>
                  This item is not available for purchase.
                </div>
              )}

              {/* Owner buttons */}
              {isOwner && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                  Manage in Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SELLER INFO CARD ── */}
        {product.seller && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
                style={{
                  backgroundColor: isOwner ? '#B28E3A' : '#1D5D5D',
                  color: '#fff'
                }}>
                {product.seller.fullName?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold" style={{ color: '#421C3B' }}>
                  {product.seller.fullName}
                  {isOwner && (
                    <span className="ml-2 text-xs font-normal"
                      style={{ color: '#1D5D5D' }}>(You)</span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#B28E3A' }}>
                  ⭐ Verified Student Seller
                </p>
              </div>
              <div className="flex gap-6 text-xs" style={{ color: '#9ca3af' }}>
                <span>◎ VERIFIED</span>
                <span>◎ SECURE TRADE</span>
              </div>
            </div>
          </div>
        )}

        {/* ── PUBLIC DISCUSSION ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            <MessageCircle size={16} color="#421C3B" />
            Public Discussion
          </h3>

          {!isActive ? (
            <div className="text-center py-8 rounded-xl"
              style={{ backgroundColor: '#f9f7f2' }}>
              <MessageCircle size={32} className="mx-auto mb-2" color="#ddd" />
              <p className="font-medium text-sm mb-1" style={{ color: '#421C3B' }}>
                Discussion Not Available
              </p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                {isPending
                  ? 'This listing is pending approval. Discussion opens once approved.'
                  : 'This listing is not currently active.'}
              </p>
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="text-center py-6 mb-4">
                  <MessageCircle size={32} className="mx-auto mb-2" color="#ddd" />
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    No comments yet. Be the first to ask!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: comment.isOwner ? '#B28E3A' : '#1D5D5D',
                          color: '#fff'
                        }}>
                        {comment.author?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold"
                            style={{ color: '#421C3B' }}>
                            {comment.author}
                          </span>
                          {comment.isOwner && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                              style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                              SELLER
                            </span>
                          )}
                          <span className="text-xs" style={{ color: '#9ca3af' }}>
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: '#421C3B' }}>
                          {comment.text}
                        </p>
                        {isOwner && (
                          <button
                            onClick={() => setShowReplyFor(
                              showReplyFor === comment.id ? null : comment.id
                            )}
                            className="text-xs mt-1 hover:opacity-70 font-medium"
                            style={{ color: '#1D5D5D' }}>
                            ↩ Reply
                          </button>
                        )}
                        {showReplyFor === comment.id && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={replyText[comment.id] || ''}
                              onChange={e => setReplyText(prev => ({
                                ...prev, [comment.id]: e.target.value
                              }))}
                              onKeyDown={e =>
                                e.key === 'Enter' && handleReply(comment.id)}
                              placeholder="Write a reply as seller..."
                              className="flex-1 px-3 py-1.5 border rounded-lg text-xs focus:outline-none"
                              style={{ borderColor: '#B28E3A44' }}
                            />
                            <button onClick={() => handleReply(comment.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                              Send
                            </button>
                          </div>
                        )}
                        {comment.replies?.length > 0 && (
                          <div className="mt-3 space-y-2 pl-4"
                            style={{ borderLeft: '2px solid #f0ebe0' }}>
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="flex gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                                  {reply.author?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 px-3 py-2 rounded-xl"
                                  style={{ backgroundColor: '#B28E3A11' }}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold"
                                      style={{ color: '#421C3B' }}>
                                      {reply.author}
                                    </span>
                                    <span className="text-xs px-1 py-0.5 rounded font-bold"
                                      style={{
                                        backgroundColor: '#B28E3A',
                                        color: '#fff',
                                        fontSize: '9px'
                                      }}>
                                      SELLER
                                    </span>
                                    <span className="text-xs"
                                      style={{ color: '#9ca3af' }}>
                                      {reply.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-xs" style={{ color: '#421C3B' }}>
                                    {reply.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isOwner && token && (
                <div className="flex items-center gap-3 border rounded-xl px-4 py-2"
                  style={{ borderColor: '#ddd' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                    {userName?.charAt(0) || 'U'}
                  </div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Ask about availability, condition, etc..."
                    className="flex-1 text-sm focus:outline-none bg-transparent"
                  />
                  <button onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    style={{ color: '#1D5D5D' }}>
                    <Send size={16} />
                  </button>
                </div>
              )}

              {!token && (
                <p className="text-xs text-center mt-2" style={{ color: '#9ca3af' }}>
                  <span className="cursor-pointer hover:underline"
                    style={{ color: '#B28E3A' }}
                    onClick={() => navigate('/login')}>
                    Login
                  </span>{' '}
                  to join the discussion
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}