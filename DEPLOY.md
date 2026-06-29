# Deploying Future Vision

## Oversikt
Appen deployes til Vercel og bruker Supabase (database + innlogging) og Anthropic API (AI).
Alle tjenester har gratis nivå som er mer enn nok til personlig bruk.

---

## Steg 1 – Lag Supabase-database (10 min)

1. Gå til [supabase.com](https://supabase.com) og opprett gratis konto
2. Klikk **New Project** → gi prosjektet et navn (f.eks. "future-vision") → velg region nær deg (Europe West)
3. Vent ~2 minutter mens databasen starter
4. Gå til **SQL Editor** (i venstre meny)
5. Klikk **New query**, lim inn innholdet fra `supabase/schema.sql`, og klikk **Run**
6. Gå til **Project Settings → API**
7. Kopier disse tre verdiene – du trenger dem i Steg 3:
   - **Project URL** → dette er `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → dette er `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (scroll ned) → dette er `SUPABASE_SERVICE_ROLE_KEY`

**Aktiver e-post bekreftelses-link:**
- Gå til **Authentication → Email Templates**
- Under **Confirm signup**, sett **Redirect URL** til `https://app.storiesforthefuture.com/dashboard`

---

## Steg 2 – Lag Anthropic API-nøkkel (5 min)

1. Gå til [console.anthropic.com](https://console.anthropic.com)
2. Logg inn eller opprett konto
3. Gå til **Settings → API Keys → Create Key**
4. Gi den et navn (f.eks. "future-vision") og kopier nøkkelen
   → dette er `ANTHROPIC_API_KEY`

Du trenger kreditter – minimum $5 er nok for mange hundre scenarier.

---

## Steg 3 – Lag Resend-konto for e-post (5 min)

1. Gå til [resend.com](https://resend.com) og opprett gratis konto
2. Gå til **API Keys → Create API Key**
   → dette er `RESEND_API_KEY`
3. Gå til **Domains** og legg til `storiesforthefuture.com`
4. Følg instruksjonene for å legge til DNS-poster hos din domene-leverandør
5. Når domenet er verifisert kan du sende fra `noreply@storiesforthefuture.com`

---

## Steg 4 – Lag GitHub-repo og last opp koden (10 min)

1. Gå til [github.com](https://github.com) og opprett gratis konto (hvis du ikke har)
2. Klikk **New repository** → gi det navnet `future-vision` → klikk **Create**
3. Åpne Terminal/PowerShell i mappen `PROJECTS/future-vision` og kjør:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/DITT_BRUKERNAVN/future-vision.git
   git push -u origin main
   ```
   (Bytt ut DITT_BRUKERNAVN med ditt GitHub-brukernavn)

---

## Steg 5 – Deploy på Vercel (5 min)

1. Gå til [vercel.com](https://vercel.com) og logg inn med GitHub-kontoen din
2. Klikk **Add New → Project**
3. Velg `future-vision`-repoet ditt og klikk **Import**
4. Under **Environment Variables**, legg til disse (fra Steg 1-3):

   | Variabel | Verdi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Din Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Din Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Din Supabase service role key |
   | `ANTHROPIC_API_KEY` | Din Anthropic API-nøkkel |
   | `RESEND_API_KEY` | Din Resend API-nøkkel |
   | `RESEND_FROM_EMAIL` | `noreply@storiesforthefuture.com` |
   | `NEXT_PUBLIC_APP_URL` | `https://app.storiesforthefuture.com` |

5. Klikk **Deploy** – Vercel bygger appen automatisk

---

## Steg 6 – Koble til subdomene (10 min)

1. I Vercel-prosjektet ditt, gå til **Settings → Domains**
2. Legg til `app.storiesforthefuture.com`
3. Vercel gir deg en CNAME-post, f.eks.: `cname.vercel-dns.com`
4. Logg inn hos din DNS-leverandør (Namecheap, GoDaddy, o.l.) og legg til:
   - **Type:** CNAME
   - **Name:** app
   - **Value:** cname.vercel-dns.com
5. Vent 5-30 minutter til DNS propagerer
6. Appen er nå tilgjengelig på `https://app.storiesforthefuture.com`

---

## Steg 7 – Datamigrering fra Base44

1. Gå til [future-vision.base44.app](https://future-vision.base44.app)
2. Åpne hvert scenario og klikk **Export Data** – lagre JSON-filene
3. Opprett mappen `base44-exports/` i prosjektmappen og legg filene der
4. Installer dotenv: `npm install dotenv`
5. Kjør: `node scripts/import-from-base44.js`
6. Scenariene dine er nå i den nye databasen!

---

## Videre utvikling

Når du vil gjøre endringer:
1. Rediger filene lokalt
2. `git add . && git commit -m "Endring" && git push`
3. Vercel deployer automatisk innen ~1 minutt
