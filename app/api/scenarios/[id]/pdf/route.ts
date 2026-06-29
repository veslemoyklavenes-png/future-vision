import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Minimal markdown → HTML: **bold**, *italic*, and paragraph breaks.
function renderText(raw: string) {
  return escapeHtml(raw)
    .split(/\n{2,}/)
    .map(block =>
      `<p>${block
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>')}</p>`
    )
    .join('\n')
}

interface ActionItem {
  title: string
  description: string
  timeline: string
  priority: string
  sub_tasks: string[]
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('*, action_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!scenario) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const created = scenario.created_at
    ? new Date(scenario.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const actionItems: ActionItem[] = (scenario.action_items ?? []).sort(
    (a: { sort_order?: number }, b: { sort_order?: number }) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )

  const artifacts: { type: string; title: string; content: string }[] = scenario.future_artifacts ?? []

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(scenario.title ?? 'Scenario')}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    color: #33312C;
    background: #fff;
    margin: 0;
    padding: 48px 56px;
    line-height: 1.6;
  }
  h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 34px; margin: 0 0 6px; color: #33312C; font-weight: 600; }
  h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: #4A6B58; margin: 32px 0 10px; font-weight: 600; }
  h3 { font-size: 15px; margin: 0 0 2px; color: #33312C; }
  .meta { color: #6B6760; font-size: 13px; margin-bottom: 4px; }
  .badge { display:inline-block; background:#E7EDE7; color:#3B4A41; border-radius:999px; padding:2px 12px; font-size:12px; margin-bottom:24px; }
  p { margin: 0 0 12px; }
  .artifact { border:1px solid #E2DED4; border-radius:10px; padding:14px 16px; margin-bottom:12px; background:#FAF8F2; }
  .artifact .type { font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:#4A6B58; font-weight:500; }
  .action { margin-bottom:18px; padding-left:14px; border-left:3px solid #A9C8B8; }
  .action .line { font-size:12px; color:#6B6760; margin:2px 0 6px; }
  ul { margin:6px 0 0; padding-left:18px; }
  li { font-size:13px; color:#5A574F; margin-bottom:2px; }
  .footer { margin-top:40px; padding-top:14px; border-top:1px solid #E2DED4; color:#9A958C; font-size:12px; text-align:center; }
  @media print {
    body { padding: 0; }
    .noprint { display: none !important; }
    h2 { break-after: avoid; }
    .artifact, .action { break-inside: avoid; }
  }
  .printbar { position: sticky; top: 0; background:#4A6B58; color:#fff; padding:12px 16px; border-radius:8px; margin-bottom:28px; display:flex; justify-content:space-between; align-items:center; }
  .printbar button { background:#fff; color:#3E5A4A; border:0; border-radius:6px; padding:8px 16px; font-size:14px; font-weight:600; cursor:pointer; }
</style>
</head>
<body>
  <div class="printbar noprint">
    <span>Use “Save as PDF” in the print dialog to download this scenario.</span>
    <button onclick="window.print()">Save as PDF</button>
  </div>

  <h1>${escapeHtml(scenario.title ?? 'Your Scenario')}</h1>
  ${created ? `<div class="meta">Created ${created}</div>` : ''}
  ${scenario.category ? `<span class="badge">${escapeHtml(scenario.category)}</span>` : ''}

  <h2>Future Scenario</h2>
  ${renderText(scenario.scenario_text ?? '')}

  ${actionItems.length ? `<h2>Action Plan</h2>${actionItems.map(item => `
    <div class="action">
      <h3>${escapeHtml(item.title ?? '')}</h3>
      <div class="line">${escapeHtml(item.timeline ?? '')} · Priority: ${escapeHtml(item.priority ?? '')}</div>
      <p>${escapeHtml(item.description ?? '')}</p>
      ${item.sub_tasks?.length ? `<ul>${item.sub_tasks.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    </div>`).join('')}` : ''}

  ${artifacts.length ? `<h2>Future Artifacts</h2>${artifacts.map(a => `
    <div class="artifact">
      <div class="type">${escapeHtml(a.type ?? '')}</div>
      <h3>${escapeHtml(a.title ?? '')}</h3>
      <p>${escapeHtml(a.content ?? '')}</p>
    </div>`).join('')}` : ''}

  <div class="footer">Stories for the Future — see your future, then build it.</div>

  <script>
    // Open the print dialog automatically once fonts have settled.
    window.addEventListener('load', () => setTimeout(() => window.print(), 600));
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
