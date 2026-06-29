import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MapPin, Compass, Layers, Eye, ArrowRight, Brain } from 'lucide-react'

const steps = [
  {
    icon: MapPin,
    title: 'Describe today',
    body: 'Start where you are — your situation, your challenges, the things that matter to you. In your own words.',
  },
  {
    icon: Compass,
    title: 'Imagine forward',
    body: 'Picture where you would love to be. A year from now, three, five — you choose the horizon.',
  },
  {
    icon: Layers,
    title: 'Choose your artifacts',
    body: 'See glimpses of that future — a headline, a message, a milestone. Pick the ones that resonate.',
  },
  {
    icon: Eye,
    title: 'See your scenario — then adjust',
    body: 'A vivid, dated story of your future and a plan to get there. Not quite right? Tweak it and try again until it feels true.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/50 to-cream text-ink">
      {/* Nav */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-serif text-xl text-ink">Stories for the Future</span>
        <Link href="/login" className="text-sm text-sage-deep font-medium hover:underline">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-ink mb-6">
          See your future.
          <br />
          Then build it.
        </h1>
        <p className="text-lg md:text-xl text-ink-muted leading-relaxed max-w-2xl mx-auto mb-10">
          Try on the life you want before you live it. Describe where you are, imagine where
          you&apos;d love to be, and watch a vivid future scenario take shape — then adjust until it
          feels right. The clearer you can see it, the more likely you are to get there.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-sage-deep hover:bg-sage-deeper text-white px-8')}
          >
            Start your first story <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'border-sage-mid text-ink px-8')}
          >
            Sign in
          </Link>
        </div>
        <p className="text-sm text-ink-soft mt-4">Takes about 2–3 minutes to create your first scenario.</p>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl text-center text-ink mb-3">How it works</h2>
        <p className="text-center text-ink-muted mb-12 max-w-xl mx-auto">
          A short, guided journey from where you are to a future you can actually picture.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex gap-4">
              <div className="shrink-0 w-11 h-11 rounded-full bg-sage-light flex items-center justify-center">
                <Icon size={20} className="text-sage-deep" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-sage-deep">Step {i + 1}</span>
                </div>
                <h3 className="font-serif text-xl text-ink mb-1">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why it works — the science */}
      <section className="bg-card border-y border-border">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center gap-2 text-sage-deep mb-4">
            <Brain size={22} />
            <span className="text-sm font-medium uppercase tracking-wide">The science, not the magic</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-center text-ink mb-6">
            Why imagining your future actually works
          </h2>
          <div className="space-y-5 text-ink-muted leading-relaxed text-lg">
            <p>
              This isn&apos;t manifestation or wishful thinking. It&apos;s how your brain already works.
            </p>
            <p>
              Your <strong className="text-ink">reticular activating system</strong> — the RAS — filters
              the flood of information around you every moment and surfaces what you&apos;ve told it
              matters. When you describe a future in vivid, specific detail, you prime your attention to
              notice the people, the openings, and the small next steps that lead there.
            </p>
            <p>
              <strong className="text-ink">Neurons that fire together, wire together.</strong> The more
              clearly and often you can see where you want to be, the more your mind quietly starts
              spotting the path — and the more real it becomes.
            </p>
          </div>

          {/* Reflection / experience */}
          <figure className="mt-12 border-l-4 border-sage pl-6 py-2">
            <blockquote className="font-serif text-2xl text-ink leading-snug italic">
              &ldquo;A scenario I generated back in spring is, a few months later, more or less my
              reality — without me consciously chasing it. I&apos;d simply seen it clearly, and started
              noticing the way there.&rdquo;
            </blockquote>
            <figcaption className="text-sm text-ink-soft mt-3">— From the maker of Stories for the Future</figcaption>
          </figure>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl text-ink mb-5">Ready to see where you could be?</h2>
        <p className="text-ink-muted text-lg mb-8">
          Create your first future scenario today. Adjust it as many times as you like — it&apos;s
          your story to shape.
        </p>
        <Link
          href="/signup"
          className={cn(buttonVariants({ size: 'lg' }), 'bg-sage-deep hover:bg-sage-deeper text-white px-10')}
        >
          Start your first story <ArrowRight size={16} className="ml-2" />
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-ink-soft">
          Stories for the Future — see your future, then build it.
          <span className="mx-2">·</span>
          <Link href="/privacy" className="text-sage-deep hover:underline">Privacy</Link>
        </div>
      </footer>
    </div>
  )
}
