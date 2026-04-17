import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_PARTICIPANTS = 200
const DATE_DEBUT       = new Date('2026-04-27T00:00:00.000Z')
const DATE_FIN         = new Date('2026-05-31T23:59:59.000Z')

export async function GET() {
  try {
    const total = await prisma.participant.count()
    const now   = new Date()
    const ouvert = now >= DATE_DEBUT && now <= DATE_FIN && total < MAX_PARTICIPANTS

    return NextResponse.json({
      total,
      max:      MAX_PARTICIPANTS,
      restants: Math.max(0, MAX_PARTICIPANTS - total),
      ouvert,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[STATS ERROR]', err)
    return NextResponse.json(
      { total: 0, max: MAX_PARTICIPANTS, restants: MAX_PARTICIPANTS, ouvert: false },
      { status: 500 }
    )
  }
}
