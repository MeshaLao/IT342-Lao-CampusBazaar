import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../../shared/components/layout/Navbar'
import Footer from '../../shared/components/layout/Footer'
import useMessages from '../../shared/hooks/useMessages'
import { Send, MessageCircle, ArrowLeft } from 'lucide-react'
import EmptyState from '../../shared/components/ui/EmptyState'

export default function Messages() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const otherUserId = searchParams.get('userId')
  const productId = searchParams.get('productId')
  const otherUserName = searchParams.get('name') || 'User'

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  const {
    messages, inbox, connected,
    connect, disconnect,
    fetchConversation, fetchInbox, sendMessage
  } = useMessages()

  const myEmail = localStorage.getItem('userEmail')

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    if (email) connect(email)
    if (otherUserId && productId) {
      fetchConversation(otherUserId, productId)
    } else {
      fetchInbox()
    }
    return () => disconnect()
  }, [otherUserId, productId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !otherUserId || !productId) return
    try {
      await sendMessage(Number(otherUserId), Number(productId), input.trim())
      setInput('')
    } catch { }
  }

  return (
    <div style={{ backgroundColor: '#E8E4C9', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* CONVERSATION VIEW */}
        {otherUserId && productId ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ backgroundColor: '#1D5D5D' }}>
              <button onClick={() => navigate('/messages')}
                className="text-white hover:opacity-70 mr-1">
                <ArrowLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                {otherUserName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-white">{otherUserName}</p>
                <p className="text-xs"
                  style={{ color: connected ? '#6F803C' : '#B28E3A' }}>
                  {connected ? '● Live' : '○ Connecting...'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: '#fafaf7' }}>
              {messages.length === 0 && (
                <p className="text-center text-xs py-8" style={{ color: '#9ca3af' }}>
                  No messages yet. Say hello!
                </p>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender?.email === myEmail
                return (
                  <div key={msg.id || i}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mr-2 flex-shrink-0 self-end"
                        style={{ backgroundColor: '#1D5D5D', color: '#fff' }}>
                        {msg.sender?.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div
                      className="max-w-xs px-4 py-2 rounded-2xl text-sm"
                      style={{
                        backgroundColor: isMe ? '#1D5D5D' : '#fff',
                        color: isMe ? '#E8E4C9' : '#421C3B',
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: !isMe ? 4 : 16,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                      }}>
                      <p>{msg.body}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit', minute: '2-digit'
                            })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 flex gap-3 items-center"
              style={{ borderTop: '1px solid #f0ebe0' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2 rounded-xl border text-sm outline-none"
                style={{
                  borderColor: '#d1c9b8',
                  backgroundColor: '#fafaf7',
                  color: '#421C3B'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-xl transition"
                style={{
                  backgroundColor: input.trim() ? '#1D5D5D' : '#d1c9b8',
                  color: '#E8E4C9'
                }}>
                <Send size={18} />
              </button>
            </div>
          </div>

        ) : (
          /* INBOX VIEW */
          <div>
            <h1 className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Georgia, serif', color: '#421C3B' }}>
              Messages
            </h1>
            {inbox.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No messages yet"
                subtitle="Message a seller from any product page" />
            ) : (
              <div className="space-y-3">
                {inbox.map((msg, i) => {
                  // Show the OTHER person (not me)
                  const isMe = msg.sender?.email === myEmail
                  const otherPerson = isMe ? msg.receiver : msg.sender
                  return (
                    <div key={i}
                      onClick={() => navigate(
                        `/messages?userId=${otherPerson?.id}&productId=${msg.productId}&name=${otherPerson?.fullName}`
                      )}
                      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                          style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
                          {otherPerson?.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: '#421C3B' }}>
                            {otherPerson?.fullName}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#6b7280' }}>
                            {isMe ? 'You: ' : ''}{msg.body}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-xs" style={{ color: '#9ca3af' }}>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleDateString()
                              : ''}
                          </p>
                          {!msg.read && !isMe && (
                            <span className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#A3464D' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}