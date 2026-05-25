import { useState, useEffect } from 'react'

const CART_KEY = 'campusbazaar_cart'

export default function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) {
        return prev.map(i => i.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
          : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return }
    setCart(prev => prev.map(i =>
      i.id === productId ? { ...i, quantity } : i
    ))
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  return {
    cart, addToCart, removeFromCart,
    updateQuantity, clearCart, cartCount, cartTotal
  }
}