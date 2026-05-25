import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../shared/api/axios'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import { CheckCircle, QrCode, MapPin, Clock, Package, AlertCircle } from 'lucide-react'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    // PayMongo redirects back with ?reference_number=ORDER-XXXX
    // or we can get it from localStorage if we saved it before redirecting
    const referenceNumber = searchParams.get('reference_number')
      || localStorage.getItem('pendingOrderNumber')

    if (!referenceNumber) {
      setError('Could not find your order. Please check My Orders.')
      setLoading(false)
      return
    }

    fetchOrder(referenceNumber)
  }, [])

  const fetchOrder = async (orderNumber) => {
    try {
      const res = await api.get(`/orders/number/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const fetchedOrder = res.data.data?.order
      setOrder(fetchedOrder)

      // Mark as PAID if still PENDING (PayMongo confirmed payment)
      if (fetchedOrder && fetchedOrder.status === 'PENDING') {
        await api.put(`/orders/${fetchedOrder.orderId}/status`,
          { status: 'PAID' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setOrder(prev => ({ ...prev, status: 'PAID' }))
      }

      // Clear the pending order number
      localStorage.removeItem('pendingOrderNumber')
    } catch (err) {
      console.error('Failed to fetch order', err)
      setError('Could not load your order. Please check My Orders.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Package size={40} color="#B28E3A" className="mx-auto mb-3" />
          <p style={{ color: '#421C3B' }}>Loading your order...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (error) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <AlertCircle size={48} className="mx-auto mb-4" color="#A3464D" />
          <h1 className="text-xl font-bold mb-2" style={{ color: '#421C3B' }}>
            Something went wrong
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>{error}</p>
          <button onClick={() => navigate('/my-orders')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
            View My Orders
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">

          {/* Success header */}
          <div className="text-center mb-6">
            <CheckCircle size={56} className="mx-auto mb-4" color="#6F803C" />
            <h1 className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
              Payment Successful!
            </h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Your payment has been confirmed.
            </p>
            <p className="font-bold text-lg mt-2" style={{ color: '#1D5D5D' }}>
              {order?.orderNumber}
            </p>
          </div>

          {/* Order summary */}
          <div className="rounded-xl p-4 mb-5"
            style={{ backgroundColor: '#f9f7f2', border: '1px solid #e5e0d4' }}>
            <p className="text-xs font-bold mb-3" style={{ color: '#9ca3af' }}>ORDER SUMMARY</p>
            {order?.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-2">
                <span style={{ color: '#6b7280' }}>
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium" style={{ color: '#421C3B' }}>
                  ₱{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2"
              style={{ borderTop: '1px solid #e5e0d4' }}>
              <span style={{ color: '#421C3B' }}>Total Paid</span>
              <span style={{ color: '#B28E3A' }}>₱{order?.totalAmount}</span>
            </div>
          </div>

          {/* Meet-up details */}
          {(order?.meetupLocation || order?.meetupTime) && (
            <div className="rounded-xl p-4 mb-5"
              style={{ backgroundColor: '#1D5D5D11', border: '1px solid #1D5D5D33' }}>
              <p className="text-sm font-bold mb-2" style={{ color: '#1D5D5D' }}>
                📍 Meet-up Details
              </p>
              {order?.meetupLocation && (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <MapPin size={13} color="#1D5D5D" />
                  <span style={{ color: '#6b7280' }}>Location:</span>
                  <span className="font-medium" style={{ color: '#421C3B' }}>
                    {order.meetupLocation}
                  </span>
                </div>
              )}
              {order?.meetupTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={13} color="#1D5D5D" />
                  <span style={{ color: '#6b7280' }}>Time:</span>
                  <span className="font-medium" style={{ color: '#421C3B' }}>
                    {new Date(order.meetupTime).toLocaleString([], {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* QR Code — shown for ALL orders */}
          {order?.qrCodeUrl ? (
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode size={16} color="#421C3B" />
                <p className="text-sm font-bold" style={{ color: '#421C3B' }}>
                  Your Meet-Up QR Code
                </p>
              </div>
              <p className="text-xs mb-4" style={{ color: '#6b7280' }}>
                Show this QR code to the seller when you meet up to receive your item.
                The seller will scan it to confirm the handover.
              </p>
              <div className="flex justify-center">
                <img
                  src={order.qrCodeUrl}
                  alt="Meet-up QR Code"
                  className="w-52 h-52 rounded-xl"
                  style={{ border: '2px solid #B28E3A' }}
                />
              </div>
              <p className="text-xs mt-3 font-medium" style={{ color: '#6F803C' }}>
                ✅ Screenshot or save this QR code!
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl text-center text-sm"
              style={{ backgroundColor: '#f9f7f2', color: '#6b7280' }}>
              QR code will appear in My Orders once generated.
            </div>
          )}

          {/* What happens next */}
          <div className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: '#6F803C11', border: '1px solid #6F803C33' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#6F803C' }}>
              WHAT HAPPENS NEXT
            </p>
            <ol className="text-xs space-y-1.5" style={{ color: '#6b7280' }}>
              <li>1. ✅ Payment confirmed — your order is now <strong>PAID</strong></li>
              <li>2. 📍 Meet the seller at the location and time above</li>
              <li>3. 📱 Show the seller your QR code above</li>
              <li>4. 🔍 Seller scans the QR to confirm item handover</li>
              <li>5. ✓ Order marked <strong>COMPLETED</strong> — you're done!</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/my-orders')}
              className="flex-1 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
              View My Orders
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 py-3 rounded-xl text-sm font-bold border"
              style={{ borderColor: '#1D5D5D', color: '#1D5D5D' }}>
              Back to Market
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}