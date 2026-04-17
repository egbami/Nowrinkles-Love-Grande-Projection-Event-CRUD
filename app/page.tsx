'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import LoadingScreen from '@/components/LoadingScreen'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import HeroSection from '@/components/HeroSection'

// Import dynamique (SSR désactivé pour les composants avec animations)
const InscriptionForm = dynamic(() => import('@/components/InscriptionForm'), {
  ssr: false,
})

export default function HomePage() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {/* Écran de chargement */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Contenu principal */}
      <SmoothScrollProvider>
        <main
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          {/* Section 1 : Hero */}
          <HeroSection visible={loaded} />

          {/* Séparateur */}
          <div
            className="mx-6 md:mx-14"
            style={{ height: '1px', background: 'rgba(28,28,46,0.08)' }}
          />

          {/* Section 2 : À propos / Citation */}
          <AboutSection />

          {/* Section 3 : Formulaire d'inscription */}
          <InscriptionForm />

          {/* Footer */}
          <Footer />
        </main>
      </SmoothScrollProvider>
    </>
  )
}

/* ─── Section À propos ──────────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section
      className="py-24 md:py-36 px-6 md:px-14"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <p
          className="font-source text-[10px] tracking-[0.4em] uppercase mb-8"
          style={{ color: 'var(--lavender)' }}
        >
          ✦ L&apos;événement
        </p>

        {/* Citation biblique */}
        <blockquote className="mb-14">
          <p
            className="font-playfair italic leading-relaxed"
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
              color: 'var(--graphite)',
            }}
          >
            &ldquo; Car Dieu a tant aimé le monde qu&apos;il a donné son Fils unique,
            afin que quiconque croit en lui ne périsse point, mais qu&apos;il ait
            la vie éternelle. &rdquo;
          </p>
          <footer
            className="mt-4 font-source text-sm tracking-widest uppercase"
            style={{ color: 'var(--muted)' }}
          >
            — Jean 3:16
          </footer>
        </blockquote>

        <div className="cross-line max-w-xs mx-auto mb-14">
          <span style={{ color: 'var(--lavender)', fontSize: '1rem' }}>✝</span>
        </div>

        {/* Description */}
        <p
          className="font-source text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--muted)', lineHeight: 1.9 }}
        >
          <strong style={{ color: 'var(--graphite)' }}>La Grande Projection</strong> est
          un événement chrétien organisé par{' '}
          <strong style={{ color: 'var(--graphite)' }}>Nowrinkles Love</strong>.
          Un moment unique de communion, de foi et de partage.
          Inscrivez-vous dès maintenant — les places sont limitées à{' '}
          <strong style={{ color: 'var(--lavender)' }}>200 participants</strong>.
        </p>

        {/* Infos pratiques */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { label: 'Inscription', value: '27 Avr — 31 Mai', icon: '✦' },
            { label: 'Places disponibles', value: '200 max', icon: '✦' },
            { label: 'Entrée', value: 'Sur invitation QR', icon: '✦' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center">
              <div className="text-2xl mb-3" style={{ color: 'var(--lavender)' }}>{icon}</div>
              <p
                className="font-source text-[10px] tracking-[0.3em] uppercase mb-1"
                style={{ color: 'var(--muted)' }}
              >
                {label}
              </p>
              <p
                className="font-playfair font-semibold text-lg"
                style={{ color: 'var(--graphite)' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="py-10 px-6 md:px-14 text-center border-t"
      style={{
        borderColor: 'rgba(28,28,46,0.08)',
        background: 'var(--bg)',
      }}
    >
      <p
        className="font-source text-xs tracking-widest uppercase"
        style={{ color: 'var(--muted)' }}
      >
        © 2026 Nowrinkles Love — Fait avec ✝ à Cotonou, Bénin
      </p>
    </footer>
  )
}
