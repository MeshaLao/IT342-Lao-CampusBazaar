import { useState } from 'react'
import ProductImage from './ProductImage'

export default function ImageUpload({ currentUrl, name, onChange }) {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
    onChange(file)
  }

  return (
    <div>
      <label className="text-xs font-bold block mb-2"
        style={{ color: '#421C3B' }}>
        Product Photo
      </label>
      <div className="flex gap-3 items-start">
        {/* Preview */}
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: '#f5f0e0' }}>
          <ProductImage
            imageUrl={preview || currentUrl}
            name={name}
            size="lg"
          />
        </div>

        {/* Upload zone */}
        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-5 cursor-pointer hover:opacity-80 transition"
          style={{ borderColor: '#B28E3A66', backgroundColor: '#B28E3A08' }}>
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
          {preview ? (
            <div className="text-center">
              <p className="text-xs font-bold" style={{ color: '#6F803C' }}>
                ✓ New photo selected
              </p>
              <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{fileName}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: '#B28E3A' }}>
                Click to upload a new photo
              </p>
              <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                PNG, JPG up to 10MB
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  )
}