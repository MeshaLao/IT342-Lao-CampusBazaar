import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, PlusCircle, LayoutDashboard,
  Bell, ShoppingCart, LogOut, MessageCircle, X
} from 'lucide-react'
import useNotifications from '../../hooks/useNotifications'
import useCart from '../../hooks/useCart'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail') || ''
  const userName = localStorage.getItem('userName') || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotifications()
  const { cartCount } = useCart()
  const [showNotifs, setShowNotifs] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const handleBellClick = () => {
    if (!showNotifs) {
      fetchNotifications()
      markAllRead()
    }
    setShowNotifs(prev => !prev)
  }

  return (
    <nav className="w-full px-8 py-3 flex items-center justify-between"
      style={{ backgroundColor: '#1D5D5D', borderBottom: '2px solid #B28E3A' }}>

      {/* Logo */}
      <Link to="/marketplace" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#E8E4C9', border: '2px solid #B28E3A' }}>
          <img src="/CB-logo.png" alt="Campus Bazaar" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-widest leading-tight"
            style={{ color: '#B28E3A', fontFamily: 'Georgia, serif' }}>
            CampusBazaar
          </p>
          <p className="text-xs tracking-widest"
            style={{ color: '#E8E4C9', fontSize: '9px' }}>
            THE STUDENT SOUK
          </p>
        </div>
      </Link>

      {/* Center Nav */}
      <div className="flex items-center gap-6">
        <Link to="/marketplace"
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
          style={{ color: '#E8E4C9' }}>
          <Search size={16} />
          Browse
        </Link>

        <Link to="/sell"
          className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full"
          style={{ backgroundColor: '#2a7a7a', color: '#E8E4C9' }}>
          <PlusCircle size={16} />
          Sell
        </Link>

        <Link to="/dashboard"
          className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full"
          style={{ backgroundColor: '#154444', color: '#E8E4C9' }}>
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link to="/orders"
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
          style={{ color: '#E8E4C9' }}>
          My Orders
        </Link>

        <Link to="/messages"
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
          style={{ color: '#E8E4C9' }}>
          <MessageCircle size={16} />
          Messages
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        {/* Notifications Bell */}
        <div className="relative">
          <button onClick={handleBellClick}
            className="relative p-1 hover:opacity-80 transition">
            <Bell size={20} color="#E8E4C9" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: '#A3464D', color: '#fff', fontSize: '10px' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div
              className="absolute right-0 top-10 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{ backgroundColor: '#fff', border: '1px solid #f0ebe0' }}>
              <div className="px-4 py-3 flex justify-between items-center"
                style={{ borderBottom: '1px solid #f0ebe0', backgroundColor: '#1D5D5D' }}>
                <p className="font-bold text-sm text-white">Notifications</p>
                <button onClick={() => setShowNotifs(false)}>
                  <X size={16} color="#E8E4C9" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs py-8" style={{ color: '#9ca3af' }}>
                    No notifications yet
                  </p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id}
                      onClick={() => {
                        setShowNotifs(false)
                        if (n.type === 'NEW_MESSAGE') navigate('/messages')
                        else if (n.type === 'ORDER_PLACED') navigate('/dashboard')
                        else if (n.type === 'ORDER_STATUS') navigate('/my-orders')
                      }}
                      className="px-4 py-3 text-xs cursor-pointer hover:opacity-80"
                      style={{
                        borderBottom: '1px solid #f9f7f2',
                        backgroundColor: n.read ? '#fff' : '#f9f7f2'
                      }}>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">
                          {n.type === 'ORDER_PLACED' ? '🛒'
                            : n.type === 'ORDER_STATUS' ? '📦'
                            : '💬'}
                        </span>
                        <div>
                          <p style={{ color: '#421C3B' }}>{n.message}</p>
                          <p className="mt-1" style={{ color: '#9ca3af' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: '#A3464D' }} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="relative p-1 hover:opacity-80 transition">
          <ShoppingCart size={20} color="#E8E4C9" />
          {cartCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ backgroundColor: '#A3464D', color: '#fff', fontSize: '10px' }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        {token && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: '#B28E3A', color: '#421C3B' }}>
              {userInitial}
            </div>
            <span className="text-sm font-medium" style={{ color: '#E8E4C9' }}>
              {userName.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className="hover:opacity-80" title="Logout">
          <LogOut size={20} color="#E8E4C9" />
        </button>
      </div>
    </nav>
  )
}