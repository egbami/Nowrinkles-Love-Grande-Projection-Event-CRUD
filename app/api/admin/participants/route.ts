import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value
  return session === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page    = Math.max(1, Number(searchParams.get('page')  || 1))
    const limit   = Math.min(50, Number(searchParams.get('limit') || 20))
    const search  = searchParams.get('search') || ''
    const skip    = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { nom:      { contains: search, mode: 'insensitive' as const } },
            { prenom:   { contains: search, mode: 'insensitive' as const } },
            { whatsapp: { contains: search } },
          ],
        }
      : {}

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.participant.count({ where }),
    ])

    return NextResponse.json({
      participants,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[ADMIN PARTICIPANTS ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
