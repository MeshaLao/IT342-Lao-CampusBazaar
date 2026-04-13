export default function StatusBadge({ status }) {
  const getStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return { color: '#6F803C', backgroundColor: '#6F803C22', label: 'ACTIVE' }
      case 'PENDING_APPROVAL':
        return { color: '#B28E3A', backgroundColor: '#B28E3A22', label: 'PENDING' }
      case 'REJECTED':
        return { color: '#A3464D', backgroundColor: '#A3464D22', label: 'REJECTED' }
      default:
        return { color: '#6b7280', backgroundColor: '#6b728022', label: status }
    }
  }

  const { color, backgroundColor, label } = getStyle()

  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ color, backgroundColor }}>
      {label}
    </span>
  )
}