import { Link, useNavigate } from 'react-router-dom'
import {
  Search, PlusCircle, LayoutDashboard,
  Bell, ShoppingCart, LogOut
} from 'lucide-react'

export default function Navbar({ user }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // Get user initial from localStorage
  const userEmail = localStorage.getItem('userEmail') || ''
  const userName = localStorage.getItem('userName') || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <nav className="w-full px-8 py-3 flex items-center justify-between"
      style={{
        backgroundColor: '#1D5D5D',
        borderBottom: '2px solid #B28E3A'
      }}>

      {/* Logo */}
      <Link to="/marketplace" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#E8E4C9', border: '2px solid #B28E3A' }}>
          <span className="text-lg">🐪</span>
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
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell size={20} color="#E8E4C9" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: '#A3464D', color: '#fff', fontSize: '10px' }}>
            2
          </span>
        </div>

        {/* Cart */}
        <div className="relative cursor-pointer">
          <ShoppingCart size={20} color="#E8E4C9" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: '#A3464D', color: '#fff', fontSize: '10px' }}>
            3
          </span>
        </div>

        {/* Profile */}
        {token && (
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: '#B28E3A', color: '#421C3B' }}>
              {userInitial}
            </div>
            <span className="text-sm font-medium"
              style={{ color: '#E8E4C9' }}>
              {userName.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hover:opacity-80 cursor-pointer"
          title="Logout">
          <LogOut size={20} color="#E8E4C9" />
        </button>
      </div>
    </nav>
  )
}