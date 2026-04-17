'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface Participant {
  id: string
  prenom: string
  nom: string
  whatsapp: string
  createdAt: string
  verifie: boolean
  verifieAt: string | null
}

interface PageData {
  participants: Participant[]
  total: number
  page: number
  totalPages: number
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    timeZone: 'Africa/Porto-Novo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPOSANT LOGIN
═══════════════════════════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion.')
      } else {
        onLogin()
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-16 h-16 mb-4">
            <Image src="/logo.png" alt="Nowrinkles Love" fill className="object-contain" />
          </div>
          <p className="font-source text-xs tracking-[0.35em] uppercase" style={{ color: 'var(--lavender)' }}>
            Espace administrateur
          </p>
        </div>

        <h1
          className="font-playfair font-bold text-3xl mb-8 text-center"
          style={{ color: 'var(--graphite)' }}
        >
          Connexion
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="password"
              className="block font-source text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: 'var(--graphite)' }}
            >
              Mot de passe admin
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-field"
            />
          </div>

          {error && (
            <p className="font-source text-sm" style={{ color: '#e57373' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Connexion…</span>
              </>
            ) : (
              <>
                <span>Accéder au dashboard</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPOSANT DASHBOARD
═══════════════════════════════════════════════════════════════════════════════ */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [data, setData]         = useState<PageData | null>(null)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchParticipants = useCallback(async (searchVal: string, pageVal: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:   String(pageVal),
        limit:  '20',
        search: searchVal,
      })
      const res  = await fetch(`/api/admin/participants?${params}`)
      if (res.status === 401) {
        onLogout()
        return
      }
      const json = await res.json()
      setData(json)
      if (!searchVal) setTotal(json.total)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => {
    fetchParticipants(search, page)
    const interval = setInterval(() => fetchParticipants(search, page), 30_000)
    return () => clearInterval(interval)
  }, [fetchParticipants, search, page])

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchParticipants(val, 1), 400)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    onLogout()
  }

  const exportCSV = () => {
    window.open('/api/admin/export-csv', '_blank')
  }

  const generatePDF = async () => {
    setPdfLoading(true)
    try {
      // Récupère tous les participants pour le PDF
      const res  = await fetch('/api/admin/participants?limit=200&page=1')
      const json = await res.json()
      const allParticipants: Participant[] = json.participants

      // Import dynamique jsPDF pour éviter le bundle côté serveur
      const { jsPDF } = await import('jspdf')
      // @ts-ignore
      await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const now = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })

      // En-tête
      doc.setFillColor(28, 28, 46)
      doc.rect(0, 0, 210, 40, 'F')

      doc.setTextColor(255, 255, 228)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('LA GRANDE PROJECTION', 14, 16)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(146, 169, 225)
      doc.text('Nowrinkles Love · Rapport des participants', 14, 24)
      doc.text(`Généré le ${now}`, 14, 31)
      doc.text(`Total : ${allParticipants.length} inscrits sur 200`, 14, 38)

      // Tableau
      const tableData = allParticipants.map((p, i) => [
        String(i + 1),
        p.prenom,
        p.nom,
        p.whatsapp,
        formatDate(p.createdAt),
        p.verifie ? '✓' : '—',
      ])

      // @ts-ignore
      doc.autoTable({
        startY: 48,
        head:   [['#', 'Prénom', 'Nom', 'WhatsApp', "Date d'inscription", 'Vérifié']],
        body:   tableData,
        styles: {
          font:      'helvetica',
          fontSize:  9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor:  [201, 162, 39],
          textColor:  [28, 28, 46],
          fontStyle:  'bold',
        },
        alternateRowStyles: {
          fillColor: [255, 255, 238],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          5: { cellWidth: 18, halign: 'center' },
        },
      })

      // Pied de page
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(150)
        doc.text(
          `Page ${i}/${pageCount} — Nowrinkles Love 2026`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        )
      }

      const dateStr = new Date().toISOString().slice(0, 10)
      doc.save(`participants-nowrinkles-${dateStr}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la génération du PDF. Assurez-vous que jspdf et jspdf-autotable sont installés.')
    } finally {
      setPdfLoading(false)
    }
  }

  const MAX = 200
  const pct = total > 0 ? Math.round((total / MAX) * 100) : 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b"
        style={{
          background:   'rgba(255,255,228,0.92)',
          backdropFilter: 'blur(12px)',
          borderColor:  'rgba(28,28,46,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>
          <div>
            <p className="font-playfair font-bold text-sm" style={{ color: 'var(--graphite)' }}>
              Dashboard Admin
            </p>
            <p className="font-source text-xs" style={{ color: 'var(--muted)' }}>
              La Grande Projection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bouton CSV */}
          <button
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 font-source text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 hover:border-gold"
            style={{ borderColor: 'rgba(28,28,46,0.2)', color: 'var(--graphite)' }}
          >
            ↓ CSV
          </button>

          {/* Bouton PDF */}
          <button
            onClick={generatePDF}
            disabled={pdfLoading}
            className="hidden sm:flex items-center gap-2 font-source text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 hover:border-gold"
            style={{ borderColor: 'rgba(28,28,46,0.2)', color: 'var(--graphite)' }}
          >
            {pdfLoading ? (
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : '↓'} PDF
          </button>

          <button
            onClick={handleLogout}
            className="font-source text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200 hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-10 max-w-6xl mx-auto">

        {/* ─── Statistiques ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Inscrits', value: total,        color: 'var(--graphite)' },
            { label: 'Places restantes', value: Math.max(0, MAX - total), color: 'var(--lavender)' },
            { label: 'Capacité', value: `${pct}%`,   color: 'var(--gold)' },
            { label: 'Maximum',  value: MAX,           color: 'var(--muted)' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-5 border"
              style={{ borderColor: 'rgba(28,28,46,0.08)', background: 'rgba(255,255,228,0.6)' }}
            >
              <p className="font-source text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
                {label}
              </p>
              <p className="font-playfair font-bold text-3xl" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Barre de progression globale */}
        <div className="mb-10">
          <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(28,28,46,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct > 80
                  ? 'linear-gradient(90deg, var(--gold), #e57373)'
                  : 'linear-gradient(90deg, var(--lavender), var(--gold))',
              }}
            />
          </div>
          <div className="flex justify-between font-source text-xs" style={{ color: 'var(--muted)' }}>
            <span>0 inscrits</span>
            <span>{pct}% rempli</span>
            <span>200 max</span>
          </div>
        </div>

        {/* ─── Recherche + actions mobile ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou WhatsApp…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field flex-1"
          />

          {/* Actions sur mobile */}
          <div className="flex gap-2 sm:hidden">
            <button
              onClick={exportCSV}
              className="flex-1 btn-primary text-xs py-2.5 px-3"
            >
              ↓ CSV
            </button>
            <button
              onClick={generatePDF}
              disabled={pdfLoading}
              className="flex-1 btn-primary text-xs py-2.5 px-3"
            >
              ↓ PDF
            </button>
          </div>
        </div>

        {/* ─── Tableau ─────────────────────────────────────────────────── */}
        <div
          className="border overflow-hidden"
          style={{ borderColor: 'rgba(28,28,46,0.1)' }}
        >
          {/* En-tête tableau */}
          <div
            className="grid grid-cols-12 px-4 py-3 font-source text-xs tracking-widest uppercase"
            style={{
              background: 'var(--graphite)',
              color: 'var(--bg)',
            }}
          >
            <div className="col-span-1">#</div>
            <div className="col-span-3">Prénom</div>
            <div className="col-span-3">Nom</div>
            <div className="col-span-3 hidden md:block">WhatsApp</div>
            <div className="col-span-2 hidden md:block">Date</div>
          </div>

          {/* Lignes */}
          {loading ? (
            <div className="py-20 text-center">
              <div
                className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--lavender)', borderTopColor: 'transparent' }}
              />
              <p className="mt-3 font-source text-xs" style={{ color: 'var(--muted)' }}>
                Chargement…
              </p>
            </div>
          ) : !data?.participants ? (
            <div className="py-20 text-center">
              <p className="font-playfair text-xl mb-2" style={{ color: '#e57373' }}>
                Erreur de Chargement
              </p>
              <p className="font-source text-sm" style={{ color: 'var(--muted)' }}>
                Les données n'ont pas pu être récupérées. Vérifiez vos variables d'environnement sur Vercel (DATABASE_URL) !
              </p>
            </div>
          ) : data.participants.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-playfair text-xl mb-2" style={{ color: 'var(--graphite)' }}>
                Aucun résultat
              </p>
              <p className="font-source text-sm" style={{ color: 'var(--muted)' }}>
                {search ? 'Aucun participant ne correspond à cette recherche.' : 'Aucun inscrit pour le moment.'}
              </p>
            </div>
          ) : (
            data?.participants.map((p, i) => (
              <div
                key={p.id}
                className="grid grid-cols-12 px-4 py-3.5 border-b font-source text-sm transition-colors duration-150 hover:bg-lavender/5"
                style={{
                  borderColor: 'rgba(28,28,46,0.05)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(146,169,225,0.03)',
                }}
              >
                <div className="col-span-1 font-bold" style={{ color: 'var(--muted)' }}>
                  {((data.page - 1) * 20) + i + 1}
                </div>
                <div className="col-span-3 font-semibold" style={{ color: 'var(--graphite)' }}>
                  {p.prenom}
                </div>
                <div className="col-span-3" style={{ color: 'var(--graphite)' }}>
                  {p.nom}
                </div>
                <div className="col-span-3 hidden md:block" style={{ color: 'var(--muted)' }}>
                  {p.whatsapp}
                </div>
                <div className="col-span-2 hidden md:block text-xs" style={{ color: 'var(--muted)' }}>
                  {formatDate(p.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── Pagination ──────────────────────────────────────────────── */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-source text-xs tracking-widest uppercase px-4 py-2 border disabled:opacity-30 transition-all duration-200 hover:border-graphite"
              style={{ borderColor: 'rgba(28,28,46,0.2)', color: 'var(--graphite)' }}
            >
              ← Précédent
            </button>

            <span className="font-source text-xs" style={{ color: 'var(--muted)' }}>
              Page {page} / {data.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="font-source text-xs tracking-widest uppercase px-4 py-2 border disabled:opacity-30 transition-all duration-200 hover:border-graphite"
              style={{ borderColor: 'rgba(28,28,46,0.2)', color: 'var(--graphite)' }}
            >
              Suivant →
            </button>
          </div>
        )}

        {/* ─── Note cron ───────────────────────────────────────────────── */}
        <div
          className="mt-12 p-5 border"
          style={{
            borderColor: 'rgba(146,169,225,0.3)',
            background: 'rgba(146,169,225,0.04)',
          }}
        >
          <p className="font-source text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--lavender)' }}>
            ✦ Rapport automatique
          </p>
          <p className="font-source text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Un rapport est généré automatiquement chaque jour à <strong style={{ color: 'var(--graphite)' }}>06h00</strong> par le cron Vercel.
            Vous pouvez aussi générer manuellement un PDF ou un CSV via les boutons en haut de page.
            Le tableau ci-dessus se rafraîchit automatiquement toutes les 30 secondes.
          </p>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE ADMIN
═══════════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  // Vérifie si déjà connecté (cookie)
  useEffect(() => {
    fetch('/api/admin/participants?page=1&limit=1')
      .then((r) => {
        setAuthenticated(r.status !== 401)
      })
      .catch(() => setAuthenticated(false))
  }, [])

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--lavender)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />
  }

  return <Dashboard onLogout={() => setAuthenticated(false)} />
}
