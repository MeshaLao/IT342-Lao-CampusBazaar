import { Eye, Pencil, Trash2, RefreshCw } from 'lucide-react'
import ProductImage from '../ui/ProductImage'
import StatusBadge from '../ui/StatusBadge'
import AlertBanner from '../ui/AlertBanner'

export default function ProductCard({
  product, onView, onEdit, onResubmit, onDelete, showRejectionBanner = false
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
      style={showRejectionBanner ? { border: '1px solid #A3464D33' } : {}}>
      <div className="flex items-center gap-5">

        {/* Image */}
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <ProductImage imageUrl={product.imageUrl} name={product.name} size="lg" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-bold text-base cursor-pointer hover:underline"
            style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}
            onClick={onView}>
            {product.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            ₱{product.price} • {product.category}
          </p>
          <div className="mt-2">
            <StatusBadge status={product.status} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button onClick={onView}
            className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border hover:bg-gray-50"
            style={{ borderColor: '#ddd', color: '#421C3B' }}>
            <Eye size={12} /> View
          </button>

          {product.status !== 'REJECTED' && (
            <button onClick={onEdit}
              className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border hover:bg-gray-50"
              style={{ borderColor: '#ddd', color: '#421C3B' }}>
              <Pencil size={12} /> Edit
            </button>
          )}

          {product.status === 'REJECTED' && (
            <button onClick={onResubmit}
              className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg font-bold"
              style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
              <RefreshCw size={12} /> Resubmit
            </button>
          )}

          <button onClick={onDelete}
            className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg border hover:bg-red-50"
            style={{ borderColor: '#ddd', color: '#A3464D' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      {/* Rejection banner */}
      {showRejectionBanner && (
        <div className="mt-4">
          <AlertBanner type="error"
            message="Your listing was rejected by the admin. Click 'Resubmit' to edit and resubmit for approval." />
        </div>
      )}
    </div>
  )
}