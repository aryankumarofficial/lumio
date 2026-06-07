'use client'

import { LogOut, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/button'
import { useAuth } from '../../hooks/use-auth'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout, fetchMe } = useAuth()
  const router = useRouter()
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current || user) {
      return
    }

    hydratedRef.current = true
    void fetchMe().then((currentUser) => {
      if (!currentUser) {
        router.replace('/login')
      }
    })
  }, [fetchMe, router, user])

  async function handleLogout() {
    await logout()
    router.push('/login')
    toast.success('Logged out')
  }

  return (
    <header className="flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mr-auto">
        <p className="text-sm font-medium">Peblo</p>
        <p className="text-xs text-muted-foreground">{user?.name ?? 'Preparing your workspace...'}</p>
      </div>

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="size-4" />
      </Button>
    </header>
  )
}