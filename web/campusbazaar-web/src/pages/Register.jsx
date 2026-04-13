import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import Input from '../components/ui/Input'
import GoogleIcon from '../components/ui/GoogleIcon'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      })
      localStorage.setItem('token', res.data.data.accessToken)
      localStorage.setItem('userName', res.data.data.fullName)
      localStorage.setItem('userEmail', res.data.data.email)
      localStorage.setItem('userRole', res.data.data.role)
      navigate('/marketplace')
    } catch (err) {
      setError(err.response?.data?.data || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#421C3B' }}>

      {/* Arch Card */}
      <div
        className="w-full max-w-sm px-10 py-12 shadow-2xl"
        style={{
          backgroundColor: '#1a0a14',
          border: '1px solid #8B6914',
          borderRadius: '50% 50% 16px 16px / 30% 30% 16px 16px'
        }}>

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#E8E4C9' }}>
            <span className="text-3xl">🐪</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-7">
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.03em' }}>
            Join the Caravan
          </h1>
          <p className="text-sm" style={{ color: '#B28E3A' }}>
            Become a merchant today
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-sm px-4 py-2 rounded-lg mb-4 text-center"
            style={{ backgroundColor: '#A3464D22', color: '#A3464D' }}>
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}

        {/* Google Button */}
        
          <a href="http://localhost:8080/oauth2/authorization/google"
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-sm mb-4 hover:opacity-90 transition"
          style={{ backgroundColor: '#fff', color: '#421C3B' }}>
          <GoogleIcon />
          Sign up with Google
        </a>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ backgroundColor: '#ffffff33' }} />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: '#9ca3af' }}>
            OR
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#ffffff33' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First & Last Name Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label
                className="block text-xs font-bold tracking-widest mb-2"
                style={{ color: '#B28E3A' }}>
                FIRST NAME
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Firstname"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none text-center"
                style={{
                  backgroundColor: '#2a1020',
                  border: '1px solid #4a2040',
                  color: '#E8E4C9'
                }}
              />
            </div>
            <div className="flex-1">
              <label
                className="block text-xs font-bold tracking-widest mb-2"
                style={{ color: '#B28E3A' }}>
                LAST NAME
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Lastname"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none text-center"
                style={{
                  backgroundColor: '#2a1020',
                  border: '1px solid #4a2040',
                  color: '#E8E4C9'
                }}
              />
            </div>
          </div>

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
            placeholder="Min. 8 characters"
            required
          />

          <Input
            label="CONFIRM SECRET KEY"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your key"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold tracking-widest text-sm transition duration-200 mt-2"
            style={{
              background: 'linear-gradient(135deg, #B28E3A, #6F803C)',
              color: '#1a0a14'
            }}>
            {loading ? 'JOINING...' : 'START JOURNEY'}
          </button>
        </form>

        {/* Bottom Divider */}
        <div className="my-5" style={{ borderTop: '1px solid #4a2040' }} />

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Already a merchant?{' '}
            <Link
              to="/login"
              className="font-bold"
              style={{ color: '#B28E3A' }}>
              Enter here
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}