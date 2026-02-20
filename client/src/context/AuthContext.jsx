import React, { createContext } from 'react'

export const AuthContext = createContext({ user: null })

export const AuthProvider = ({ children }) => {
  const value = { user: null }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
