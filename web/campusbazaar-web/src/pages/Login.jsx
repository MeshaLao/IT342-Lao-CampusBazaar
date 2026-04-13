import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import GoogleIcon from '../components/ui/GoogleIcon'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(
    searchParams.get('error') === 'oauth_failed'
      ? 'Google login failed. Please try again.'
      : ''
  )
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

      localStorage.setItem('token', accessToken)
      localStorage.setItem('userName', fullName)
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userRole', role)

      if (role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/marketplace')
      }
    } catch (err) {
      setError(err.response?.data?.data || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#E8E4C9' }}>
          <span className="text-3xl">🐪</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold text-white mb-2"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
          Enter the Bazaar
        </h1>
        <p className="text-sm" style={{ color: '#B28E3A' }}>
          Sign in to begin your trade
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-sm px-4 py-2 rounded-lg mb-4 text-center"
          style={{ backgroundColor: '#A3464D22', color: '#A3464D' }}>
          {error}
        </div>
      )}

{/* Google Button */}

  < a href="http://localhost:8080/oauth2/authorization/google"
  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-sm mb-5 hover:opacity-90 transition"
  style={{ backgroundColor: '#fff', color: '#421C3B' }}>
  <GoogleIcon />
  Continue with Google
</a>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ backgroundColor: '#ffffff33' }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: '#9ca3af' }}>
          OR
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#ffffff33' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="EMAIL SCROLL"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@campus.edu"
          required
        />
        <Input
          label="SECRET KEY"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          extra="Forgot?"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'OPENING...' : 'OPEN GATES'}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          New to the souk?{' '}
          <Link
            to="/register"
            className="font-bold"
            style={{ color: '#B28E3A' }}>
            Join the Caravan
          </Link>
        </p>
      </div>
    </Card>
  )
}