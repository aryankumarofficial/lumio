import { Navbar } from '../../components/shared/navbar'
import { Sidebar } from '../../components/shared/sidebar'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundImage: 'linear-gradient(180deg,var(--color-background),rgba(148,163,184,0.12))' }}
    >
      <Sidebar />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl pb-6">{children}</div>
        </main>
      </div>
    </div>
  )
}