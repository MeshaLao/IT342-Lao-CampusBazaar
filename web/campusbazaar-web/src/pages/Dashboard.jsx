import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#421C3B' }}>
      <div className="text-center px-10 py-12 rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#1a0a14', border: '1px solid #8B6914' }}>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#E8E4C9' }}>
            <span className="text-3xl">🐪</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'Georgia, serif' }}>
          Welcome to the Bazaar!
        </h1>
        <p className="text-sm mb-8" style={{ color: '#B28E3A' }}>
          You are successfully logged in 🎉
        </p>

        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-lg font-bold tracking-widest text-sm"
          style={{ backgroundColor: '#A3464D', color: '#fff' }}>
          LEAVE THE BAZAAR
        </button>
      </div>
    </div>
  )
}