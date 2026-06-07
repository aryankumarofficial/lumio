import Link from 'next/link'
import { ArrowRight, FileText, Sparkles, ShieldCheck } from 'lucide-react'
import { Button } from '@repo/ui/components/button'

const highlights = [
  {
    icon: FileText,
    title: 'Notes that stay organized',
    description: 'Capture ideas, keep them searchable, and revisit work without losing context.',
  },
  {
    icon: Sparkles,
    title: 'AI summaries on demand',
    description: 'Turn long notes into clean summaries and action items when you need a faster read.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected dashboards',
    description: 'Only authenticated users can enter the workspace and manage private content.',
  },
]

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_38%),linear-gradient(180deg,var(--color-background),rgba(148,163,184,0.12))',
        }}
      />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-muted-foreground">Peblo</p>
          <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            A focused workspace for notes, insights, and AI summaries.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Peblo keeps the public homepage open, while dashboard routes stay behind authentication.
            Sign in to manage your notes or explore the app first.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Sign in
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card/85 p-6 shadow-lg shadow-black/5 backdrop-blur"
            >
              <div className="space-y-4">
                <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}