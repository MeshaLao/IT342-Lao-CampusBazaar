import Modal from './Modal'

export default function ConfirmDialog({
  icon: Icon, iconColor = '#A3464D',
  title, message,
  confirmLabel, confirmColor = '#A3464D',
  onConfirm, onCancel
}) {
  return (
    <Modal title="" onClose={onCancel} maxWidth="max-w-sm">
      <div className="text-center">
        <Icon size={40} className="mx-auto mb-4" color={iconColor} />
        <h2 className="text-lg font-bold mb-2"
          style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
          {title}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="px-5 py-2 rounded-lg text-sm border"
            style={{ borderColor: '#ddd', color: '#6b7280' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-5 py-2 rounded-lg text-sm font-bold"
            style={{ backgroundColor: confirmColor, color: '#fff' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}