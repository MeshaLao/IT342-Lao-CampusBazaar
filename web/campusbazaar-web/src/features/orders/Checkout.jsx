import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../shared/api/axios'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import { Package, QrCode, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

export default function Checkout() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const qty = parseInt(searchParams.get('qty') || '1')

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(qty)
  const [paymentMethod, setPaymentMethod] = useState('MEETUP')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchProduct()
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

  const total = product
    ? (Number(product.price) * quantity).toFixed(2)
    : '0.00'

  const handlePlaceOrder = async () => {
    setPlacing(true)
    setError('')
    try {
      const res = await api.post('/orders', {
        productId: Number(productId),
        quantity,
        paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = res.data.data
      console.log('Order response:', data)

      if (paymentMethod === 'PAYMONGO') {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
          return
        } else {
          setError('Could not get payment link. Please try again.')
          return
        }
      }

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

  if (order) return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">

          <CheckCircle size={56} className="mx-auto mb-4" color="#6F803C" />

          <h1 className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            Order Placed!
          </h1>
          <p className="text-sm mb-1" style={{ color: '#6b7280' }}>
            Order Number:
          </p>
          <p className="font-bold text-lg mb-6" style={{ color: '#1D5D5D' }}>
            {order.orderNumber}
          </p>

          <div className="text-left rounded-xl p-4 mb-6"
            style={{ backgroundColor: '#f9f7f2' }}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#6b7280' }}>Product</span>
              <span className="font-medium" style={{ color: '#421C3B' }}>
                {order.productName}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#6b7280' }}>Quantity</span>
              <span className="font-medium" style={{ color: '#421C3B' }}>
                {order.quantity}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#6b7280' }}>Payment</span>
              <span className="font-medium" style={{ color: '#421C3B' }}>
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2"
              style={{ borderTop: '1px solid #f0ebe0' }}>
              <span style={{ color: '#421C3B' }}>Total</span>
              <span style={{ color: '#B28E3A' }}>₱{order.totalAmount}</span>
            </div>
          </div>

          {order.paymentMethod === 'MEETUP' && order.qrCodeUrl && (
            <div className="mb-6">
              <p className="text-sm font-bold mb-3" style={{ color: '#421C3B' }}>
                📍 Meet-Up QR Code
              </p>
              <p className="text-xs mb-4" style={{ color: '#6b7280' }}>
                Show this QR code to the seller during your meet-up.
                The seller will scan it to confirm the transaction.
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

        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {product && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-sm mb-4"
                  style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                  Order Summary
                </h2>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: '#f5f0e0' }}>
                    {product.imageUrl && product.imageUrl !== '' ? (
                      <img src={product.imageUrl} alt={product.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} color="#B28E3A" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: '#421C3B' }}>
                      {product.name}
                    </p>
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
                  <div className="flex items-center border rounded-lg overflow-hidden"
                    style={{ borderColor: '#ddd' }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
                      style={{ color: '#421C3B' }}>−
                    </button>
                    <span className="w-10 text-center text-sm font-bold"
                      style={{ color: '#421C3B' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
                      style={{ color: '#421C3B' }}>+
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>
                    {product.stock} available
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-sm mb-4"
                style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
                Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  className="flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition"
                  style={{
                    borderColor: paymentMethod === 'MEETUP' ? '#1D5D5D' : '#f0ebe0',
                    backgroundColor: paymentMethod === 'MEETUP' ? '#1D5D5D11' : '#fff'
                  }}>
                  <input type="radio" name="payment" value="MEETUP"
                    checked={paymentMethod === 'MEETUP'}
                    onChange={() => setPaymentMethod('MEETUP')}
                    className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode size={18} color="#1D5D5D" />
                      <span className="font-bold text-sm" style={{ color: '#421C3B' }}>
                        Meet-Up / Cash
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Meet the seller in person and pay cash.
                      A QR code will be generated to verify your transaction.
                    </p>
                  </div>
                </label>

                <label
                  className="flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition"
                  style={{
                    borderColor: paymentMethod === 'PAYMONGO' ? '#B28E3A' : '#f0ebe0',
                    backgroundColor: paymentMethod === 'PAYMONGO' ? '#B28E3A11' : '#fff'
                  }}>
                  <input type="radio" name="payment" value="PAYMONGO"
                    checked={paymentMethod === 'PAYMONGO'}
                    onChange={() => setPaymentMethod('PAYMONGO')}
                    className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={18} color="#B28E3A" />
                      <span className="font-bold text-sm" style={{ color: '#421C3B' }}>
                        Online Payment (PayMongo)
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Pay securely online via GCash, Maya, or credit card
                      through PayMongo sandbox.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
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
                  <span style={{ color: '#6b7280' }}>Payment Method</span>
                  <span style={{ color: '#421C3B' }}>
                    {paymentMethod === 'MEETUP' ? 'Cash' : 'Online'}
                  </span>
                </div>
              </div>
              <div className="my-4" style={{ borderTop: '1px solid #f0ebe0' }} />
              <div className="flex justify-between font-bold text-base mb-6">
                <span style={{ color: '#421C3B' }}>Total</span>
                <span style={{ color: '#B28E3A' }}>₱{total}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#1D5D5D', color: '#fff',
                         opacity: placing ? 0.7 : 1 }}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
              <p className="text-xs text-center mt-3" style={{ color: '#9ca3af' }}>
                By placing your order, you agree to the terms and conditions of Campus Bazaar.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}