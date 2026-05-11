import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './features/auth/Register'
import Login from './features/auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import Marketplace from './features/marketplace/Marketplace'
import ProductDetail from './features/marketplace/ProductDetail'
import Sell from './features/marketplace/Sell'
import AdminLogin from './features/auth/AdminLogin'
import AdminDashboard from './features/admin/AdminDashboard'
import OAuth2Callback from './features/auth/OAuth2Callback'
import Checkout from './features/orders/Checkout'
import MyOrders from './features/orders/MyOrders'
import PaymentSuccess from './features/orders/PaymentSuccess'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('userRole')
  if (!token) return <Navigate to="/admin/login" />
  if (role !== 'ADMIN') return <Navigate to="/marketplace" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/marketplace" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/checkout/:productId" element={
  <PrivateRoute><Checkout /></PrivateRoute>
} />
<Route path="/orders" element={
  <PrivateRoute><MyOrders /></PrivateRoute>
} />
<Route path="/my-orders" element={
  <PrivateRoute><MyOrders /></PrivateRoute>
} />
        <Route path="/sell" element={
          <PrivateRoute><Sell /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}