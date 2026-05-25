import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../shared/api/axios'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import { Clock, CheckCircle, ExternalLink, QrCode, MapPin } from 'lucide-react'

export default function PaymentWaiting() {
  const navigate = useNavigate()
  const location = useLocation()
  const { checkoutUrl, orderNumber } = location.state || {}

  const [status, setStatus] = useState('PENDING')
  const [order, setOrder] = useState(null)
  const [dots, setDots] = useState('')
  const intervalRef = useRef(null)
  const token = localStorage.getItem('token')

  // Animate dots
  useEffect(() => {
    const d = setInterval(() => {
      setDots(p => p.length >= 3 ? '' : p + '.')
    }, 500)
    return () => clearInterval(d)
  }, [])

  // Poll every 3 seconds for payment confirmation
  useEffect(() => {
    if (!orderNumber) return

    // Open PayMongo in new tab immediately
    window.open(checkoutUrl, '_blank')

    const poll = async () => {
      try {
        const res = await api.get(`/orders/number/${orderNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const o = res.data.data?.order
        setOrder(o)
        setStatus(o?.status)

        if (o?.status === 'PAID' || o?.status === 'COMPLETED') {
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        console.error('Poll error', err)
      }
    }

    poll() // immediate first check
    intervalRef.current = setInterval(poll, 3000)
    return () => clearInterval(intervalRef.current)
  }, [orderNumber])

  // When paid — show success screen
  const isPaid = status === 'PAID' || status === 'FULFILLED' || status === 'COMPLETED'

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">

          {!isPaid ? (
            /* ── WAITING STATE ── */
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: '#B28E3A22' }}>
                <Clock size={40} color="#B28E3A" />
              </div>

              <h1 className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                Waiting for Payment{dots}
              </h1>
              <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
                Complete your payment in the PayMongo tab that just opened.
              </p>
              <p className="font-bold mb-6" style={{ color: '#1D5D5D' }}>
                {orderNumber}
              </p>

              {/* Animated pulse */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: '#B28E3A', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: '#B28E3A', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: '#B28E3A', animationDelay: '300ms' }} />
              </div>

              <div className="p-4 rounded-xl mb-6 text-left"
                style={{ backgroundColor: '#f9f7f2', border: '1px solid #e5e0d4' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#421C3B' }}>
                  HOW TO COMPLETE:
                </p>
                <ol className="text-xs space-y-1.5" style={{ color: '#6b7280' }}>
                  <li>1. Go to the PayMongo tab that opened</li>
                  <li>2. Scan the QR to pay for your order</li>
                  <li>3. This page will automatically update ✨</li>
                </ol>
              </div>

              <button
                onClick={() => window.open(checkoutUrl, '_blank')}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-3"
                style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                <ExternalLink size={16} />
                Open PayMongo Again
              </button>

              <button
                onClick={() => navigate('/my-orders')}
                className="text-xs" style={{ color: '#9ca3af' }}>
                Cancel — View My Orders
              </button>
            </div>
          ) : (
            /* ── PAID STATE ── */
            <div>
              <div className="text-center mb-6">
                <CheckCircle size={56} className="mx-auto mb-4" color="#6F803C" />
                <h1 className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Payment Confirmed! 🎉
                </h1>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Show this QR code to the seller when you meet up.
                </p>
                <p className="font-bold text-lg mt-2" style={{ color: '#1D5D5D' }}>
                  {order?.orderNumber}
                </p>
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

              {/* QR Code */}
              {order?.qrCodeUrl && (
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <QrCode size={16} color="#421C3B" />
                    <p className="text-sm font-bold" style={{ color: '#421C3B' }}>
                      Your Meet-Up QR Code
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <img src={order.qrCodeUrl} alt="Meet-up QR Code"
                      className="w-52 h-52 rounded-xl"
                      style={{ border: '2px solid #B28E3A' }} />
                  </div>
                  <p className="text-xs mt-3 font-medium" style={{ color: '#6F803C' }}>
                    ✅ Screenshot or save this QR code!
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => navigate('/my-orders')}
                  className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                  View My Orders
                </button>
                <button onClick={() => navigate('/marketplace')}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border"
                  style={{ borderColor: '#1D5D5D', color: '#1D5D5D' }}>
                  Back to Market
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}