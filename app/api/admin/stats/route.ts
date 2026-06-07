import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAdmin(req: NextRequest) {
  return isAdminSession(req.cookies.get('admin_session')?.value)
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const [total, confirmed] = await Promise.all([
      prisma.participant.count(),
      prisma.participant.count({ where: { verifie: true } }),
    ])

    return NextResponse.json({
      total,
      confirmed,
      pending: Math.max(0, total - confirmed),
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
