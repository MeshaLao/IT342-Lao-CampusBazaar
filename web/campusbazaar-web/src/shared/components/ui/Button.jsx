export default function Button({ children, onClick, type = 'button', disabled, variant = 'primary', fullWidth = true }) {

  const variants = {
    primary: {
      backgroundColor: '#B28E3A',
      color: '#421C3B'
    },
    secondary: {
      backgroundColor: '#1D5D5D',
      color: '#E8E4C9'
    },
    danger: {
      backgroundColor: '#A3464D',
      color: '#fff'
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} py-3 px-6 rounded-lg font-bold tracking-widest text-sm transition duration-200 disabled:opacity-50`}
      style={variants[variant]}>
      {children}
    </button>
  )
}