// src/shared/components/ui/QuantityPicker.jsx
// Reusable quantity +/- control — used in Checkout, Cart, etc.

export default function QuantityPicker({ value, onChange, min = 1, max }) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#ddd' }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-lg"
        style={{ color: '#421C3B' }}>
        −
      </button>
      <span
        className="w-10 text-center text-sm font-bold"
        style={{ color: '#421C3B' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-lg"
        style={{ color: '#421C3B' }}>
        +
      </button>
    </div>
  )
}