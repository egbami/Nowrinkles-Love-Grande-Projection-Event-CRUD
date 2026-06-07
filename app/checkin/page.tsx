'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const PHONE_FORMAT = /^\+229 01\d{8}$/

export default function CheckinPage() {
  const [whatsapp, setWhatsapp] = useState('')
  const [nom, setNom] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{type: 'success' | 'info' | 'error', message: string} | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) return

    const normalizedWhatsapp = whatsapp.trim()
    if (!PHONE_FORMAT.test(normalizedWhatsapp)) {
      setResult({
        type: 'error',
        message: 'Le numéro doit obligatoirement être au format +229 01XXXXXXXX.',
      })
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsapp: normalizedWhatsapp, nom }),
      })
      
      const data = await res.json()

      if (!res.ok) {
        setResult({ type: 'error', message: data.error || 'Erreur lors du check-in.' })
        return
      }

      if (data.alreadyCheckedIn) {
        setResult({ type: 'info', message: data.message })
      } else {
        setResult({ type: 'success', message: data.message })
        setWhatsapp('')
        setNom('')
      }
    } catch {
      setResult({ type: 'error', message: 'Erreur réseau. Reessayez dans quelques instants.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-20 h-20 mb-4">
            <Image src="/logo.png" alt="Nowrinkles Love" fill className="object-contain" />
          </div>
          <p className="font-source text-xs tracking-[0.35em] uppercase text-center" style={{ color: 'var(--lavender)' }}>
            Check-in Automatique
          </p>
        </div>

        <h1
          className="font-playfair font-bold text-3xl mb-4 text-center"
          style={{ color: 'var(--graphite)' }}
        >
          Confirmez votre présence
        </h1>
        <p className="font-source text-sm text-center mb-8" style={{ color: 'var(--muted)' }}>
          Entrez votre nom et le numéro WhatsApp utilisé lors de votre inscription pour accéder à l&apos;événement.
          Le numéro doit obligatoirement être au format <strong style={{ color: 'var(--graphite)' }}>+229 01XXXXXXXX</strong>.
        </p>

        {result && (
          <div 
            className="mb-6 p-4 border text-center font-source text-sm"
            style={{ 
              backgroundColor: result.type === 'error' ? 'rgba(229,115,115,0.1)' : result.type === 'success' ? 'rgba(201,162,39,0.1)' : 'rgba(146,169,225,0.1)',
              borderColor: result.type === 'error' ? '#e57373' : result.type === 'success' ? 'var(--gold)' : 'var(--lavender)',
              color: result.type === 'error' ? '#e57373' : 'var(--graphite)'
            }}
          >
            {result.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="nom"
              className="block font-source text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: 'var(--graphite)' }}
            >
              Votre Nom
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Dupont"
              className="input-field"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label
              htmlFor="whatsapp"
              className="block font-source text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: 'var(--graphite)' }}
            >
              Numéro WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              pattern="\+229 01[0-9]{8}"
              placeholder="+229 01XXXXXXXX"
              className="input-field"
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <span>Valider mon entrée</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
