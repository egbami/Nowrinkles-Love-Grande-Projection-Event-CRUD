import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Constantes métier ────────────────────────────────────────────────────────
const MAX_PARTICIPANTS = 200
const DATE_DEBUT       = new Date('2026-04-27T00:00:00.000Z')
const DATE_FIN         = new Date('2026-05-31T23:59:59.000Z')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prenom, nom, whatsapp } = body

    if (!prenom || !nom || !whatsapp) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
    }

    const prenomT   = String(prenom).trim()
    const nomT      = String(nom).trim()
    const whatsappT = String(whatsapp).trim()

    if (prenomT.length < 2 || nomT.length < 2) {
      return NextResponse.json({ error: 'Prénom et nom doivent contenir au moins 2 caractères.' }, { status: 400 })
    }

    const phoneRegex = /^\+?[\d\s\-().]{8,20}$/
    if (!phoneRegex.test(whatsappT)) {
      return NextResponse.json({ error: 'Numéro WhatsApp invalide.' }, { status: 400 })
    }

    const now = new Date()
    if (now < DATE_DEBUT) {
      return NextResponse.json({ error: 'Les inscriptions ne sont pas encore ouvertes. Rendez-vous le 27 avril 2026.' }, { status: 403 })
    }
    if (now > DATE_FIN) {
      return NextResponse.json({ error: 'Les inscriptions sont closes depuis le 31 mai 2026.' }, { status: 403 })
    }

    const total = await prisma.participant.count()
    if (total >= MAX_PARTICIPANTS) {
      return NextResponse.json({ error: 'Les 200 places sont prises. Les inscriptions sont closes.' }, { status: 403 })
    }

    const existant = await prisma.participant.findUnique({ where: { whatsapp: whatsappT } })
    if (existant) {
      return NextResponse.json({ error: `Ce numéro est déjà inscrit sous le nom ${existant.prenom} ${existant.nom}.` }, { status: 409 })
    }

    const participant = await prisma.participant.create({
      data: { prenom: prenomT, nom: nomT, whatsapp: whatsappT },
    })

    return NextResponse.json({ success: true, message: `Bienvenue, ${participant.prenom} !`, id: participant.id }, { status: 201 })

  } catch (err) {
    console.error('[INSCRIPTION ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez dans quelques instants.' }, { status: 500 })
  }
}
