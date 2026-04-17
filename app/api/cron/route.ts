import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cette route est appelée par Vercel Cron toutes les 24h
// Elle renvoie les stats du jour et la liste des inscrits en JSON
// Le PDF est généré côté admin (voir dashboard) pour éviter les libs lourdes sur serverless
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
          id: true,
          prenom: true,
          nom: true,
          whatsapp: true,
          createdAt: true,
          verifie: true,
        },
      }),
    ])

    const rapport = {
      genereA: now.toISOString(),
      genereALocale: now.toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' }),
      totalInscrits: total,
      nouveauxAujourdHui,
      restants: Math.max(0, 200 - total),
      participants,
    }

    console.log(`[CRON] Rapport généré à ${rapport.genereALocale} — ${total} inscrits`)

    return NextResponse.json(rapport)
  } catch (err) {
    console.error('[CRON ERROR]', err)
    return NextResponse.json({ error: 'Erreur lors de la génération du rapport.' }, { status: 500 })
  }
}
