// src/shared/components/ui/SectionCard.jsx
// Reusable card with icon header — used in Checkout, Dashboard, etc.

export default function SectionCard({ icon, title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
      {(icon || title) && (
        <div className="flex items-center gap-3 mb-5">
          {icon && (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#1D5D5D' }}>
              {icon}
            </div>
          )}
          {title && (
            <h2
              className="font-bold text-base"
              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
              {title}
            </h2>
          )}
        </div>
      )}
      {children}
    </div>
  )
}