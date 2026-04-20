import { NextRequest, NextResponse } from 'next/server'
import { getAdminPassword, getAdminSessionToken, isValidAdminPassword } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = getAdminPassword()

    if (!adminPassword) {
      return NextResponse.json({ error: 'ADMIN_PASSWORD non configuré.' }, { status: 503 })
    }

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis.' }, { status: 400 })
    }

    if (!isValidAdminPassword(password)) {
      // Délai artificiel pour ralentir le brute-force
      await new Promise((r) => setTimeout(r, 800))
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })

    // Cookie de session simple (httpOnly, secure en prod)
    response.cookies.set('admin_session', getAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 heures
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}
