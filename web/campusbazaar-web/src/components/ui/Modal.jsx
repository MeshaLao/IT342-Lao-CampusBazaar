import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className={`bg-white rounded-2xl p-8 w-full ${maxWidth} shadow-2xl max-h-screen overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
            {title}
          </h2>
          <button onClick={onClose}>
            <X size={20} color="#6b7280" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}