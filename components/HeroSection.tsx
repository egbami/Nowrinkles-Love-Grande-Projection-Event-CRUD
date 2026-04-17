'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import dynamic from 'next/dynamic'

gsap.registerPlugin(ScrollTrigger)

// Three.js chargé uniquement côté client
const ThreeBackground = dynamic(() => import('./ThreeBackground'), { ssr: false })

interface HeroSectionProps {
  visible: boolean
}

export default function HeroSection({ visible }: HeroSectionProps) {
  const sectionRef  = useRef<HTMLElement>(null)
  const navRef      = useRef<HTMLDivElement>(null)
  const tagRef      = useRef<HTMLParagraphElement>(null)
  const line1Ref    = useRef<HTMLDivElement>(null)
  const line2Ref    = useRef<HTMLDivElement>(null)
  const dividerRef  = useRef<HTMLDivElement>(null)
  const metaRef     = useRef<HTMLDivElement>(null)
  const ctaRef      = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      // État initial
      gsap.set([navRef.current, tagRef.current, dividerRef.current, metaRef.current, ctaRef.current, scrollRef.current], { 
        autoAlpha: 0, 
        y: 20 
      })
      gsap.set([line1Ref.current, line2Ref.current], { yPercent: 100 })

      tl
        .to(navRef.current,      { autoAlpha: 1, y: 0, duration: 1 }, 0.2)
        .to(tagRef.current,      { autoAlpha: 1, y: 0, duration: 1 }, 0.4)
        .to([line1Ref.current, line2Ref.current], { 
          yPercent: 0, 
          duration: 1.4, 
          stagger: 0.15,
          ease: 'expo.out' 
        }, 0.5)
        .to(dividerRef.current,  { autoAlpha: 1, y: 0, duration: 1 }, 0.8)
        .to(metaRef.current,     { autoAlpha: 1, y: 0, duration: 1 }, 0.9)
        .to(ctaRef.current,      { autoAlpha: 1, y: 0, duration: 1 }, 1.1)
        .to(scrollRef.current,   { autoAlpha: 1, y: 0, duration: 1 }, 1.4)

      // Parallaxe au scroll sur le titre
      gsap.to([line1Ref.current, line2Ref.current], {
        yPercent: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    })

    return () => ctx.revert()
  }, [visible])

  const scrollToForm = () => {
    document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Three.js en arrière-plan */}
      <ThreeBackground />

      {/* ─── Navigation ─────────────────────────────────────── */}
      <div ref={navRef} className="relative z-10 flex items-center justify-between px-6 md:px-14 pt-8">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="Nowrinkles Love" fill className="object-contain" />
          </div>
          <span
            className="font-source font-700 text-xs tracking-[0.22em] uppercase hidden sm:block"
            style={{ color: 'var(--graphite)' }}
          >
            Nowrinkles Love
          </span>
        </div>

        <button
          onClick={scrollToForm}
          className="font-source text-xs tracking-[0.2em] uppercase px-5 py-2.5 border transition-all duration-300 hover:bg-graphite hover:text-bg"
          style={{
            borderColor: 'rgba(28,28,46,0.25)',
            color: 'var(--graphite)',
          }}
        >
          S&apos;inscrire
        </button>
      </div>

      {/* ─── Hero central ───────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-start justify-center flex-1 px-6 md:px-14 pb-20">

        {/* Tag évènement */}
        <p
          ref={tagRef}
          className="font-source text-[10px] md:text-xs tracking-[0.45em] uppercase mb-6"
          style={{ color: 'var(--lavender)' }}
        >
          ✦ Évènement chrétien · 2026
        </p>

        {/* Titre géant */}
        <div className="overflow-hidden leading-[0.85] mt-4 w-full">
          <div
            ref={line1Ref}
            className="font-playfair font-black uppercase tracking-tighter whitespace-nowrap"
            style={{
              fontSize: 'clamp(3rem, 11vw, 12rem)',
              color: 'var(--graphite)',
            }}
          >
            La Grande
          </div>
        </div>

        <div className="overflow-hidden leading-[0.85] ml-4 md:ml-[8vw] w-full">
          <div
            ref={line2Ref}
            className="font-playfair font-black uppercase italic tracking-tighter whitespace-nowrap"
            style={{
              fontSize: 'clamp(3rem, 11vw, 12rem)',
              WebkitTextStroke: '2px var(--lavender)',
              color: 'transparent',
            }}
          >
            Projection
          </div>
        </div>

        {/* Divider croix */}
        <div ref={dividerRef} className="cross-line w-full max-w-xs mt-8 mb-6">
          <span style={{ color: 'var(--lavender)', fontSize: '1rem' }}>✝</span>
        </div>

        {/* Métadonnées */}
        <div
          ref={metaRef}
          className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-10"
        >
          <div>
            <p className="font-source text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--muted)' }}>
              Inscriptions ouvertes
            </p>
            <p className="font-playfair font-semibold text-lg" style={{ color: 'var(--graphite)' }}>
              27 Avril — 31 Mai 2026
            </p>
          </div>
          <div
            className="hidden sm:block w-px self-stretch"
            style={{ background: 'rgba(28,28,46,0.15)' }}
          />
          <div>
            <p className="font-source text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--muted)' }}>
              Participants max
            </p>
            <p className="font-playfair font-semibold text-lg" style={{ color: 'var(--graphite)' }}>
              200 places disponibles
            </p>
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef}>
          <button onClick={scrollToForm} className="btn-primary">
            <span>Réserver ma place</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ─── Scroll indicator ───────────────────────────────── */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span
          className="font-source text-[9px] tracking-[0.35em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Défiler
        </span>
        <div
          className="w-px h-10 overflow-hidden"
          style={{ background: 'rgba(28,28,46,0.1)' }}
        >
          <div
            className="w-full h-full"
            style={{
              background: 'var(--lavender)',
              animation: 'scrollLine 1.8s ease-in-out infinite',
            }}
          />
        </div>
        <style jsx>{`
          @keyframes scrollLine {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(200%); }
          }
        `}</style>
      </div>
    </section>
  )
}
