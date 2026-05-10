import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const fullUrl = window.location.href
    const urlParams = new URL(fullUrl)

    const token = urlParams.searchParams.get('token')
    const name  = urlParams.searchParams.get('name')
    const email = urlParams.searchParams.get('email')
    const role  = urlParams.searchParams.get('role')

    if (token && token.length > 10) {
      localStorage.setItem('token', token)
      localStorage.setItem('userName', name || '')
      localStorage.setItem('userEmail', email || '')
      localStorage.setItem('userRole', role || 'STUDENT')

      if (role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/marketplace', { replace: true })
      }
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#1D5D5D' }}>
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#E8E4C9', border: '2px solid #B28E3A' }}>
          <span className="text-3xl">🐪</span>
        </div>
        <p
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: 'Georgia, serif' }}>
          Entering the Bazaar...
        </p>
        <p className="text-sm" style={{ color: '#B28E3A' }}>
          Setting up your account, please wait.
        </p>
        <div className="mt-6 flex justify-center">
          <div
            className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{
              borderColor: '#B28E3A',
              borderTopColor: 'transparent'
            }}
          />
        </div>
      </div>
    </div>
  )
}