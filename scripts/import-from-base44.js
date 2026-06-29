/**
 * Datamigrering: Base44 → Supabase
 *
 * Slik bruker du dette scriptet:
 * 1. Gå til future-vision.base44.app → Dine scenarier
 * 2. Åpne hvert scenario og klikk "Export Data"
 * 3. Lagre JSON-filene i en mappe, f.eks. ./base44-exports/
 * 4. Kjør: node scripts/import-from-base44.js
 *
 * Krev: SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY i .env.local
 */

const fs = require('fs')
const path = require('path')

// Last inn env-variabler
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role kan bypasse RLS
)

const USER_EMAIL = 'veslemoy.klavenes@gmail.com' // Din e-post i den nye appen
const EXPORTS_DIR = './base44-exports'

async function main() {
  // Finn bruker-ID
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users.find(u => u.email === USER_EMAIL)
  if (!user) {
    console.error(`Fant ikke bruker med e-post ${USER_EMAIL}. Er du registrert i den nye appen?`)
    process.exit(1)
  }

  console.log(`Importerer scenarier for ${USER_EMAIL} (${user.id})`)

  // Les alle JSON-filer
  if (!fs.existsSync(EXPORTS_DIR)) {
    console.error(`Mappen ${EXPORTS_DIR} finnes ikke. Opprett den og legg Base44-eksportene der.`)
    process.exit(1)
  }

  const files = fs.readdirSync(EXPORTS_DIR).filter(f => f.endsWith('.json'))
  console.log(`Fant ${files.length} eksportfiler`)

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(EXPORTS_DIR, file), 'utf8'))

    // Base44 eksportformat – tilpass hvis nødvendig
    const scenarioData = {
      user_id: user.id,
      title: raw.title || `Importert scenario`,
      category: raw.category || 'Transformation',
      scenario_text: raw.scenario_text || raw.scenarioText || raw.content || '',
      future_artifacts: raw.future_artifacts || raw.futureArtifacts || [],
      wizard_answers: raw.wizard_answers || raw.wizardAnswers || {},
      created_at: raw.created_at || raw.createdAt || new Date().toISOString(),
    }

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert(scenarioData)
      .select('id')
      .single()

    if (error) {
      console.error(`Feil ved import av ${file}:`, error.message)
      continue
    }

    // Importer action items
    const items = raw.action_plan || raw.actionPlan || raw.action_items || []
    if (items.length > 0) {
      await supabase.from('action_items').insert(
        items.map((item, i) => ({
          scenario_id: scenario.id,
          title: item.title || item.name || '',
          description: item.description || '',
          timeline: item.timeline || 'Next 30 days',
          priority: item.priority || 'medium',
          sub_tasks: item.sub_tasks || item.subTasks || [],
          completed: item.completed || false,
          sort_order: i,
        }))
      )
    }

    console.log(`✓ Importert: ${scenarioData.title}`)
  }

  console.log('\nFerdig!')
}

main().catch(console.error)
