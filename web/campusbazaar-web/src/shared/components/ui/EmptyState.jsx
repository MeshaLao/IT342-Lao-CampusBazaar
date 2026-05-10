export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
      <Icon size={40} className="mx-auto mb-3" color="#B28E3A" />
      <p className="font-medium mb-2" style={{ color: '#421C3B' }}>{title}</p>
      {subtitle && (
        <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{subtitle}</p>
      )}
      {action}
    </div>
  )
}