import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../shared/api/axios'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import SectionCard from '../../shared/components/ui/SectionCard'
import RadioCard from '../../shared/components/ui/RadioCard'
import QuantityPicker from '../../shared/components/ui/QuantityPicker'
import {
  Package, QrCode, CreditCard, CheckCircle,
  AlertCircle, Users, MapPin, Clock, ShieldCheck
} from 'lucide-react'

const MEETUP_LOCATIONS = [
  'Espacio',
  'Wildcats Innovation Lab',
  'Esports Lounge',
  'Study Area',
  'Canteen',
  'Library',
  'Wildcats Lounge'
]

function FieldLabel({ icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-bold mb-2"
      style={{ color: '#421C3B' }}>
      {icon}
      {children}
    </label>
  )
}

function OrderSuccess({ order, navigate }) {
  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">

          <CheckCircle size={56} className="mx-auto mb-4" color="#6F803C" />

          <h1 className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            Order Placed!
          </h1>
          <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Order Number:</p>
          <p className="font-bold text-lg mb-6" style={{ color: '#1D5D5D' }}>
            {order.orderNumber}
          </p>

          {/* Order details */}
          <div className="text-left rounded-xl p-4 mb-6" style={{ backgroundColor: '#f9f7f2' }}>
            {[
              ['Product', order.productName],
              ['Quantity', order.quantity],
              ['Payment', order.paymentMethod === 'MEETUP' ? 'Campus Meet-up (Cash)' : 'Online Payment'],
              order.meetupLocation ? ['Meet-up Location', order.meetupLocation] : null,
              order.meetupTime ? ['Meet-up Time', new Date(order.meetupTime).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })] : null,
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm mb-2">
                <span style={{ color: '#6b7280' }}>{label}</span>
                <span className="font-medium text-right" style={{ color: '#421C3B' }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2"
              style={{ borderTop: '1px solid #f0ebe0' }}>
              <span style={{ color: '#421C3B' }}>Total</span>
              <span style={{ color: '#B28E3A' }}>₱{order.totalAmount}</span>
            </div>
          </div>

          {/* QR Code — shown for MEETUP orders on this screen */}
          {order.paymentMethod === 'MEETUP' && order.qrCodeUrl && (
            <div className="mb-6">
              <p className="text-sm font-bold mb-2" style={{ color: '#421C3B' }}>
                📍 Meet-Up QR Code
              </p>
              <p className="text-xs mb-4" style={{ color: '#6b7280' }}>
                Show this to the seller during your meet-up. They will scan it to confirm the transaction.
              </p>
              <div className="flex justify-center">
                <img
                  src={order.qrCodeUrl}
                  alt="Meet-up QR Code"
                  className="w-48 h-48 rounded-xl"
                  style={{ border: '2px solid #B28E3A' }}
                />
              </div>
              <p className="text-xs mt-3 font-medium" style={{ color: '#6F803C' }}>
                ✅ Save or screenshot this QR code!
              </p>
            </div>
          )}

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

export default function Checkout() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(parseInt(searchParams.get('qty') || '1'))
  const [paymentMethod, setPaymentMethod] = useState('MEETUP')
  const [meetupLocation, setMeetupLocation] = useState('')
  const [meetupTime, setMeetupTime] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchProduct()
    const d = new Date()
    d.setHours(d.getHours() + 1)
    setMeetupTime(d.toISOString().slice(0, 16))
  }, [productId])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${productId}`)
      setProduct(res.data.data?.product)
    } catch {
      setError('Product not found.')
    } finally {
      setLoading(false)
    }
  }

  const total = product ? (Number(product.price) * quantity).toFixed(2) : '0.00'

  const handlePlaceOrder = async () => {
    if (!agreed) { setError('Please agree to the Terms and Conditions.'); return }
    if (!meetupLocation) { setError('Please select a meet-up location.'); return }
    if (!meetupTime) { setError('Please select a meet-up time.'); return }

    setPlacing(true)
    setError('')
    try {
      const body = {
        productId: Number(productId),
        quantity,
        paymentMethod,
        meetupLocation,
        meetupTime
      }

      const res = await api.post('/orders', body, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = res.data.data

      if (paymentMethod === 'PAYMONGO') {
        if (data.checkoutUrl) {
          navigate('/payment/waiting', {
            state: {
              checkoutUrl: data.checkoutUrl,
              orderNumber: data.orderNumber
            }
          })
          return
        }
        setError('Could not get payment link. Please try again.')
        return
      }

      // MEETUP — show success screen with QR
      setOrder(data)
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.data ||
        'Failed to place order. Please try again.'
      )
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <Package size={40} color="#B28E3A" />
      </div>
      <Footer />
    </div>
  )

  if (order) return <OrderSuccess order={order} navigate={navigate} />

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)}
          className="text-sm mb-6 hover:opacity-70 flex items-center gap-1"
          style={{ color: '#1D5D5D' }}>
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
          Checkout
        </h1>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: '#A3464D22', border: '1px solid #A3464D44' }}>
            <AlertCircle size={16} color="#A3464D" />
            <p className="text-sm" style={{ color: '#A3464D' }}>{error}</p>
          </div>
        )}

        <div className="flex gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 space-y-5">

            {/* Product summary */}
            {product && (
              <SectionCard icon={<Package size={16} color="#E8E4C9" />} title="Order Summary">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: '#f5f0e0' }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} color="#B28E3A" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: '#421C3B' }}>{product.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      Seller: {product.seller?.fullName}
                    </p>
                    <p className="text-sm font-bold mt-2" style={{ color: '#B28E3A' }}>
                      ₱{Number(product.price).toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm" style={{ color: '#6b7280' }}>Quantity:</span>
                  <QuantityPicker value={quantity} onChange={setQuantity} max={product.stock} />
                  <span className="text-xs" style={{ color: '#9ca3af' }}>
                    {product.stock} available
                  </span>
                </div>
              </SectionCard>
            )}

            {/* Payment method */}
            <SectionCard icon={<CreditCard size={16} color="#E8E4C9" />} title="Payment Method">
              <div className="space-y-3">
                <RadioCard
                  name="payment"
                  value="MEETUP"
                  checked={paymentMethod === 'MEETUP'}
                  onChange={() => setPaymentMethod('MEETUP')}
                  icon={<Users size={15} color="#1D5D5D" />}
                  label="Campus Meet-up (Cash)"
                  description="Meet the seller on campus and pay in cash. A QR code will be generated for verification."
                  perks="✓ No payment fees · ✓ Meet the seller · ✓ QR verification"
                />
                <RadioCard
                  name="payment"
                  value="PAYMONGO"
                  checked={paymentMethod === 'PAYMONGO'}
                  onChange={() => setPaymentMethod('PAYMONGO')}
                  icon={<CreditCard size={15} color="#1D5D5D" />}
                  label="Online Payment (PayMongo)"
                  badge="Recommended"
                  description="Pay securely online via GCash, Maya, or credit card. Then meet the seller to receive your item."
                  perks="✓ Instant confirmation · ✓ Secure payment · ✓ QR handover verification"
                />
              </div>
            </SectionCard>

            {/* Meet-up Details — always shown for both payment methods */}
            <SectionCard icon={<MapPin size={16} color="#E8E4C9" />} title="Meet-up Details">

              <div className="mb-4 px-3 py-2 rounded-lg text-xs"
                style={{ backgroundColor: '#1D5D5D11', color: '#1D5D5D' }}>
                {paymentMethod === 'MEETUP'
                  ? '📍 Choose where and when to meet the seller to exchange the item and pay cash.'
                  : '📍 Even for online payment, set a meet-up so the seller can hand over the item. A QR code will be generated to confirm the handover.'}
              </div>

              {/* Location */}
              <div className="mb-4">
                <FieldLabel icon={<MapPin size={13} color="#1D5D5D" />}>
                  Meet-up Location *
                </FieldLabel>
                <select
                  value={meetupLocation}
                  onChange={e => setMeetupLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none appearance-none"
                  style={{
                    borderColor: meetupLocation ? '#1D5D5D' : '#d1c9b8',
                    backgroundColor: '#fafaf7',
                    color: meetupLocation ? '#421C3B' : '#9ca3af'
                  }}>
                  <option value="">Select a campus location</option>
                  {MEETUP_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="mb-5">
                <FieldLabel icon={<Clock size={13} color="#1D5D5D" />}>
                  Preferred Meet-up Time *
                </FieldLabel>
                <input
                  type="datetime-local"
                  value={meetupTime}
                  onChange={e => setMeetupTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{
                    borderColor: meetupTime ? '#1D5D5D' : '#d1c9b8',
                    backgroundColor: '#fafaf7',
                    color: '#421C3B'
                  }}
                />
              </div>

              {/* QR info box */}
              <div className="p-4 rounded-xl"
                style={{ backgroundColor: '#f9f7f2', border: '1px solid #e5e0d4' }}>
                <div className="flex items-center gap-2 mb-3">
                  <QrCode size={15} color="#1D5D5D" />
                  <p className="text-sm font-bold" style={{ color: '#1D5D5D' }}>
                    How QR Verification Works:
                  </p>
                </div>
                <ol className="space-y-1.5 text-xs" style={{ color: '#6b7280' }}>
                  {paymentMethod === 'MEETUP' ? (
                    <>
                      <li>1. A QR code is generated after placing your order</li>
                      <li>2. Meet the seller, pay cash, then show your QR code</li>
                      <li>3. Seller scans the code to confirm receipt and complete the order</li>
                    </>
                  ) : (
                    <>
                      <li>1. Pay online via PayMongo — you'll be redirected back here</li>
                      <li>2. A QR code is generated after payment is confirmed</li>
                      <li>3. Meet the seller at the location and time above</li>
                      <li>4. Show your QR code — seller scans it to confirm item handover</li>
                    </>
                  )}
                </ol>
              </div>
            </SectionCard>

            {/* Terms */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-teal-700 flex-shrink-0"
                />
                <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                  I agree to the{' '}
                  <span className="font-bold" style={{ color: '#1D5D5D' }}>Terms and Conditions</span>
                  {' '}and{' '}
                  <span className="font-bold" style={{ color: '#1D5D5D' }}>Privacy Policy</span>.
                  I understand that I am responsible for coordinating pickup with the seller
                  and confirming the item condition before completing the transaction.
                </p>
              </label>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-80 flex-shrink-0 sticky top-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-sm mb-4"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                Price Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>
                    Price ({quantity} item{quantity > 1 ? 's' : ''})
                  </span>
                  <span style={{ color: '#421C3B' }}>₱{total}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>Transaction Fee</span>
                  <span style={{ color: '#6F803C' }}>FREE</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>Payment</span>
                  <span style={{ color: '#421C3B' }}>
                    {paymentMethod === 'MEETUP' ? 'Cash' : 'Online'}
                  </span>
                </div>
              </div>

              {meetupLocation && (
                <div className="mt-4 p-3 rounded-xl text-xs space-y-1"
                  style={{ backgroundColor: '#f9f7f2' }}>
                  <p className="font-bold" style={{ color: '#421C3B' }}>📍 Meet-up Details</p>
                  <p style={{ color: '#6b7280' }}>
                    Location: <span className="font-medium" style={{ color: '#421C3B' }}>
                      {meetupLocation}
                    </span>
                  </p>
                  {meetupTime && (
                    <p style={{ color: '#6b7280' }}>
                      Time: <span className="font-medium" style={{ color: '#421C3B' }}>
                        {new Date(meetupTime).toLocaleString([], {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="my-4" style={{ borderTop: '1px solid #f0ebe0' }} />

              <div className="flex justify-between font-bold text-base mb-6">
                <span style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>Total</span>
                <span style={{ color: '#B28E3A' }}>₱{total}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !agreed}
                className="w-full py-3 rounded-xl font-bold text-sm transition"
                style={{
                  backgroundColor: agreed ? '#1D5D5D' : '#d1c9b8',
                  color: '#E8E4C9',
                  cursor: agreed ? 'pointer' : 'not-allowed',
                  opacity: placing ? 0.7 : 1
                }}>
                {placing ? 'Placing Order...' :
                  paymentMethod === 'MEETUP'
                    ? 'Place Order & Generate QR'
                    : 'Place Order & Pay Online'}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3">
                <ShieldCheck size={13} color="#9ca3af" />
                <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
                  Your information is secure and protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}