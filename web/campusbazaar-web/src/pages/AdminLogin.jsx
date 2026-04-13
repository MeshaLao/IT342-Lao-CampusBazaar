import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', formData)
      const { accessToken, fullName, email, role } = res.data.data

      if (role !== 'ADMIN') {
        setError('Access denied. Admin accounts only.')
        setLoading(false)
        return
      }

      localStorage.setItem('token', accessToken)
      localStorage.setItem('userName', fullName)
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userRole', role)

      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.data || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#1D5D5D' }}>

      <div className="w-full max-w-sm px-10 py-12 shadow-2xl"
        style={{
          backgroundColor: '#0f2e2e',
          border: '1px solid #B28E3A',
          borderRadius: '50% 50% 16px 16px / 30% 30% 16px 16px'
        }}>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#E8E4C9', border: '2px solid #B28E3A' }}>
            <ShieldCheck size={36} color="#421C3B" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'Georgia, serif' }}>
            Admin Portal
          </h1>
          <p className="text-sm" style={{ color: '#B28E3A' }}>
            Administrator access only
          </p>
        </div>

        {/* Restricted Banner */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg mb-6 text-xs font-bold tracking-widest"
          style={{
            backgroundColor: '#A3464D22',
            color: '#A3464D',
            border: '1px solid #A3464D44'
          }}>
          🔒 RESTRICTED ACCESS
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm px-4 py-2 rounded-lg mb-4 text-center"
            style={{ backgroundColor: '#A3464D22', color: '#A3464D' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2"
              style={{ color: '#B28E3A' }}>
              ADMIN EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@campusbazaar.com"
              className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none text-center"
              style={{
                backgroundColor: '#1a3a3a',
                border: '1px solid #2a5a5a',
                color: '#E8E4C9'
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest mb-2"
              style={{ color: '#B28E3A' }}>
              ADMIN PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none text-center"
              style={{
                backgroundColor: '#1a3a3a',
                border: '1px solid #2a5a5a',
                color: '#E8E4C9'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold tracking-widest text-sm transition duration-200"
            style={{ backgroundColor: '#B28E3A', color: '#421C3B' }}>
            {loading ? 'VERIFYING...' : 'ACCESS CONTROL PANEL'}
          </button>
        </form>
      </div>
    </div>
  )
}