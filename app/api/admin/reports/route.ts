import { NextRequest, NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { ensureReportsBucket, REPORTS_BUCKET } from '@/lib/reporting'
import { getSupabaseAdmin } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  return isAdminSession(req.cookies.get('admin_session')?.value)
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    await ensureReportsBucket()

    const { data, error } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      throw error
    }

    const reports = await Promise.all(
      (data || []).map(async (file) => {
        const { data: signed, error: signedError } = await supabaseAdmin.storage
          .from(REPORTS_BUCKET)
          .createSignedUrl(file.name, 60 * 30)

        if (signedError) {
          throw signedError
        }

        return {
          name: file.name,
          createdAt: file.created_at,
          updatedAt: file.updated_at,
          size: file.metadata?.size || 0,
          downloadUrl: signed.signedUrl,
        }
      })
    )

    return NextResponse.json({ reports })
  } catch (err) {
    console.error('[ADMIN REPORTS ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
