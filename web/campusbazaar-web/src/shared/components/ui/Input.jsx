export default function Input({ label, name, type = 'text', value, onChange, placeholder, required, extra }) {
  return (
    <div>
      {/* Label Row */}
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold tracking-widest"
          style={{ color: '#B28E3A' }}>
          {label}
        </label>
        {extra && (
          <span className="text-xs italic cursor-pointer"
            style={{ color: '#B28E3A' }}>
            {extra}
          </span>
        )}
      </div>

      {/* Input */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none"
        style={{
          backgroundColor: '#1a3a3a',
          border: '1px solid #2a5a5a',
          color: '#E8E4C9'
        }}
      />
    </div>
  )
}