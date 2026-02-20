import React from 'react'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  )
}
