export default function Toast({ message, type = 'success' }) {
  if (!message) return null
  return (
    <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
      style={{
        backgroundColor: type === 'error' ? '#A3464D' : '#6F803C',
        color: '#fff'
      }}>
      {message}
    </div>
  )
}