import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="py-10 px-8 mt-4" style={{ backgroundColor: '#421C3B' }}>
      <div className="max-w-6xl mx-auto flex justify-between items-start flex-wrap gap-8">

        {/* Brand */}
        <div className="max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#E8E4C9', border: '2px solid #B28E3A' }}>
              <span>🐪</span>
            </div>
            <p className="font-bold text-lg"
              style={{ color: '#B28E3A', fontFamily: 'Georgia, serif' }}>
              CampusBazaar
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
            The premier marketplace for the scholarly community.
            Buy, sell, and trade with confidence in our secure souk.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <p className="font-bold text-xs tracking-widest mb-4"
            style={{ color: '#B28E3A' }}>
            NAVIGATION
          </p>
          <div className="space-y-2">
            {[
              { label: 'Browse Market', to: '/marketplace' },
              { label: 'Open Stall', to: '/sell' },
              { label: 'Merchant Dashboard', to: '/dashboard' },
              { label: 'My Caravan', to: '/dashboard' },
            ].map(item => (
              <Link key={item.label} to={item.to}
                className="flex items-center gap-2 text-xs hover:opacity-80"
                style={{ color: '#9ca3af' }}>
                <span style={{ color: '#B28E3A' }}>•</span> {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="font-bold text-xs tracking-widest mb-4"
            style={{ color: '#B28E3A' }}>
            CONTACT
          </p>
          <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>
            Questions? Send a messenger to:
          </p>
          <p className="text-xs font-bold mb-4" style={{ color: '#B28E3A' }}>
            SUPPORT@CAMPUSBAZAAR.EDU
          </p>
          <div className="flex gap-2">
            {['FB', 'IG', 'TW'].map(social => (
              <div key={social}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80"
                style={{ border: '1px solid #6b7280', color: '#9ca3af' }}>
                {social}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 pt-4 text-center"
        style={{ borderTop: '1px solid #4a2040' }}>
        <p className="text-xs" style={{ color: '#6b7280' }}>✦ ✦ ✦</p>
        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
          © 2026 CAMPUSBAZAAR. EST. 2024
        </p>
      </div>
    </footer>
  )
}