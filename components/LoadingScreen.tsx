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
      gsap.set(logoRef.current, { autoAlpha: 0, scale: 0.8 })
      gsap.set(taglineRef.current, { autoAlpha: 0, y: 10 })
      gsap.set(titleRef.current?.children ? Array.from(titleRef.current.children) : [], { y: '100%', autoAlpha: 0 })
      gsap.set(progressRef.current, { autoAlpha: 0 })

      tl
        // Apparition logo
        .to(logoRef.current, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, 0.2)
        // Tagline
        .to(taglineRef.current, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.5)
        // Titre masking
        .to(titleRef.current?.children ? Array.from(titleRef.current.children) : [], { 
          y: '0%', 
          autoAlpha: 1, 
          duration: 1.2, 
          stagger: 0.1, 
          ease: 'expo.out' 
        }, 0.7)
        // Barre de progression
        .to(progressRef.current, { autoAlpha: 1, duration: 0.8 }, 1.2)
        // Remplissage de la barre + compteur
        .to(
          barRef.current,
          {
            width: '100%',
            duration: 2,
            ease: 'expo.inOut',
            onUpdate() {
              if (percentRef.current) {
                percentRef.current.textContent = `${Math.round(this.progress() * 100)}`
              }
            },
          },
          1.5
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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center w-full max-w-4xl">

        {/* Logo */}
        <div ref={logoRef} className="opacity-0">
          <div className="relative w-20 h-20 md:w-28 md:h-28">
            <Image
              src="/logo.png"
              alt="Nowrinkles Love"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Nowrinkles Love */}
        <p
          ref={taglineRef}
          className="font-source text-[10px] md:text-xs tracking-[0.45em] uppercase opacity-0"
          style={{ color: 'var(--muted)' }}
        >
          Présente
        </p>

        {/* Titre Immense (Lando Norris style) */}
        <div ref={titleRef} className="flex flex-col items-center leading-[0.85] opacity-0 w-full overflow-hidden">
          <span
            className="font-playfair font-bold uppercase tracking-tighter whitespace-nowrap"
            style={{
              fontSize: 'clamp(3rem, 11vw, 12rem)',
              color: 'var(--graphite)',
            }}
          >
            La Grande
          </span>
          <span
            className="font-playfair font-bold uppercase italic tracking-tighter whitespace-nowrap ml-4 md:ml-[8vw]"
            style={{
              fontSize: 'clamp(3rem, 11vw, 12rem)',
              color: 'var(--lavender)',
            }}
          >
            Projection
          </span>
        </div>

        {/* Barre de chargement */}
        <div ref={progressRef} className="w-[80%] max-w-md mt-10 opacity-0 flex flex-col items-center gap-4">
          <div
            className="relative h-1 w-full overflow-hidden rounded-full"
            style={{ background: 'rgba(42,42,42,0.1)' }}
          >
            <div
              ref={barRef}
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                background: 'var(--graphite)',
                width: '0%',
              }}
            />
          </div>
          <p
            className="font-playfair font-bold italic text-3xl"
            style={{ color: 'var(--graphite)' }}
          >
            <span ref={percentRef}>0</span>%
          </p>
        </div>
      </div>
    </div>
  )
}
