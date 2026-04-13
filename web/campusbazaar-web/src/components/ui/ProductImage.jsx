import { Package } from 'lucide-react'

export default function ProductImage({ imageUrl, name, className = '', size = 'md' }) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-full h-96'
  }

  const baseUrl = 'http://localhost:8080'
  const fullUrl = imageUrl && imageUrl.startsWith('/uploads/')
    ? `${baseUrl}${imageUrl}`
    : imageUrl

  return (
    <div className={`${sizes[size]} rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      style={{ backgroundColor: '#f5f0e0' }}>
      {fullUrl ? (
        <img src={fullUrl} alt={name}
          className="w-full h-full object-cover" />
      ) : (
        <Package size={size === 'lg' ? 48 : 24} color="#B28E3A" />
      )}
    </div>
  )
}