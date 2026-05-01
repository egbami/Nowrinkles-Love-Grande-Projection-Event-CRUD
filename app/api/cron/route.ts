import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildDailyReportPdf,
  ensureReportsBucket,
  getReportFileName,
  REPORTS_BUCKET,
  REPORT_TIME_ZONE,
} from '@/lib/reporting'
import { getSupabaseAdmin } from '@/lib/supabase'

// Cette route est appelée par Vercel Cron toutes les 24h
// Elle génère et stocke un PDF quotidien avec l'état exact des inscrits au moment du passage du cron
export async function GET(req: NextRequest) {
  // Sécurise la route avec le secret cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const now = new Date()
    const debutJour = new Date(now)
    debutJour.setHours(0, 0, 0, 0)

    const [total, nouveauxAujourdHui, participants] = await Promise.all([
      prisma.participant.count(),
      prisma.participant.count({
        where: { createdAt: { gte: debutJour } },
      }),
      prisma.participant.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          prenom: true,
          nom: true,
          whatsapp: true,
          createdAt: true,
        },
      }),
    ])

    await ensureReportsBucket()
    const supabaseAdmin = getSupabaseAdmin()

    const pdf = await buildDailyReportPdf({
      generatedAt: now,
      participants,
    })

    const fileName = getReportFileName(now)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .upload(fileName, pdf, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const rapport = {
      genereA: now.toISOString(),
      genereALocale: now.toLocaleString('fr-FR', { timeZone: REPORT_TIME_ZONE }),
      totalInscrits: total,
      nouveauxAujourdHui,
      restants: Math.max(0, 200 - total),
      fichier: fileName,
      bucket: REPORTS_BUCKET,
    }

    console.log(`[CRON] Rapport PDF généré à ${rapport.genereALocale} — ${total} inscrits — ${fileName}`)

    return NextResponse.json(rapport)
  } catch (err) {
    console.error('[CRON ERROR]', err)
    return NextResponse.json({ error: 'Erreur lors de la génération du rapport.' }, { status: 500 })
  }
}
