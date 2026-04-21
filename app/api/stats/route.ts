import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRegistrationOpen, MAX_PARTICIPANTS, REGISTRATION_CLOSES_AT } from '@/lib/registration'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  let total = 0
  let error: string | null = null
  
  try {
    total = await prisma.participant.count()
  } catch (err: any) {
    console.error('[STATS DB ERROR]', err)
    error = err.message || String(err)
  }

  const now = new Date()
  const ouvert = isRegistrationOpen(now, total)

  return NextResponse.json({
    total,
    max:      MAX_PARTICIPANTS,
    restants: Math.max(0, MAX_PARTICIPANTS - total),
    ouvert:   error ? false : ouvert,
    error,
    debug: {
      now: now.toISOString(),
      closesAt: REGISTRATION_CLOSES_AT.toISOString(),
      isBefore: now.getTime() <= REGISTRATION_CLOSES_AT.getTime(),
      isUnderLimit: total < MAX_PARTICIPANTS
    }
  }, { headers: { 'Cache-Control': 'no-store' } })
}
