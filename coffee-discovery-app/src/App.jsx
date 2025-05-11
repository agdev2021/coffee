import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

// Context providers
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'

// Pages
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/AdminDashboard'
import MerchantDashboard from './pages/MerchantDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Initialize React Query client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Protected Admin Routes */}
              <Route 
                path="admin/*" 
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Merchant Routes */}
              <Route 
                path="merchant/*" 
                element={
                  <ProtectedRoute role="merchant">
                    <MerchantDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 and fallback */}
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
