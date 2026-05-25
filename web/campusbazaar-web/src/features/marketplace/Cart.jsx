import { useNavigate } from 'react-router-dom'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import useCart from '../../shared/hooks/useCart'
import { Trash2, ShoppingCart, Plus, Minus } from 'lucide-react'
import EmptyState from '../../shared/components/ui/EmptyState'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            subtitle="Browse the marketplace to add items"
            action={
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-2 rounded-lg text-sm font-bold"
                style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
                Browse Marketplace
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: '#f5f0e0' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart size={20} color="#B28E3A" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#421C3B' }}>
                    {item.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#B28E3A' }}>
                    ₱{Number(item.price).toFixed(2)} each
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#f0ebe0' }}>
                      <Minus size={12} color="#421C3B" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center"
                      style={{ color: '#421C3B' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#f0ebe0' }}>
                      <Plus size={12} color="#421C3B" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold" style={{ color: '#B28E3A' }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 p-1 rounded hover:opacity-70">
                    <Trash2 size={14} color="#A3464D" />
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold" style={{ color: '#421C3B' }}>Total</p>
                <p className="text-xl font-bold" style={{ color: '#B28E3A' }}>
                  ₱{cartTotal.toFixed(2)}
                </p>
              </div>
              <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
                Each item is checked out separately since sellers may differ.
              </p>
              <div className="space-y-2">
                {cart.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/checkout/${item.id}`, {
                      state: { quantity: item.quantity }
                    })}
                    className="w-full py-2 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
                    Checkout: {item.name} (×{item.quantity})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
