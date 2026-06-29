'use client'
import { Button } from '@/components/ui/button'
import { FileDown, Mail, Database } from 'lucide-react'
import { useState } from 'react'

export default function ExportButtons({ scenarioId, userEmail }: { scenarioId: string; userEmail: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function sendEmail() {
    setSending(true)
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId, email: userEmail }),
    })
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  async function exportPdf() {
    const res = await fetch(`/api/scenarios/${scenarioId}/pdf`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scenario-${scenarioId.slice(0, 8)}.pdf`
    a.click()
  }

  async function exportData() {
    const res = await fetch(`/api/scenarios/${scenarioId}`)
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scenario-${scenarioId.slice(0, 8)}.json`
    a.click()
  }

  return (
    <div className="flex justify-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={exportPdf} className="gap-1">
        <FileDown size={14} /> Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={exportData} className="gap-1">
        <Database size={14} /> Export Data
      </Button>
      <Button size="sm" onClick={sendEmail} disabled={sending || sent} className="bg-sage-deep hover:bg-sage-deeper text-white gap-1">
        <Mail size={14} /> {sent ? 'Sent!' : sending ? 'Sending…' : 'Send to my email'}
      </Button>
    </div>
  )
}
