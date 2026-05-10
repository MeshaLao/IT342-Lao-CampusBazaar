export default function Card({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#1D5D5D' }}>
      <div
        className="w-full max-w-sm rounded-t-full rounded-b-3xl px-10 py-12 shadow-2xl"
        style={{
          backgroundColor: '#0f2e2e',
          border: '1px solid #B28E3A'
        }}>
        {children}
      </div>
    </div>
  )
}