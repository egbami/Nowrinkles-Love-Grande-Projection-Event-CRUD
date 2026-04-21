import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  isRegistrationOpen,
  MAX_PARTICIPANTS,
  REGISTRATION_CLOSES_AT,
} from '@/lib/registration'

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
    if (now.getTime() > REGISTRATION_CLOSES_AT.getTime()) {
      return NextResponse.json({ error: 'Les inscriptions sont closes depuis le 31 mai 2026.' }, { status: 403 })
    }

    const total = await prisma.participant.count()
    if (!isRegistrationOpen(now, total)) {
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

  } catch (err: any) {
    console.error('[INSCRIPTION ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez dans quelques instants.', details: err.message }, { status: 500 })
  }
}
