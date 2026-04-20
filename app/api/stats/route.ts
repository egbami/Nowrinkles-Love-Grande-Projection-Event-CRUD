import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRegistrationOpen, MAX_PARTICIPANTS } from '@/lib/registration'

export async function GET() {
  try {
    const total = await prisma.participant.count()
    const now   = new Date()
    const ouvert = isRegistrationOpen(now, total)

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
