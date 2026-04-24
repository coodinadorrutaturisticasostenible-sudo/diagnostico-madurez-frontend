import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import './index.css'

const PrivateRoute = ({ children, rol }) => {
  const token = localStorage.getItem('token')
  const userRol = localStorage.getItem('rol')
  if (!token) return <Navigate to="/" />
  if (rol && userRol !== rol) return <Navigate to="/" />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute rol="org"><Dashboard /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute rol="admin"><Admin /></PrivateRoute>} />
    </Routes>
  </BrowserRouter>
)
