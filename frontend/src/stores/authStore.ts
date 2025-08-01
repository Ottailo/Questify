import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  adventurer_name: string
  level: number
  xp: number
  xp_for_next_level: number
  last_interaction_mood: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, adventurer_name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const formData = new FormData()
          formData.append('username', email)
          formData.append('password', password)

          const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data = await response.json()
          
          // Get user info
          const userResponse = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          })

          if (!userResponse.ok) {
            throw new Error('Failed to get user info')
          }

          const userData = await userResponse.json()

          set({
            token: data.access_token,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      },

      register: async (email: string, password: string, adventurer_name: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              adventurer_name,
            }),
          })

          if (!response.ok) {
            throw new Error('Registration failed')
          }

          // Auto-login after registration
          await get().login(email, password)
        } catch (error) {
          console.error('Registration error:', error)
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },
    }),
    {
      name: 'questify-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
) 