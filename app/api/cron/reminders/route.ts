import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const REMINDER_AFTER_DAYS = 30
const MAX_PER_RUN = 50

const resend = new Resend(process.env.RESEND_API_KEY)

function reminderEmail(title: string, url: string, days: number) {
  return `
    <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
      <p style="font-size: 15px;">It has been ${days} days since you wrote <strong>${title}</strong>.</p>
      <p style="font-size: 15px;">
        Long enough that some of it will have happened, some of it won't, and some of it
        will have turned into something you didn't picture at all. That's usually the
        interesting part.
      </p>
      <p style="font-size: 15px;">
        There's a short reflection waiting on the scenario — three questions, a few minutes.
      </p>
      <p style="margin: 28px 0;">
        <a href="${url}" style="background: #4a6a5a; color: #fff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-family: sans-serif; font-size: 14px;">
          Open the scenario
        </a>
      </p>
      <p style="font-size: 13px; color: #94a3b8;">
        No rush, and no follow-up — this is the only reminder for this scenario.
      </p>
    </div>
  `
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without the secret
  // configured the route stays shut rather than becoming a public trigger.
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: due, error } = await supabase
    .from('scenarios')
    .select('id, user_id, title, created_at')
    .is('reflection', null)
    .is('reminder_sent_at', null)
    .lte('created_at', cutoff)
    .order('created_at')
    .limit(MAX_PER_RUN)

  if (error) {
    console.error('reminder query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  let sent = 0
  const failed: string[] = []

  for (const scenario of due ?? []) {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(scenario.user_id)
      const email = userData?.user?.email
      if (!email) {
        failed.push(scenario.id)
        continue
      }

      const days = Math.floor(
        (Date.now() - new Date(scenario.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/scenarios/${scenario.id}`

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: `Looking back at "${scenario.title}"`,
        html: reminderEmail(scenario.title, url, days),
      })

      // Stamped only after a successful send, so a failure is retried tomorrow
      // rather than silently swallowed.
      await supabase
        .from('scenarios')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', scenario.id)

      sent++
    } catch (err) {
      console.error('reminder failed for scenario', scenario.id, err)
      failed.push(scenario.id)
    }
  }

  return NextResponse.json({ due: due?.length ?? 0, sent, failed: failed.length })
}
