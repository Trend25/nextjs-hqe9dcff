'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  user: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Başlangıçta loading true

  // Component mount olduğunda localStorage'dan user'ı yükle
  useEffect(() => {
    console.log('🔄 Loading user from localStorage...')
    
    try {
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        console.log('✅ User restored from localStorage:', userData.email)
        setUser(userData)
      } else {
        console.log('ℹ️ No saved user found')
      }
    } catch (error) {
      console.error('❌ Error loading user:', error)
    }
    
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Sign in attempt:', email)
    
    // Simulated login - set user data
    const userData = {
      id: 'user-' + Date.now(),
      email: email,
      created_at: new Date().toISOString()
    }
    
    // User state'i set et
    setUser(userData)
    
    // localStorage'a kaydet (persistence için)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    
    console.log('✅ User logged in and saved:', userData)
    
    return { data: userData, error: null }
  }

  const signUp = async (email: string, password: string) => {
    console.log('📝 Sign up:', email)
    return { data: null, error: null }
  }

  const signOut = async () => {
    console.log('🚪 Sign out')
    setUser(null)
    localStorage.removeItem('auth_user') // localStorage'dan da sil
  }

  const value = { user, loading, signIn, signUp, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}