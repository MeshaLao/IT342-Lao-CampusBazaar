import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const intervalRef = useRef(null)

  const fetchCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await api.get('/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(res.data.unreadCount || 0)
    } catch {
      // silently fail
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch {
      // silently fail
    }
  }

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await api.put('/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchCount()
    intervalRef.current = setInterval(fetchCount, 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return { unreadCount, notifications, fetchNotifications, markAllRead }
}