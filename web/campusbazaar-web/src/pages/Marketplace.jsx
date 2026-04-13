import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.data?.products || [])
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div className="text-center py-16 px-4"
        style={{ backgroundColor: '#421C3B' }}>
        <p className="text-sm tracking-widest mb-2"
          style={{ color: '#B28E3A' }}>
          THE STUDENT SOUK
        </p>
        <h1 className="text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'Georgia, serif' }}>
          Discover the <span style={{ color: '#B28E3A' }}>Treasures</span>
        </h1>
        <p className="text-sm mb-8" style={{ color: '#E8E4C9' }}>
          Trade textbooks, electronics, and rare finds with your fellow students
        </p>

        {/* Search */}
        <div className="flex justify-center gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the bazaar..."
            className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: '#E8E4C9', color: '#421C3B' }}
          />
          <button
            className="px-6 py-3 rounded-lg text-sm font-bold"
            style={{ backgroundColor: '#B28E3A', color: '#421C3B' }}>
            Search
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-2 rounded-lg text-sm font-bold"
            style={{ backgroundColor: '#B28E3A', color: '#421C3B' }}>
            Enter the Bazaar
          </button>
          <button
            onClick={() => navigate('/sell')}
            className="px-6 py-2 rounded-lg text-sm font-bold border"
            style={{ borderColor: '#B28E3A', color: '#B28E3A' }}>
            Sell Your Items
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-16 py-8"
        style={{ backgroundColor: '#E8E4C9' }}>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#421C3B' }}>2,500+</p>
          <p className="text-xs" style={{ color: '#1D5D5D' }}>MERCHANTS</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#421C3B' }}>15K+</p>
          <p className="text-xs" style={{ color: '#1D5D5D' }}>PRODUCTS</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#421C3B' }}>$50K+</p>
          <p className="text-xs" style={{ color: '#1D5D5D' }}>SALES MADE</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest mb-1" style={{ color: '#B28E3A' }}>
            MARKETPLACE
          </p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            Fresh from the Caravan
          </h2>
          <div className="w-16 h-0.5 mx-auto mt-2" style={{ backgroundColor: '#B28E3A' }} />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p style={{ color: '#421C3B' }}>Loading treasures...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🐪</p>
            <p style={{ color: '#421C3B' }}>No products found in the bazaar yet.</p>
            <button
              onClick={() => navigate('/sell')}
              className="mt-4 px-6 py-2 rounded-lg text-sm font-bold"
              style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
              Be the first to sell!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-200 cursor-pointer"
                  style={{ backgroundColor: '#fff' }}>
                  {/* Image */}
                  <div className="h-48 flex items-center justify-center"
                    style={{ backgroundColor: '#f5f0e0' }}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🐪</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#E8E4C9', color: '#1D5D5D' }}>
                      {product.category || 'General'}
                    </span>
                    <h3 className="font-bold mt-2 text-sm"
                      style={{ color: '#421C3B', fontFamily: 'Georgia, serif' }}>
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold mt-1"
                      style={{ color: '#B28E3A' }}>
                      ₱{product.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    <Footer />
    </div>
  )
}