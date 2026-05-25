// src/shared/components/ui/RadioCard.jsx
// Reusable selectable card with radio button — used in Checkout payment method, etc.

export default function RadioCard({ name, value, checked, onChange, icon, label, badge, description, perks }) {
  return (
    <label
      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition"
      style={{
        borderColor: checked ? '#1D5D5D' : '#e5e0d4',
        backgroundColor: checked ? '#1D5D5D11' : '#fff'
      }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-teal-700"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {icon}
          <span className="font-bold text-sm" style={{ color: '#421C3B' }}>
            {label}
          </span>
          {badge && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
            {description}
          </p>
        )}
        {perks && (
          <p className="text-xs" style={{ color: '#6F803C' }}>{perks}</p>
        )}
      </div>
    </label>
  )
}