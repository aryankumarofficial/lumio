import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle_at_top_left,rgba(17,24,39,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_40%),linear-gradient(to_bottom_right,var(--color-background),var(--color-accent))',
      }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}