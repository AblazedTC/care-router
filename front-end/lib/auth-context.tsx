"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const TOKEN_KEY = "mediroute_token"

export interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, check for existing token and validate it
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    const guestFlag = localStorage.getItem("mediroute_guest")

    if (guestFlag === "true") {
      setIsGuest(true)
      setIsLoading(false)
      return
    }

    if (!stored) {
      setIsLoading(false)
      return
    }

    // Validate token by calling /auth/me
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          setToken(stored)
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || "Login failed")
    }

    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.removeItem("mediroute_guest")
    setToken(data.accessToken)
    setUser(data.user)
    setIsGuest(false)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Registration failed")
      }

      const data = await res.json()
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.removeItem("mediroute_guest")
      setToken(data.accessToken)
      setUser(data.user)
      setIsGuest(false)
    },
    []
  )

  const loginAsGuest = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.setItem("mediroute_guest", "true")
    setUser(null)
    setToken(null)
    setIsGuest(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("mediroute_guest")
    setUser(null)
    setToken(null)
    setIsGuest(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isGuest,
      isLoading,
      login,
      register,
      loginAsGuest,
      logout,
    }),
    [user, token, isGuest, isLoading, login, register, loginAsGuest, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
