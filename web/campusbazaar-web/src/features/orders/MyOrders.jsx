import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../shared/api/axios'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import { Package, QrCode } from 'lucide-react'

export default function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(res.data.data?.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (s) => {
    switch (s) {
      case 'PENDING': return { color: '#B28E3A', bg: '#B28E3A22' }
      case 'PAID': return { color: '#1D5D5D', bg: '#1D5D5D22' }
      case 'FULFILLED': return { color: '#6F803C', bg: '#6F803C22' }
      case 'COMPLETED': return { color: '#6F803C', bg: '#6F803C22' }
      case 'CANCELLED': return { color: '#A3464D', bg: '#A3464D22' }
      default: return { color: '#6b7280', bg: '#6b728022' }
    }
  }

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
          My Orders
        </h1>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p style={{ color: '#421C3B' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package size={40} className="mx-auto mb-3" color="#B28E3A" />
            <p className="font-medium mb-2" style={{ color: '#421C3B' }}>
              No orders yet!
            </p>
            <button onClick={() => navigate('/marketplace')}
              className="px-6 py-2 rounded-lg text-sm font-bold mt-2"
              style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const sc = statusColor(order.status)
              return (
                <div key={order.orderId}
                  className="bg-white rounded-2xl p-5 shadow-sm">

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-sm"
                        style={{ color: '#421C3B' }}>
                        {order.orderNumber}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-bold"
                      style={{ color: sc.color, backgroundColor: sc.bg }}>
                      {order.status}
                    </span>
                  </div>

                  {order.items?.map(item => (
                    <div key={item.id}
                      className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: '#f5f0e0' }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} color="#B28E3A" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium"
                          style={{ color: '#421C3B' }}>
                          {item.productName}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          Seller: {item.seller?.fullName}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          Qty: {item.quantity} × ₱{item.unitPrice}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-3"
                    style={{ borderTop: '1px solid #f0ebe0' }}>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Payment: <span className="font-medium"
                        style={{ color: '#421C3B' }}>
                        {order.paymentMethod}
                      </span>
                    </p>
                    <p className="font-bold" style={{ color: '#B28E3A' }}>
                      ₱{order.totalAmount}
                    </p>
                  </div>

                  {/* QR Code */}
                  {order.paymentMethod === 'MEETUP' && order.qrCodeUrl && (
                    <div className="mt-4 p-4 rounded-xl text-center"
                      style={{ backgroundColor: '#f9f7f2' }}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <QrCode size={14} color="#421C3B" />
                        <p className="text-xs font-bold"
                          style={{ color: '#421C3B' }}>
                          Your Meet-Up QR Code
                        </p>
                      </div>
                      <img src={order.qrCodeUrl} alt="QR Code"
                        className="w-32 h-32 mx-auto rounded-lg"
                        style={{ border: '1px solid #B28E3A' }} />
                      <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                        Show this to the seller to confirm your meet-up
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}