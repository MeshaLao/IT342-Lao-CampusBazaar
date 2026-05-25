import { useState, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '../api/axios'

export default function useMessages() {
  const [messages, setMessages] = useState([])
  const [inbox, setInbox] = useState([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)

  const connect = useCallback((userEmail) => {
    const token = localStorage.getItem('token')
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setConnected(true)
        client.subscribe(
          `/user/${userEmail}/queue/messages`,
          (frame) => {
            const msg = JSON.parse(frame.body)
            setMessages(prev => [...prev, msg])
          }
        )
      },
      onDisconnect: () => setConnected(false),
      reconnectDelay: 3000,
    })
    client.activate()
    clientRef.current = client
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()
  }, [])

  const fetchConversation = async (otherUserId, productId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get('/messages/conversation', {
        params: { otherUserId, productId },
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data || [])
    } catch (err) {
      console.error('Failed to fetch conversation', err)
    }
  }

  const fetchInbox = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get('/messages/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInbox(res.data || [])
    } catch (err) {
      console.error('Failed to fetch inbox', err)
    }
  }

  const sendMessage = async (receiverId, productId, body) => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.post('/messages',
        { receiverId, productId, body },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(prev => [...prev, res.data])
      return res.data
    } catch (err) {
      console.error('Failed to send message', err)
      throw err
    }
  }

  return {
    messages, inbox, connected,
    connect, disconnect,
    fetchConversation, fetchInbox,
    sendMessage, setMessages
  }
}