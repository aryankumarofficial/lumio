import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, type User } from '../lib/api'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<User | null>
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      login: async (email, password) => {
        const data = await authApi.login({ email, password })
        set({ user: data.user })
      },
      signup: async (name, email, password) => {
        const data = await authApi.signup({ name, email, password })
        set({ user: data.user })
      },
      logout: async () => {
        await authApi.logout()
        set({ user: null })
      },
      fetchMe: async () => {
        try {
          set({ loading: true })
          const data = await authApi.me()
          set({ user: data.user })
          return data.user
        } catch {
          set({ user: null })
          return null
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)