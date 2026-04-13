import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { ImagePlus, X, Type, DollarSign } from 'lucide-react'

export default function Sell() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    condition: 'New',
    description: '',
    stock: 1
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = [
    'Textbooks', 'Electronics', 'Furniture',
    'Clothing', 'Merchandise', 'Supplies',
    'Uniforms', 'Other'
  ]
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImage = (e) => {
    const files = Array.from(e.target.files)
    const remaining = 10 - images.length
    const newFiles = files.slice(0, remaining)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('You must be logged in to create a listing')
        setLoading(false)
        return
      }

      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('stock', formData.stock)
      data.append('category', formData.category)
      if (images.length > 0) {
        data.append('image', images[0])
      }

      await api.post('/products', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess('Your listing has been submitted for admin approval! 🎉')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      console.error('Create listing error:', err.response)
      setError(
        err.response?.data?.data ||
        err.response?.data?.error?.message ||
        `Error ${err.response?.status}: Failed to create listing`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-4"
            style={{ borderBottom: '1px solid #f0ebe0' }}>
            <h1 className="text-xl font-bold"
              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
              Create New Listing
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
              Add photos and details to sell your item.
            </p>
          </div>

          <div className="px-8 py-6">
            {error && (
              <div className="text-sm px-4 py-2 rounded-lg mb-4"
                style={{ backgroundColor: '#A3464D22', color: '#A3464D' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm px-4 py-2 rounded-lg mb-4"
                style={{ backgroundColor: '#6F803C22', color: '#6F803C' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Photos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-sm"
                    style={{ color: '#421C3B' }}>
                    Photos
                  </label>
                  <span className="text-sm" style={{ color: '#6b7280' }}>
                    {images.length}/10
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {previews.map((src, index) => (
                    <div key={index} className="relative w-28 h-28">
                      <img src={src} alt={`photo-${index}`}
                        className="w-full h-full object-cover rounded-xl border"
                        style={{ borderColor: '#ddd' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#A3464D', color: '#fff' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {images.length < 10 && (
                    <div
                      onClick={() => document.getElementById('imageInput').click()}
                      className="w-28 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition"
                      style={{ borderColor: '#9ca3af' }}>
                      <ImagePlus size={24} color="#9ca3af" />
                      <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                        Add Photo
                      </p>
                    </div>
                  )}
                </div>

                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImage}
                  className="hidden"
                />
                <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>
                  Photos: {images.length} / 10 • Choose the main photo first
                </p>
              </div>

              <hr style={{ borderColor: '#f0ebe0' }} />

              {/* Title */}
              <div>
                <label className="block font-semibold text-sm mb-2"
                  style={{ color: '#421C3B' }}>
                  Title
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden"
                  style={{ borderColor: '#ddd' }}>
                  <span className="px-3">
                    <Type size={14} color="#9ca3af" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="What are you selling?"
                    className="flex-1 py-3 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block font-semibold text-sm mb-2"
                  style={{ color: '#421C3B' }}>
                  Price
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden"
                  style={{ borderColor: '#ddd' }}>
                  <span className="px-3 text-sm font-bold"
                    style={{ color: '#421C3B' }}>₱</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="flex-1 py-3 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block font-semibold text-sm mb-2"
                  style={{ color: '#421C3B' }}>
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="How many available?"
                  className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-sm mb-2"
                  style={{ color: '#421C3B' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}>
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block font-semibold text-sm mb-2"
                  style={{ color: '#421C3B' }}>
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#ddd' }}>
                  {conditions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-sm mb-2"
                  style={{ color: '#421C3B' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Tell buyers about your item..."
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none resize-none"
                  style={{ borderColor: '#ddd' }}
                />
              </div>

              <hr style={{ borderColor: '#f0ebe0' }} />

              {/* Buttons */}
              <div className="flex justify-end gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 rounded-lg text-sm font-medium hover:opacity-80"
                  style={{ color: '#6b7280' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition"
                  style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                  {loading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    <Footer />             
    </div>
  )
}