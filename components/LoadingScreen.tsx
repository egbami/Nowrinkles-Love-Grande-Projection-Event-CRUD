'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'

interface LoadingScreenProps {
  onComplete: () => void
}

const RAY_COUNT = 10

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const logoRef       = useRef<HTMLDivElement>(null)
  const taglineRef    = useRef<HTMLParagraphElement>(null)
  const titleRef      = useRef<HTMLDivElement>(null)
  const progressRef   = useRef<HTMLDivElement>(null)
  const barRef        = useRef<HTMLDivElement>(null)
  const percentRef    = useRef<HTMLSpanElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // État initial
      gsap.set([logoRef.current, taglineRef.current, titleRef.current, progressRef.current], {
        autoAlpha: 0,
        y: 24,
      })

      tl
        // Apparition logo
        .to(logoRef.current, { autoAlpha: 1, y: 0, duration: 1 }, 0.4)
        // Tagline
        .to(taglineRef.current, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.9)
        // Titre
        .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.2)
        // Barre de progression
        .to(progressRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.6)
        // Remplissage de la barre + compteur
        .to(
          barRef.current,
          {
            width: '100%',
            duration: 2,
            ease: 'power1.inOut',
            onUpdate() {
              if (percentRef.current) {
                percentRef.current.textContent = `${Math.round(this.progress() * 100)}%`
              }
            },
          },
          1.8
        )
        // Slide vers le haut → révèle la page
        .to(
          containerRef.current,
          {
            yPercent: -100,
            duration: 1,
            ease: 'power4.inOut',
            onComplete,
          },
          '+=0.4'
        )
    })

    return () => ctx.revert()
  }, [mounted, onComplete])

  if (!mounted) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--loader-bg)' }}
    >
      {/* Rayons lumineux décoratifs */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        {Array.from({ length: RAY_COUNT }).map((_, i) => (
          <div
            key={i}
            className="loader-ray"
            style={{
              height: `${35 + Math.random() * 30}vh`,
              transform: `translate(-50%, 0) rotate(${(360 / RAY_COUNT) * i}deg)`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">

        {/* Logo */}
        <div ref={logoRef}>
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <Image
              src="/logo.png"
              alt="Nowrinkles Love"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(201,162,39,0.5)]"
              priority
            />
          </div>
        </div>

        {/* Nowrinkles Love */}
        <p
          ref={taglineRef}
          className="font-source text-[10px] md:text-xs tracking-[0.45em] uppercase"
          style={{ color: 'var(--lavender)' }}
        >
          Nowrinkles Love présente
        </p>

        {/* Titre */}
        <div ref={titleRef} className="flex flex-col items-center gap-1">
          <span
            className="font-playfair font-bold leading-none"
            style={{
              fontSize: 'clamp(2.8rem, 10vw, 6rem)',
              color: 'var(--bg)',
            }}
          >
            La Grande
          </span>
          <span
            className="font-playfair font-bold italic leading-none"
            style={{
              fontSize: 'clamp(2.8rem, 10vw, 6rem)',
              color: 'var(--gold)',
            }}
          >
            Projection
          </span>
        </div>

        {/* Barre de chargement */}
        <div ref={progressRef} className="w-56 md:w-72 mt-6">
          <div
            className="relative h-px overflow-hidden"
            style={{ background: 'rgba(255,255,228,0.1)' }}
          >
            <div
              ref={barRef}
              className="absolute left-0 top-0 h-full"
              style={{
                background: 'linear-gradient(90deg, var(--lavender), var(--gold))',
                width: '0%',
              }}
            />
          </div>
          <p
            className="mt-2 text-center font-source text-[10px] tracking-widest"
            style={{ color: 'rgba(255,255,228,0.3)' }}
          >
            <span ref={percentRef}>0%</span>
          </p>
        </div>
      </div>
    </div>
  )
}
