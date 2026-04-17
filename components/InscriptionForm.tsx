'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

gsap.registerPlugin(ScrollTrigger)

interface FormData {
  prenom: string
  nom: string
  whatsapp: string
}

interface Stats {
  total: number
  restants: number
  max: number
  ouvert: boolean
}

export default function InscriptionForm() {
  const sectionRef  = useRef<HTMLElement>(null)
  const headRef     = useRef<HTMLDivElement>(null)
  const cardRef     = useRef<HTMLDivElement>(null)
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  // Charge les stats au montage
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res  = await fetch('/api/stats')
        const data = await res.json()
        setStats(data)
      } catch {
        // silencieux si erreur réseau
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30_000) // refresh toutes les 30s
    return () => clearInterval(interval)
  }, [])

  // Animation d'entrée au scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([headRef.current, cardRef.current], { autoAlpha: 0, y: 50 })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        onEnter: () => {
          gsap.to(headRef.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' })
          gsap.to(cardRef.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 })
        },
      })
    })

    return () => ctx.revert()
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Une erreur est survenue.')
      } else {
        // Redirige vers la page de confirmation
        router.push(
          `/confirmation?prenom=${encodeURIComponent(data.prenom)}&nom=${encodeURIComponent(data.nom)}`
        )
        reset()
      }
    } catch {
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const pourcentage = stats ? Math.round((stats.total / stats.max) * 100) : 0

  return (
    <section
      id="inscription"
      ref={sectionRef}
      className="relative w-full py-28 md:py-40 px-6 md:px-14 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Fond décoratif */}
      <div
        className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lavender) 0%, transparent 60%)',
          transform: 'translate(20%, -20%)',
        }}
      />
      
      <div className="relative z-10 max-w-xl mx-auto">

        {/* En-tête */}
        <div ref={headRef} className="mb-14 text-center md:text-left">
          <p
            className="font-source text-[10px] tracking-[0.4em] uppercase mb-4"
            style={{ color: 'var(--muted)' }}
          >
            ✦ Rejoignez-nous
          </p>

          <h2
            className="font-playfair font-black leading-tight mb-4 tracking-tighter"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              color: 'var(--graphite)',
            }}
          >
            Réservez votre<br />
            <span style={{ color: 'var(--lavender)' }}>place</span> dès maintenant
          </h2>

          <p className="font-source text-base" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            Remplissez le formulaire ci-dessous. Votre inscription est gratuite
            et vous sera confirmée immédiatement.
          </p>
        </div>

        {/* Compteur de places */}
        {stats && (
          <div ref={undefined} className="mb-10">
            <div className="flex justify-between items-end mb-2">
              <p className="font-source text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
                Places réservées
              </p>
              <p className="font-playfair font-bold text-xl" style={{ color: 'var(--graphite)' }}>
                {stats.total}
                <span className="font-source font-normal text-sm" style={{ color: 'var(--muted)' }}>
                  /{stats.max}
                </span>
              </p>
            </div>
            {/* Barre de progression */}
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,42,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pourcentage}%`,
                  background: pourcentage > 80
                    ? 'linear-gradient(90deg, var(--graphite), #e57373)'
                    : 'linear-gradient(90deg, var(--lavender), var(--graphite))',
                }}
              />
            </div>
            <p className="mt-2 font-source text-xs" style={{ color: 'var(--muted)' }}>
              {stats.ouvert
                ? `Il reste ${stats.restants} place${stats.restants > 1 ? 's' : ''}`
                : '🔒 Les inscriptions sont closes'}
            </p>
          </div>
        )}

        {/* Formulaire */}
        <div ref={cardRef}>
          {stats?.ouvert === false ? (
            <div
              className="p-8 text-center border"
              style={{ borderColor: 'rgba(146,169,225,0.3)', background: 'rgba(146,169,225,0.05)' }}
            >
              <p className="font-playfair text-xl mb-2" style={{ color: 'var(--graphite)' }}>
                Inscriptions closes
              </p>
              <p className="font-source text-sm" style={{ color: 'var(--muted)' }}>
                Le nombre maximum de participants a été atteint ou la date limite est passée.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">

              {/* Prénom */}
              <div>
                <label
                  htmlFor="prenom"
                  className="block font-source text-xs tracking-[0.25em] uppercase mb-2"
                  style={{ color: 'var(--graphite)' }}
                >
                  Prénom *
                </label>
                <input
                  id="prenom"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Votre prénom"
                  className={`input-field ${errors.prenom ? 'error' : ''}`}
                  {...register('prenom', {
                    required: 'Le prénom est requis',
                    minLength: { value: 2, message: 'Minimum 2 caractères' },
                  })}
                />
                {errors.prenom && (
                  <p className="mt-1.5 font-source text-xs" style={{ color: '#e57373' }}>
                    {errors.prenom.message}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label
                  htmlFor="nom"
                  className="block font-source text-xs tracking-[0.25em] uppercase mb-2"
                  style={{ color: 'var(--graphite)' }}
                >
                  Nom *
                </label>
                <input
                  id="nom"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Votre nom de famille"
                  className={`input-field ${errors.nom ? 'error' : ''}`}
                  {...register('nom', {
                    required: 'Le nom est requis',
                    minLength: { value: 2, message: 'Minimum 2 caractères' },
                  })}
                />
                {errors.nom && (
                  <p className="mt-1.5 font-source text-xs" style={{ color: '#e57373' }}>
                    {errors.nom.message}
                  </p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="whatsapp"
                  className="block font-source text-xs tracking-[0.25em] uppercase mb-2"
                  style={{ color: 'var(--graphite)' }}
                >
                  Numéro WhatsApp *
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+229 00 00 00 00"
                  className={`input-field ${errors.whatsapp ? 'error' : ''}`}
                  {...register('whatsapp', {
                    required: 'Le numéro WhatsApp est requis',
                    pattern: {
                      value: /^\+?[\d\s\-().]{8,20}$/,
                      message: 'Numéro de téléphone invalide',
                    },
                  })}
                />
                {errors.whatsapp && (
                  <p className="mt-1.5 font-source text-xs" style={{ color: '#e57373' }}>
                    {errors.whatsapp.message}
                  </p>
                )}
                <p className="mt-1.5 font-source text-xs" style={{ color: 'var(--muted)' }}>
                  Ex : +229 97 00 00 00 · Béninois ou international
                </p>
              </div>

              {/* Mention */}
              <p className="font-source text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                En vous inscrivant, vous acceptez que vos informations soient utilisées
                exclusivement dans le cadre de cet événement. Aucune donnée ne sera partagée
                à des tiers.
              </p>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary self-start mt-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Inscription en cours…</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer mon inscription</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Logo bas de section */}
        <div className="mt-20 flex items-center gap-4 opacity-30">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>
          <div className="cross-line flex-1">
            <span />
          </div>
        </div>
      </div>
    </section>
  )
}
