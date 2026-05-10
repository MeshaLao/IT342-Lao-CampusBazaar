import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CheckCircle, Package } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import Toast from '../ui/Toast'
import useToast from '../../hooks/useToast'

function statusStyle(s) {
  switch (s) {
    case 'PENDING':   return { color: '#B28E3A', bg: '#B28E3A22' }
    case 'PAID':      return { color: '#1D5D5D', bg: '#1D5D5D22' }
    case 'FULFILLED': return { color: '#6F803C', bg: '#6F803C22' }
    case 'COMPLETED': return { color: '#6F803C', bg: '#6F803C22' }
    case 'CANCELLED': return { color: '#A3464D', bg: '#A3464D22' }
    default:          return { color: '#6b7280', bg: '#6b728022' }
  }
}

export default function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast, showToast } = useToast()

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get('/orders/seller', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(res.data.data?.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token')
      await api.put(`/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showToast(`Order marked as ${status}!`)
      fetchOrders()
    } catch (err) {
      showToast('Failed to update order status.', 'error')
    }
  }

  return (
    <div>
      <Toast message={toast?.msg} type={toast?.type} />

      <h1 className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
        Orders to Fulfill
      </h1>

      {loading ? (
        <EmptyState icon={Package} title="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No orders yet!"
          subtitle="When buyers purchase your products, orders will appear here."
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const sc = statusStyle(order.status)
            return (
              <div key={order.orderId}
                className="bg-white rounded-2xl p-5 shadow-sm">

                {/* Header */}
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

                {/* Items */}
                {order.items?.map(item => (
                  <div key={item.id}
                    className="flex items-center gap-3 mb-3">
                    <div
                      className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: '#f5f0e0' }}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
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
                        Qty: {item.quantity} × ₱{item.unitPrice}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Buyer + Total */}
                <div
                  className="flex justify-between items-center pt-3 mb-3"
                  style={{ borderTop: '1px solid #f0ebe0' }}>
                  <div>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Buyer:{' '}
                      <span className="font-medium" style={{ color: '#421C3B' }}>
                        {order.buyer?.fullName}
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Payment:{' '}
                      <span className="font-medium" style={{ color: '#421C3B' }}>
                        {order.paymentMethod}
                      </span>
                    </p>
                  </div>
                  <p className="font-bold" style={{ color: '#B28E3A' }}>
                    ₱{order.totalAmount}
                  </p>
                </div>

                {/* QR Code for MEETUP */}
                {order.paymentMethod === 'MEETUP' && order.qrCodeUrl && (
                  <div
                    className="mb-3 p-3 rounded-xl text-center"
                    style={{ backgroundColor: '#f9f7f2' }}>
                    <p className="text-xs font-bold mb-2"
                      style={{ color: '#421C3B' }}>
                      Meet-Up QR Code
                    </p>
                    <img
                      src={order.qrCodeUrl}
                      alt="QR Code"
                      className="w-24 h-24 mx-auto rounded-lg"
                      style={{ border: '1px solid #B28E3A' }}
                    />
                    <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                      Scan this QR to confirm the meet-up transaction
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {order.status === 'PENDING' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateStatus(order.orderId, 'FULFILLED')}
                      className="flex-1 py-2 rounded-lg text-xs font-bold"
                      style={{ backgroundColor: '#6F803C', color: '#fff' }}>
                      ✓ Mark as Fulfilled
                    </button>
                    <button
                      onClick={() => updateStatus(order.orderId, 'CANCELLED')}
                      className="px-4 py-2 rounded-lg text-xs font-bold border"
                      style={{ borderColor: '#A3464D', color: '#A3464D' }}>
                      Cancel
                    </button>
                  </div>
                )}

                {order.status === 'FULFILLED' && (
                  <button
                    onClick={() => updateStatus(order.orderId, 'COMPLETED')}
                    className="w-full py-2 rounded-lg text-xs font-bold mt-2"
                    style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                    ✓ Mark as Completed
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}