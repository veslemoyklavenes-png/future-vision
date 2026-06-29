import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy – Stories for the Future',
}

const lastUpdated = 'June 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-ink">Stories for the Future</Link>
        <Link href="/login" className="text-sm text-sage-deep font-medium hover:underline">Sign in</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-serif text-4xl text-ink mb-2">Privacy Policy</h1>
        <p className="text-ink-soft text-sm mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-ink-muted leading-relaxed">
          <section>
            <p>
              Stories for the Future (&ldquo;we&rdquo;, &ldquo;the app&rdquo;) helps you create personalized
              future scenarios. This policy explains what personal data we collect, why, where it is stored,
              and the rights you have over it. We aim to collect as little as possible.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Who is responsible</h2>
            <p>
              The data controller is the operator of Stories for the Future. For any privacy question or
              request, contact us at{' '}
              <a href="mailto:veslemoy.klavenes@gmail.com" className="text-sage-deep font-medium hover:underline">
                veslemoy.klavenes@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-ink">Account data:</strong> your email address, used to sign in and to send you your scenarios.</li>
              <li><strong className="text-ink">What you write:</strong> the answers you give in the generator — your values, your current situation, your future vision, and any optional personal details you choose to add (such as age, gender, location, relationship status, or children).</li>
              <li><strong className="text-ink">Generated content:</strong> the future artifacts, scenarios, action plans, and reflections created for you.</li>
            </ul>
            <p className="mt-3">
              You decide how much to share. The optional personal details can be left blank, and you should
              avoid entering information you do not wish to store.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Why we use it (legal basis)</h2>
            <p>
              We process your data to provide the service you asked for — creating and saving your scenarios
              (performance of a contract), and on the basis of your consent for the optional personal details
              you choose to add. We do not sell your data or use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Who processes your data</h2>
            <p>We rely on a small number of trusted service providers (&ldquo;sub-processors&rdquo;) to run the app:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong className="text-ink">Supabase</strong> — stores your account and your scenarios (database and authentication).</li>
              <li><strong className="text-ink">Anthropic</strong> — the AI that generates your scenarios. The answers you submit are sent to Anthropic&apos;s API to produce your results.</li>
              <li><strong className="text-ink">Vercel</strong> — hosts the application.</li>
              <li><strong className="text-ink">Resend</strong> — sends you email (for example, a copy of a scenario).</li>
            </ul>
            <p className="mt-3">
              Some of these providers are based in the United States, so your data may be processed outside the
              EEA under appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">How long we keep it</h2>
            <p>
              We keep your account and scenarios for as long as your account is active. If you delete your
              account, or ask us to, we delete your personal data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Your rights</h2>
            <p>
              Under the GDPR you have the right to access, correct, export, or delete your personal data, and to
              withdraw consent at any time. To exercise any of these, email us at{' '}
              <a href="mailto:veslemoy.klavenes@gmail.com" className="text-sage-deep font-medium hover:underline">
                veslemoy.klavenes@gmail.com
              </a>. You also have the right to lodge a complaint with your local data protection authority
              (in Norway, Datatilsynet).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Cookies</h2>
            <p>
              We use only the essential cookies needed to keep you signed in. We do not use advertising or
              tracking cookies.
            </p>
          </section>

          <section className="text-sm text-ink-soft border-t border-border pt-6">
            <p>
              This page is a general information notice, not legal advice. If you take on a larger number of
              users, consider having it reviewed by a professional.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sage-deep font-medium hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  )
}
