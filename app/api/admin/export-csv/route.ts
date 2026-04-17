import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const participants = await prisma.participant.findMany({
      orderBy: { createdAt: 'asc' },
    })

    const header = 'ID,Prénom,Nom,WhatsApp,Date inscription,Vérifié,Date vérification\n'

    const rows = participants
      .map((p) => {
        const dateInscription = new Date(p.createdAt).toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })
        const dateVerif = p.verifieAt
          ? new Date(p.verifieAt).toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })
          : ''
        return [
          p.id,
          `"${p.prenom}"`,
          `"${p.nom}"`,
          `"${p.whatsapp}"`,
          `"${dateInscription}"`,
          p.verifie ? 'Oui' : 'Non',
          `"${dateVerif}"`,
        ].join(',')
      })
      .join('\n')

    const csv = '\uFEFF' + header + rows // BOM pour Excel

    const now = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="participants-nowrinkles-${now}.csv"`,
      },
    })
  } catch (err) {
    console.error('[CSV EXPORT ERROR]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'export.' }, { status: 500 })
  }
}
