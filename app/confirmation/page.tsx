'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const prenom = searchParams.get('prenom') || 'vous'
  const nom    = searchParams.get('nom')    || ''

  const containerRef = useRef<HTMLDivElement>(null)
  const circleRef    = useRef<HTMLDivElement>(null)
  const checkRef     = useRef<HTMLDivElement>(null)
  const textRef      = useRef<HTMLDivElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      gsap.set([circleRef.current, checkRef.current, textRef.current, cardRef.current], {
        autoAlpha: 0,
        scale: 0.8,
        y: 20,
      })

      tl
        .to(circleRef.current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8 }, 0.3)
        .to(checkRef.current,  { autoAlpha: 1, scale: 1, y: 0, duration: 0.6 }, 0.7)
        .to(textRef.current,   { autoAlpha: 1, scale: 1, y: 0, duration: 0.8 }, 1.0)
        .to(cardRef.current,   { autoAlpha: 1, scale: 1, y: 0, duration: 0.8 }, 1.2)
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
      style={{ background: 'var(--bg)' }}
    >
      {/* Logo */}
      <div className="relative w-12 h-12 mb-10 opacity-60">
        <Image src="/logo.png" alt="Nowrinkles Love" fill className="object-contain" />
      </div>

      {/* Icône de succès */}
      <div ref={circleRef} className="relative mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--lavender-dim), var(--gold-dim))',
            border: '2px solid rgba(201,162,39,0.3)',
          }}
        >
          <div ref={checkRef} className="text-4xl">✓</div>
        </div>
        {/* Halo */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'rgba(201,162,39,0.1)',
            animationDuration: '2s',
          }}
        />
      </div>

      {/* Message principal */}
      <div ref={textRef} className="mb-8">
        <p
          className="font-source text-[10px] tracking-[0.4em] uppercase mb-4"
          style={{ color: 'var(--lavender)' }}
        >
          ✦ Inscription confirmée
        </p>
        <h1
          className="font-playfair font-bold mb-4"
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: 'var(--graphite)',
            lineHeight: 1.1,
          }}
        >
          Bienvenue,<br />
          <span style={{ color: 'var(--gold)' }}>
            {prenom} {nom}
          </span> !
        </h1>
        <p
          className="font-source text-base max-w-md mx-auto leading-relaxed"
          style={{ color: 'var(--muted)', lineHeight: 1.8 }}
        >
          Votre inscription à <strong style={{ color: 'var(--graphite)' }}>La Grande Projection</strong> est
          bien enregistrée. Conservez ce message — un QR Code vous sera communiqué
          avant le jour de l&apos;événement pour accéder à la salle.
        </p>
      </div>

      {/* Carte info */}
      <div
        ref={cardRef}
        className="p-6 max-w-sm w-full mb-10"
        style={{
          border: '1px solid rgba(146,169,225,0.3)',
          background: 'rgba(146,169,225,0.04)',
        }}
      >
        <p
          className="font-source text-xs tracking-[0.3em] uppercase mb-4"
          style={{ color: 'var(--lavender)' }}
        >
          Ce qui vous attend
        </p>
        <ul className="text-left flex flex-col gap-3">
          {[
            'Votre inscription est enregistrée en base de données',
            'Un QR Code unique sera généré après clôture des inscriptions',
            'Le jour J, scannez-le à l\'entrée pour accéder à l\'événement',
          ].map((item, i) => (
            <li key={i} className="flex gap-3 font-source text-sm" style={{ color: 'var(--muted)' }}>
              <span style={{ color: 'var(--gold)', flexShrink: 0 }}>✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Citation */}
      <blockquote
        className="font-playfair italic text-lg max-w-xs mb-10"
        style={{ color: 'rgba(28,28,46,0.45)' }}
      >
        &ldquo; Que la paix de Dieu soit avec vous. &rdquo;
      </blockquote>

      {/* Retour */}
      <Link
        href="/"
        className="font-source text-xs tracking-[0.3em] uppercase px-6 py-3 border transition-all duration-300 hover:border-gold"
        style={{
          borderColor: 'rgba(28,28,46,0.2)',
          color: 'var(--graphite)',
        }}
      >
        ← Retour à l&apos;accueil
      </Link>

      {/* Footer */}
      <p
        className="mt-16 font-source text-xs tracking-widest uppercase"
        style={{ color: 'rgba(28,28,46,0.3)' }}
      >
        Nowrinkles Love · 2026
      </p>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
