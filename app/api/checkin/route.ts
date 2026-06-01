import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeWhatsAppNumber } from '@/lib/phone'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { whatsapp, nom } = body

    if (!whatsapp || !nom) {
      return NextResponse.json({ error: 'Le numéro WhatsApp et le nom sont requis.' }, { status: 400 })
    }

    const whatsappT = normalizeWhatsAppNumber(whatsapp)
    const nomT = String(nom).trim()
    
    if (!whatsappT) {
      return NextResponse.json({ error: 'Numéro WhatsApp invalide.' }, { status: 400 })
    }

    // Chercher le participant
    const participant = await prisma.participant.findFirst({
      where: { whatsapp: whatsappT },
      orderBy: { createdAt: 'asc' },
    })

    if (!participant) {
      return NextResponse.json({ 
        error: 'Ce numéro n\'est pas sur la liste des inscrits. Veuillez vous rapprocher de l\'administration.' 
      }, { status: 404 })
    }

    // Sécurité : vérifier que le nom correspond (insensible à la casse)
    if (participant.nom.toLowerCase() !== nomT.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Les informations ne correspondent pas à nos registres.' 
      }, { status: 403 })
    }

    // Vérifier s'il est déjà pointé
    if (participant.verifie) {
      return NextResponse.json({ 
        alreadyCheckedIn: true, 
        message: `Bonjour ${participant.prenom}, vous êtes déjà enregistré(e) comme présent(e) !` 
      }, { status: 200 })
    }

    // Mettre à jour le statut
    const updatedParticipant = await prisma.participant.update({
      where: { id: participant.id },
      data: { 
        verifie: true,
        verifieAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Bienvenue ${updatedParticipant.prenom} ! Votre présence est confirmée.` 
    }, { status: 200 })

  } catch (err: any) {
    console.error('[CHECKIN ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez dans quelques instants.' }, { status: 500 })
  }
}
