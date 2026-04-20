import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminSession } from '@/lib/admin-auth'

function isAdmin(req: NextRequest) {
  return isAdminSession(req.cookies.get('admin_session')?.value)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const verifie = Boolean(body.verifie)

    const participant = await prisma.participant.update({
      where: { id: params.id },
      data: {
        verifie,
        verifieAt: verifie ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, participant })
  } catch (err) {
    console.error('[ADMIN PARTICIPANT PATCH ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const participant = await prisma.participant.delete({
      where: { id: params.id },
      select: {
        id: true,
        prenom: true,
        nom: true,
        whatsapp: true,
      },
    })

    return NextResponse.json({ success: true, participant })
  } catch (err) {
    console.error('[ADMIN PARTICIPANT DELETE ERROR]', err)
    return NextResponse.json({ error: 'Suppression impossible.' }, { status: 500 })
  }
}
