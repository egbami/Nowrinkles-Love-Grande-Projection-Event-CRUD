
import { getSupabaseAdmin } from '@/lib/supabase'

export const REPORTS_BUCKET = process.env.REPORTS_BUCKET || 'daily-reports'
export const REPORT_TIME_ZONE = 'Africa/Porto-Novo'

export type ReportParticipant = {
  prenom: string
  nom: string
  whatsapp: string
  createdAt: Date | string
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString('fr-FR', {
    timeZone: REPORT_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getLocalDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value || '0000'
  const month = parts.find((part) => part.type === 'month')?.value || '00'
  const day = parts.find((part) => part.type === 'day')?.value || '00'

  return { year, month, day }
}

export function getReportFileName(date: Date) {
  const { year, month, day } = getLocalDateParts(date)
  return `rapport-inscriptions-${year}-${month}-${day}.pdf`
}

export async function ensureReportsBucket() {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage.getBucket(REPORTS_BUCKET)
  if (!error && data) return

  const { error: createError } = await supabaseAdmin.storage.createBucket(REPORTS_BUCKET, {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
  })

  if (createError && !createError.message.toLowerCase().includes('already')) {
    throw createError
  }
}

export async function buildDailyReportPdf(params: {
  generatedAt: Date
  participants: ReportParticipant[]
}) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const { generatedAt, participants } = params
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const generatedAtLocal = formatDateTime(generatedAt)

  doc.setFillColor(28, 28, 46)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 228)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LA GRANDE PROJECTION', 14, 16)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(146, 169, 225)
  doc.text('Nowrinkles Love · Rapport quotidien des inscrits', 14, 24)
  doc.text(`Genere le ${generatedAtLocal}`, 14, 31)
  doc.text(`Total : ${participants.length} inscrits`, 14, 38)

  autoTable(doc, {
    startY: 48,
    head: [['#', 'Prenom', 'Nom', 'WhatsApp', "Date d'inscription"]],
    body: participants.map((participant, index) => [
      String(index + 1),
      participant.prenom,
      participant.nom,
      participant.whatsapp,
      formatDateTime(participant.createdAt),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [201, 162, 39],
      textColor: [28, 28, 46],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [255, 255, 238],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 42 },
    },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text(
      `Page ${page}/${pageCount} — Nowrinkles Love 2026`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  return Buffer.from(doc.output('arraybuffer'))
}
