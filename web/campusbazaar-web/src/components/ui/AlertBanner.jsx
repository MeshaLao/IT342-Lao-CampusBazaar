import { AlertCircle, CheckCircle, Info } from 'lucide-react'

const types = {
  warning: { color: '#B28E3A', bg: '#B28E3A22', border: '#B28E3A44', Icon: AlertCircle },
  error:   { color: '#A3464D', bg: '#A3464D22', border: '#A3464D44', Icon: AlertCircle },
  success: { color: '#6F803C', bg: '#6F803C22', border: '#6F803C44', Icon: CheckCircle },
  info:    { color: '#1D5D5D', bg: '#1D5D5D22', border: '#1D5D5D44', Icon: Info },
}

export default function AlertBanner({ type = 'info', message }) {
  const { color, bg, border, Icon } = types[type]
  return (
    <div className="mb-4 px-5 py-3 rounded-xl flex items-center gap-3"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
      <Icon size={18} color={color} />
      <p className="text-sm font-medium" style={{ color }}>{message}</p>
    </div>
  )
}