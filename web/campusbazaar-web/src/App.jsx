import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import ProductDetail from './pages/ProductDetail'
import Sell from './pages/Sell'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import OAuth2Callback from './pages/OAuth2Callback'

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