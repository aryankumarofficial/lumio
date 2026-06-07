'use client'

import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/button'
import { useAuth } from '../../hooks/use-auth'
import { SidebarNav } from './sidebar-nav'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout, fetchMe } = useAuth()
  const router = useRouter()
  const hydratedRef = useRef(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (hydratedRef.current) {
      return
    }

    hydratedRef.current = true
    void fetchMe().then((currentUser) => {
      if (!currentUser) {
        router.replace('/login')
      }
    })
  }, [fetchMe, router])

  useEffect(() => {
    if (!mobileNavOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileNavOpen])

  async function handleLogout() {
    await logout()
    router.push('/login')
    toast.success('Logged out')
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>

        <div className="mr-auto min-w-0">
          <p className="truncate text-sm font-medium">{user?.name ?? 'Peblo'}</p>
          {user ? (
            <>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              {user.createdAt ? (
                <p className="text-xs text-muted-foreground">
                  Since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Preparing your workspace...</p>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="size-4" />
        </Button>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border/60 bg-card px-3 py-4 shadow-xl">
            <div className="px-3 pb-6 pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Peblo</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">AI Notes</p>
            </div>
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  )
}
