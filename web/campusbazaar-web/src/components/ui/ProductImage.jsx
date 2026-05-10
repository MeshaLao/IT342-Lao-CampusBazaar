import { Package } from 'lucide-react'

export default function ProductImage({ imageUrl, name, className = '', size = 'md' }) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-full h-full'
  }

  const getFullUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:8080${url}`
  }

  const fullUrl = getFullUrl(imageUrl)

  return (
    <div className={`${sizes[size]} rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      style={{ backgroundColor: '#f5f0e0' }}>
      {fullUrl ? (
        <img
          src={fullUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <Package size={size === 'lg' ? 48 : 24} color="#B28E3A" />
      )}
    </div>
  )
}