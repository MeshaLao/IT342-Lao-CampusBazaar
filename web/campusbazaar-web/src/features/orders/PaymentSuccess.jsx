import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'

export default function PaymentSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/my-orders'), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold mb-3"
            style={{ fontFamily: 'Georgia, serif', color: '#1D5D5D' }}>
            Payment Successful!
          </h1>
          <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
            Your order has been confirmed and the seller has been notified.
          </p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Redirecting to your orders in a few seconds...
          </p>
          <button
            onClick={() => navigate('/my-orders')}
            className="mt-8 px-8 py-3 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
            View My Orders
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}